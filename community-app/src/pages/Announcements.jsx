import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!db) {
    return (
      <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#fff3cd", color: "#333" }}>
        <h2 style={{ color: "#d32f2f" }}>⚙️ Firebase Configuration Needed</h2>
        <p>Please configure Firebase in src/firebase.js to load announcements.</p>
      </div>
    );
  }

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const q = query(
          collection(db, "announcements"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading announcements...</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>📢 Announcements - Airforce Barracks</h1>

      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map(item => (
          <div
            key={item.id}
            style={{
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              backgroundColor: "#f4f6f9",
              borderLeft: "6px solid #003366"
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <small>
              Posted: {item.date ? item.date : "Recent"}
            </small>
          </div>
        ))
      )}
    </div>
  );
}
