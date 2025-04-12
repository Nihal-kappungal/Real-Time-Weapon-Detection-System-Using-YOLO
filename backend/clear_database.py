from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime  # Added this import

# Initialize Flask app (same as in app.py)
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Adjust path if needed
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Detection model (must match app.py)
class Detection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    weapon_type = db.Column(db.String(50))
    location = db.Column(db.String(50))
    screenshot_path = db.Column(db.String(200))

def clear_detections():
    with app.app_context():  # Required for database operations
        try:
            num_deleted = db.session.query(Detection).delete()  # Delete all rows
            db.session.commit()
            print(f"Successfully deleted {num_deleted} detection records.")
        except Exception as e:
            db.session.rollback()
            print(f"Error clearing database: {str(e)}")

if __name__ == '__main__':
    clear_detections()