from flask import Flask, Response, send_from_directory
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import os
from datetime import datetime, timedelta
from twilio.rest import Client  
from threading import Thread  


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="http://localhost:3000") 

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# create a Twilio account and get your credentials
# https://www.twilio.com/console
TWILIO_ACCOUNT_SID = 'your_account_sid'  # Twilio Account SID
TWILIO_AUTH_TOKEN = 'your_auth_token'    # Twilio Auth Token
TWILIO_PHONE_NUMBER = '+1234567890'      # Twilio Phone Number (from which SMS will be sent)     
USER_PHONE_NUMBER = '+0987654321'        # User's phone number (to which SMS will be sent)        

# Initialize Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
# Function to send SMS synchronously
def send_sms(message):
    if client:
        try:
            client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=USER_PHONE_NUMBER
            )
            print(f"SMS sent: {message}")
        except Exception as e:
            print(f"Error sending SMS: {e}")
    else:
        print("Twilio client not initialized. SMS not sent.")

# Function to send SMS asynchronously
def send_sms_async(message):
    Thread(target=send_sms, args=(message,)).start()


model = YOLO('models/my_model.pt')
# cap = cv2.VideoCapture(0)
cap = cv2.VideoCapture('../backend/guns1.mp4')
# cap = cv2.VideoCapture('../backend/explosive2.mp4')
# cap = cv2.VideoCapture('../backend/knives1.mp4')

class Detection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    weapon_type = db.Column(db.String(50))
    location = db.Column(db.String(50))
    screenshot_path = db.Column(db.String(200))

    def __repr__(self):
        return f"<Detection {self.id}: {self.weapon_type} at {self.location}>"

with app.app_context():
    db.create_all()

@app.route('/stream')
def stream():
    last_detection_time = None
    cooldown_period = timedelta(seconds=60) # 1 minute cooldown

    def generate():
        nonlocal last_detection_time
        while cap.isOpened():
        # while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame from video capture.")
                break
            results = model(frame, conf=0.5)
            annotated_frame = results[0].plot()

            # ------------------ importent change in case of video sampple is provide  ------------------

            if not ret:  # Video ended, restart from the beginning
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            # ------------------ change End here.  ------------------

            weapon_classes = ['gun', 'knife', 'suspicions_object','explosive']  
            detected_classes = [results[0].names[int(cls)] for cls in results[0].boxes.cls]
            print("Detected classes:", detected_classes)
            weapon_detections = [cls for cls in detected_classes if cls in weapon_classes]

            current_time = datetime.now()
            if weapon_detections and (last_detection_time is None or (current_time - last_detection_time) > cooldown_period):
                timestamp = current_time.strftime("%Y%m%d_%H%M%S")
                screenshot_path = f"screenshots/{timestamp}.jpg"
                cv2.imwrite(screenshot_path, annotated_frame)
                for weapon_type in weapon_detections:
                    detection = Detection(weapon_type=weapon_type, location="Main Entrance", screenshot_path=screenshot_path)
                    with app.app_context():
                        db.session.add(detection)
                        db.session.commit()
                        socketio.emit('detection', {
                            'message': f'{weapon_type} detected at {detection.location}',
                            'timestamp': detection.timestamp.isoformat(),
                            'screenshot': f'/screenshots/{os.path.basename(screenshot_path)}'
                        })
                # --------------- SMS sending ----------------
                # Send SMS for the detection event
                weapons_list = ", ".join(weapon_detections)
                formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
                message = f"⚠︎ Weapons detected ⚠︎ : {weapons_list} at Main Entrance on {formatted_time}"
                send_sms_async(message)  # Send SMS asynchronously
                 # --------------- SMS Ending----------------
                last_detection_time = current_time

            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def home():
    return "Welcome to the Weapon Detection System"

@app.route('/screenshots/<filename>')
def serve_screenshot(filename):
    return send_from_directory('screenshots', filename)

@app.route('/api/history')
def get_history():
    try:
        detections = Detection.query.all()
        return {
            'detections': [
                {'id': d.id, 'date': d.timestamp.isoformat(), 'weapon_type': d.weapon_type,
                 'location': d.location, 'screenshot': f'/screenshots/{os.path.basename(d.screenshot_path)}'}
                for d in detections
            ]
        }
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/api/analysis/weapon-distribution')
def weapon_distribution():
    try:
        distributions = db.session.query(Detection.weapon_type, db.func.count(Detection.id)).group_by(Detection.weapon_type).all()
        return {'labels': [d[0] for d in distributions], 'data': [d[1] for d in distributions]}
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    os.makedirs('screenshots', exist_ok=True)
    if not cap.isOpened():
        print("Error: Could not open video capture device.")
    else:
        print("Video capture device opened successfully.")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
