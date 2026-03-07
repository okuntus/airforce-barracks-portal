import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { CalendarDays, Inbox, Megaphone, UserCircle2 } from "lucide-react";
import { mockAnnouncements } from "../utils/mockData";
import './Pages.css';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use mock data instantly if Firebase is not configured
    if (!db) {
      return;
    }

  setLoading(true);

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

        setAnnouncements(data.length > 0 ? data : mockAnnouncements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        // Fall back to mock data on error
        setAnnouncements(mockAnnouncements);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-wrapper">
          <h1 className="page-title">
            <span className="page-icon"><Megaphone size={34} strokeWidth={2} /></span>
            Announcements
          </h1>
          <p className="page-subtitle">
            Stay updated with the latest community news and important updates
          </p>
        </div>
        <Badge variant="primary" size="lg">{announcements.length} Total</Badge>
      </div>

      {/* Announcements List */}
      <div className="content-list">
        {announcements.length === 0 ? (
          <Card padding="lg">
            <div className="empty-state">
              <span className="empty-icon"><Inbox size={46} strokeWidth={2} /></span>
              <h3>No Announcements</h3>
              <p>There are no announcements at this time. Check back later!</p>
            </div>
          </Card>
        ) : (
          announcements.map(item => (
            <Card key={item.id} hover padding="lg" className="announcement-card">
              <div className="announcement-header">
                <h3 className="announcement-title">{item.title}</h3>
                <div className="announcement-badges">
                  <Badge variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'info'} size="sm">
                    {item.priority || 'info'}
                  </Badge>
                  <Badge variant="default" size="sm">{item.category || 'general'}</Badge>
                </div>
              </div>
              <p className="announcement-message">{item.content}</p>
              <div className="announcement-footer">
                <span className="announcement-author">
                  <UserCircle2 size={14} strokeWidth={2} /> {item.author || 'Admin'}
                </span>
                <span className="announcement-date">
                  <CalendarDays size={14} strokeWidth={2} /> {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : item.createdAt?.toDate?.().toLocaleDateString() || 'Recent'}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
