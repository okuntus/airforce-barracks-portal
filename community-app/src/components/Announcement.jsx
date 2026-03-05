import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      const querySnapshot = await getDocs(collection(db, "announcements"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(data);
    }

    fetchAnnouncements();
  }, []);

  return (
    <div>
      <h1>Announcements</h1>

      {announcements.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.message}</p>
          <small>{item.date}</small>
        </div>
      ))}
    </div>
  );
}