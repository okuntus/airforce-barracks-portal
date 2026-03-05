import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!db) {
    return (
      <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#fff3cd", color: "#333" }}>
        <h2 style={{ color: "#d32f2f" }}>⚙️ Firebase Configuration Needed</h2>
        <p>Please configure Firebase in src/firebase.js to load events.</p>
      </div>
    );
  }

  useEffect(() => {
    async function fetchEvents() {
      try {
        const q = query(
          collection(db, "events"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading events...</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>📅 Community Events - Airforce Barracks</h1>

      {events.length === 0 ? (
        <p>No upcoming events.</p>
      ) : (
        events.map(event => (
          <div
            key={event.id}
            style={{
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              backgroundColor: "#f4f6f9",
              borderLeft: "6px solid #003366"
            }}
          >
            <h3>{event.title}</h3>
            <p>📍 Location: {event.location}</p>
            <p>📅 Date: {event.date}</p>
            <p>⏰ Time: {event.time}</p>
          </div>
        ))
      )}
    </div>
  );
}
