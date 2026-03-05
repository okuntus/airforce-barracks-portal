import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";

export default function Home() {
  console.log("Home component rendered, db =", db);
  
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      {!db ? (
        <div style={{ padding: "20px", backgroundColor: "#fff3cd", textAlign: "center", borderRadius: "8px" }}>
          <h2 style={{ color: "#d32f2f", marginTop: 0 }}>⚙️ Firebase Configuration Needed</h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
            Please add your Firebase configuration in <strong>src/firebase.js</strong>
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Currently showing placeholder values. Add your real Firebase credentials to see the portal.
          </p>
        </div>
      ) : (
        <>
          <h1 style={{ textAlign: "center" }}>
            🛩 Airforce Barracks Community Portal
          </h1>

          <p style={{ textAlign: "center", marginBottom: "40px" }}>
            Stay informed with the latest alerts, announcements and events.
          </p>

          {/* ALERTS SECTION */}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ color: "red" }}>🚨 Latest Alerts</h2>
          </section>

          {/* ANNOUNCEMENTS SECTION */}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ color: "#003366" }}>📢 Announcements</h2>
          </section>

          {/* EVENTS SECTION */}
          <section>
            <h2 style={{ color: "green" }}>📅 Upcoming Events</h2>
          </section>
        </>
      )}
    </div>
  );
}
