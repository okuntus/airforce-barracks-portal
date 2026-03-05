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

export default function Event() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Events
  useEffect(() => {
    fetchEvents();
  }, []);

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

  // 🔹 Add Event
  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !location || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "events"), {
        title,
        location,
        date,
        time,
        createdAt: serverTimestamp()
      });

      alert("Event added successfully!");

      // Clear form
      setTitle("");
      setLocation("");
      setDate("");
      setTime("");

      fetchEvents(); // Refresh list
    } catch (error) {
      console.error("Error adding event:", error);
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>📅 Community Events - Airforce Barracks</h1>

      {/* 🔵 Add Event Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
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
          Add Event
        </button>
      </form>

      {/* 🔵 Display Events */}
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
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
