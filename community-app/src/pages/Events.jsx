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
import { CalendarDays, Inbox, MapPin, Users } from "lucide-react";
import { mockEvents } from "../utils/mockData";
import './Pages.css';

export default function Events() {
  const [events, setEvents] = useState(mockEvents);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use mock data instantly if Firebase is not configured
    if (!db) {
      return;
    }

  setLoading(true);

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

        setEvents(data.length > 0 ? data : mockEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        // Fall back to mock data on error
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
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
            <span className="page-icon"><CalendarDays size={34} strokeWidth={2} /></span>
            Community Events
          </h1>
          <p className="page-subtitle">
            Upcoming activities and gatherings in the barracks community
          </p>
        </div>
        <Badge variant="success" size="lg">{events.length} Events</Badge>
      </div>

      {/* Events Grid */}
      <div className="content-grid">
        {events.length === 0 ? (
          <Card padding="lg">
            <div className="empty-state">
              <span className="empty-icon"><Inbox size={46} strokeWidth={2} /></span>
              <h3>No Events Scheduled</h3>
              <p>There are no upcoming events at this time. Check back soon!</p>
            </div>
          </Card>
        ) : (
          events.map(event => (
            <Card key={event.id} hover padding="lg" className="event-card">
              <div className="event-header">
                <Badge variant="primary" size="md">{event.category || 'event'}</Badge>
              </div>
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-details">
                <div className="event-detail-item">
                  <span className="detail-icon"><CalendarDays size={18} strokeWidth={2} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {event.date instanceof Date ? event.date.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : event.date?.toDate?.().toLocaleDateString() || 'TBA'}
                    </span>
                  </div>
                </div>
                <div className="event-detail-item">
                  <span className="detail-icon"><MapPin size={18} strokeWidth={2} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{event.location || 'Location TBA'}</span>
                  </div>
                </div>
                <div className="event-detail-item">
                  <span className="detail-icon"><Users size={18} strokeWidth={2} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Organizer</span>
                    <span className="detail-value">{event.organizer || 'Base Command'}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
