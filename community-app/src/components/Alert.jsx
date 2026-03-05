import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("low");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Alerts
  useEffect(() => {
    fetchAlerts();
  }, []);

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

  // 🔹 Add Alert
  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !message || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "alerts"), {
        title,
        message,
        severity,
        date,
        status: "active",
        createdAt: serverTimestamp()
      });

      alert("Alert added successfully!");

      // Clear form
      setTitle("");
      setMessage("");
      setSeverity("low");
      setDate("");

      fetchAlerts(); // Refresh alerts
    } catch (error) {
      console.error("Error adding alert:", error);
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>🚨 Emergency Alerts - Airforce Barracks</h1>

      {/* 🔴 Add Alert Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Alert Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <textarea
          placeholder="Alert Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <select
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#003366",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Add Alert
        </button>
      </form>

      {/* 🔴 Display Alerts */}
      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
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
