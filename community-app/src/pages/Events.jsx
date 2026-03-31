import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { CalendarDays, Clock, Inbox, MapPin, RefreshCw, Users } from "lucide-react";
import { eventsApi } from "../services/api";
import './Pages.css';

const CATEGORY_VARIANT = {
  ceremony: 'primary', sports: 'success', training: 'warning',
  social: 'info', operations: 'error', education: 'primary',
  community: 'success', general: 'default'
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true); setError('');
    try { setEvents(await eventsApi.getAll()); }
    catch (err) { setError(err.message || 'Failed to load events.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const categories = ['all', ...new Set(events.map(e => e.category || 'general'))];
  const filtered = filter === 'all' ? events : events.filter(e => (e.category || 'general') === filter);

  // Split into upcoming and past
  const now = new Date();
  const upcoming = filtered.filter(e => new Date(e.date) >= now);
  const past = filtered.filter(e => new Date(e.date) < now);

  if (loading) return (
    <div className="page-container">
      <div className="loading-state"><div className="loading-spinner"></div><p>Loading events...</p></div>
    </div>
  );

  if (error) return (
    <div className="page-container">
      <div className="error-banner">{error} <button className="retry-btn" onClick={load}>Retry</button></div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-wrapper">
          <h1 className="page-title">
            <span className="page-icon"><CalendarDays size={30} strokeWidth={2} /></span>
            Community Events
          </h1>
          <p className="page-subtitle">Upcoming activities and gatherings in the barracks community</p>
        </div>
        <div className="page-header-actions">
          <Badge variant="success" size="lg">{upcoming.length} Upcoming</Badge>
          <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
        </div>
      </div>

      <div className="filter-bar">
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${filter === cat ? 'filter-btn-active' : ''}`} onClick={() => setFilter(cat)}>
            {cat === 'all' ? `All (${events.length})` : `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${events.filter(e => (e.category || 'general') === cat).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card padding="lg">
          <div className="empty-state">
            <span className="empty-icon"><Inbox size={46} strokeWidth={2} /></span>
            <h3>No Events</h3>
            <p>No events match the selected filter.</p>
          </div>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="events-section">
              <h2 className="section-heading">Upcoming Events</h2>
              <div className="content-grid">
                {upcoming.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div className="events-section">
              <h2 className="section-heading past-heading">Past Events</h2>
              <div className="content-grid">
                {past.map(event => <EventCard key={event.id} event={event} past />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, past = false }) {
  const dateObj = event.date ? new Date(event.date) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA';
  const dayNum = dateObj ? dateObj.getDate() : null;
  const monthStr = dateObj ? dateObj.toLocaleDateString('en-GB', { month: 'short' }) : '';

  return (
    <Card hover padding="lg" className={`event-card ${past ? 'event-card-past' : ''}`}>
      <div className="event-card-top">
        {dayNum && (
          <div className="event-date-badge">
            <span className="event-day">{dayNum}</span>
            <span className="event-month">{monthStr}</span>
          </div>
        )}
        <div className="event-card-header">
          <Badge variant={CATEGORY_VARIANT[event.category] || 'default'} size="sm">
            {event.category || 'general'}
          </Badge>
          {past && <Badge variant="gray" size="sm">Past</Badge>}
        </div>
      </div>
      <h3 className="event-title">{event.title}</h3>
      {event.description && <p className="event-description">{event.description}</p>}
      <div className="event-details">
        <div className="event-detail-item">
          <span className="detail-icon"><CalendarDays size={16} strokeWidth={2} /></span>
          <div className="detail-content">
            <span className="detail-label">Date</span>
            <span className="detail-value">{dateStr}</span>
          </div>
        </div>
        {event.time && (
          <div className="event-detail-item">
            <span className="detail-icon"><Clock size={16} strokeWidth={2} /></span>
            <div className="detail-content">
              <span className="detail-label">Time</span>
              <span className="detail-value">{event.time}</span>
            </div>
          </div>
        )}
        <div className="event-detail-item">
          <span className="detail-icon"><MapPin size={16} strokeWidth={2} /></span>
          <div className="detail-content">
            <span className="detail-label">Location</span>
            <span className="detail-value">{event.location || 'TBA'}</span>
          </div>
        </div>
        <div className="event-detail-item">
          <span className="detail-icon"><Users size={16} strokeWidth={2} /></span>
          <div className="detail-content">
            <span className="detail-label">Organizer</span>
            <span className="detail-value">{event.organizer || 'Base Command'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
