import { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

export default function Admin() {
  if (!db) {
    return (
      <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#fff3cd", color: "#333" }}>
        <h2 style={{ color: "#d32f2f" }}>⚙️ Firebase Configuration Needed</h2>
        <p>Please configure Firebase in src/firebase.js to access admin features.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("alerts");

  // ALERT STATES
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("low");
  const [alertDate, setAlertDate] = useState("");

  // EVENT STATES
  const [eventTitle, setEventTitle] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  // ANNOUNCEMENT STATES
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  // 🔴 Add Alert
  async function addAlert(e) {
    e.preventDefault();

    await addDoc(collection(db, "alerts"), {
      title: alertTitle,
      message: alertMessage,
      severity: alertSeverity,
      date: alertDate,
      status: "active",
      createdAt: serverTimestamp()
    });

    alert("Alert added successfully!");
    setAlertTitle("");
    setAlertMessage("");
    setAlertSeverity("low");
    setAlertDate("");
  }

  // 🔵 Add Event
  async function addEvent(e) {
    e.preventDefault();

    await addDoc(collection(db, "events"), {
      title: eventTitle,
      location: eventLocation,
      date: eventDate,
      time: eventTime,
      createdAt: serverTimestamp()
    });

    alert("Event added successfully!");
    setEventTitle("");
    setEventLocation("");
    setEventDate("");
    setEventTime("");
  }

  // 🟢 Add Announcement
  async function addAnnouncement(e) {
    e.preventDefault();

    await addDoc(collection(db, "announcements"), {
      title: announcementTitle,
      message: announcementMessage,
      createdAt: serverTimestamp()
    });

    alert("Announcement added successfully!");
    setAnnouncementTitle("");
    setAnnouncementMessage("");
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>🛡️ Admin Dashboard - Airforce Barracks</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("alerts")}>Alerts</button>
        <button onClick={() => setActiveTab("events")}>Events</button>
        <button onClick={() => setActiveTab("announcements")}>
          Announcements
        </button>
      </div>

      {/* ALERT FORM */}
      {activeTab === "alerts" && (
        <form onSubmit={addAlert}>
          <h2>Add Alert</h2>
          <input
            type="text"
            placeholder="Title"
            value={alertTitle}
            onChange={e => setAlertTitle(e.target.value)}
          /><br /><br />

          <textarea
            placeholder="Message"
            value={alertMessage}
            onChange={e => setAlertMessage(e.target.value)}
          /><br /><br />

          <select
            value={alertSeverity}
            onChange={e => setAlertSeverity(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select><br /><br />

          <input
            type="date"
            value={alertDate}
            onChange={e => setAlertDate(e.target.value)}
          /><br /><br />

          <button type="submit">Post Alert</button>
        </form>
      )}

      {/* EVENT FORM */}
      {activeTab === "events" && (
        <form onSubmit={addEvent}>
          <h2>Add Event</h2>
          <input
            type="text"
            placeholder="Title"
            value={eventTitle}
            onChange={e => setEventTitle(e.target.value)}
          /><br /><br />

          <input
            type="text"
            placeholder="Location"
            value={eventLocation}
            onChange={e => setEventLocation(e.target.value)}
          /><br /><br />

          <input
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
          /><br /><br />

          <input
            type="time"
            value={eventTime}
            onChange={e => setEventTime(e.target.value)}
          /><br /><br />

          <button type="submit">Post Event</button>
        </form>
      )}

      {/* ANNOUNCEMENT FORM */}
      {activeTab === "announcements" && (
        <form onSubmit={addAnnouncement}>
          <h2>Add Announcement</h2>
          <input
            type="text"
            placeholder="Title"
            value={announcementTitle}
            onChange={e => setAnnouncementTitle(e.target.value)}
          /><br /><br />

          <textarea
            placeholder="Message"
            value={announcementMessage}
            onChange={e => setAnnouncementMessage(e.target.value)}
          /><br /><br />

          <button type="submit">Post Announcement</button>
        </form>
      )}
    </div>
  );
}
