// "use client";
// import { useState, useEffect } from "react";
// import { Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   PointElement,
// } from "chart.js";
// import axios from "axios";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const Analysis = () => {
//   const [weaponData, setWeaponData] = useState({ labels: [], datasets: [] });

//   useEffect(() => {
//     fetchAnalysisData();
//   }, []);

//   const fetchAnalysisData = async () => {
//     try {
//       const weaponRes = await axios.get(
//         "http://localhost:5000/api/analysis/weapon-distribution"
//       );
//       setWeaponData({
//         labels: weaponRes.data.labels,
//         datasets: [
//           {
//             label: "Weapon Types Detected",
//             data: weaponRes.data.data,
//             backgroundColor: [
//               "rgba(255, 99, 132, 0.6)",
//               "rgba(54, 162, 235, 0.6)",
//               "rgba(255, 206, 86, 0.6)",
//               "rgba(75, 192, 192, 0.6)",
//             ],
//             borderColor: [
//               "rgba(255, 99, 132, 1)",
//               "rgba(54, 162, 235, 1)",
//               "rgba(255, 206, 86, 1)",
//               "rgba(75, 192, 192, 1)",
//             ],
//             borderWidth: 1,
//           },
//         ],
//       });
//     } catch (error) {
//       console.error("Error fetching analysis data:", error);
//     }
//   };

//   return (
//     <div className="flex-1 p-4 overflow-auto">
//       <h2 className="text-2xl font-semibold mb-4">Detection Analysis</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-2">Weapon Types</h3>
//           <Bar data={weaponData} />
//         </div>
//         {/* Add Line chart for trends when backend endpoint is implemented */}
//       </div>
//     </div>
//   );
// };

// export default Analysis;

"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2"; // Removed Line since it’s not used
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analysis = () => {
  const [weaponData, setWeaponData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null); // Added state for error handling

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const weaponRes = await axios.get(
        "http://localhost:5000/api/analysis/weapon-distribution"
      );
      setWeaponData({
        labels: weaponRes.data.labels || [], // Fallback to empty array if no labels
        datasets: [
          {
            label: "Weapon Types Detected",
            data: weaponRes.data.data || [], // Fallback to empty array if no data
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
            ].slice(0, weaponRes.data.data.length), // Adjust colors dynamically
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
            ].slice(0, weaponRes.data.data.length),
            borderWidth: 1,
          },
        ],
      });
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      setError("Failed to load analysis data. Please try again later.");
    }
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <h2 className="text-2xl font-semibold mb-4">Detection Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Weapon Types</h3>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Bar data={weaponData} />
          )}
        </div>
        {/* Add Line chart for trends when backend endpoint is implemented */}
      </div>
    </div>
  );
};

export default Analysis;
