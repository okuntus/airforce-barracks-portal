import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!db) {
    return (
      <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#fff3cd", color: "#333" }}>
        <h2 style={{ color: "#d32f2f" }}>⚙️ Firebase Configuration Needed</h2>
        <p>Please configure Firebase in src/firebase.js to load alerts.</p>
      </div>
    );
  }

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const q = query(
          collection(db, "alerts"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAlerts(data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading alerts...</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>🚨 Emergency Alerts - Airforce Barracks</h1>

      {alerts.length === 0 ? (
        <p>No active alerts.</p>
      ) : (
        alerts.map(alert => (
          <div
            key={alert.id}
            style={{
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              borderLeft: "6px solid",
              backgroundColor:
                alert.severity === "high"
                  ? "#ffcccc"
                  : alert.severity === "medium"
                  ? "#fff3cd"
                  : "#e2f0ff",
              borderColor:
                alert.severity === "high"
                  ? "red"
                  : alert.severity === "medium"
                  ? "orange"
                  : "#007bff"
            }}
          >
            <h3>{alert.title}</h3>
            <p>{alert.message}</p>
            <small>
              Severity: {alert.severity} | Date: {alert.date}
            </small>
          </div>
        ))
      )}
    </div>
  );
}
