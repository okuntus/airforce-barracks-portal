import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from "firebase/firestore";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { AlarmClock, CalendarDays, CircleCheckBig, ShieldAlert } from "lucide-react";
import { mockAlerts } from "../utils/mockData";
import './Pages.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Use mock data instantly if Firebase is not configured
    if (!db) {
      return;
    }

  setLoading(true);

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

        setAlerts(data.length > 0 ? data : mockAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        // Fall back to mock data on error
        setAlerts(mockAlerts);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading alerts...</p>
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
            <span className="page-icon"><ShieldAlert size={34} strokeWidth={2} /></span>
            Emergency Alerts
          </h1>
          <p className="page-subtitle">
            Critical updates and emergency notifications for the community
          </p>
        </div>
        <Badge variant="error" size="lg" dot>{alerts.length} Active</Badge>
      </div>

      {/* Filter Buttons */}
      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Alerts ({alerts.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'high' ? 'filter-btn-active' : ''}`}
          onClick={() => setFilter('high')}
        >
          High ({alerts.filter(a => a.severity === 'high').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'warning' ? 'filter-btn-active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          Warning ({alerts.filter(a => a.severity === 'warning').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'info' ? 'filter-btn-active' : ''}`}
          onClick={() => setFilter('info')}
        >
          Info ({alerts.filter(a => a.severity === 'info').length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="content-list">
        {filteredAlerts.length === 0 ? (
          <Card padding="lg">
            <div className="empty-state">
              <span className="empty-icon"><CircleCheckBig size={46} strokeWidth={2} /></span>
              <h3>No Alerts</h3>
              <p>{filter === 'all' ? 'No active alerts at this time. All clear!' : `No ${filter} severity alerts.`}</p>
            </div>
          </Card>
        ) : (
          filteredAlerts.map(alert => (
            <Card 
              key={alert.id} 
              hover 
              padding="lg" 
              variant={alert.severity === 'high' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
              className="alert-card"
            >
              <div className="alert-card-header">
                <Badge 
                  variant={alert.severity === 'high' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'} 
                  size="md"
                  dot
                >
                  {alert.severity?.toUpperCase()}
                </Badge>
                <span className="alert-date">
                  <CalendarDays size={14} strokeWidth={2} /> {alert.createdAt instanceof Date ? alert.createdAt.toLocaleDateString() : alert.createdAt?.toDate?.().toLocaleDateString() || 'Recent'}
                </span>
              </div>
              <h3 className="alert-title">{alert.title}</h3>
              <p className="alert-message">{alert.message}</p>
              <div className="alert-footer">
                <Badge variant="gray" size="sm">
                  {alert.status === 'active' ? 'Active' : 'Resolved'}
                </Badge>
                {alert.expiresAt && (
                  <span className="alert-expires">
                    <AlarmClock size={14} strokeWidth={2} /> Expires: {alert.expiresAt instanceof Date ? alert.expiresAt.toLocaleDateString() : alert.expiresAt?.toDate?.().toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
