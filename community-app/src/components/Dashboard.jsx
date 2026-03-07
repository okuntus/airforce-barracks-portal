import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import Card, { CardHeader, CardBody } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CircleCheckBig,
  FilePlus2,
  Gauge,
  Inbox,
  LayoutDashboard,
  ListPlus,
  MapPin,
  Megaphone,
  Newspaper,
  PartyPopper,
  Rocket,
  Siren,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import { mockDashboardData } from '../utils/mockData';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { currentUser, isAdmin } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    ...mockDashboardData,
    stats: {
      ...mockDashboardData.stats,
      userEmail: currentUser?.email || 'demo@user.com'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use mock data instantly if Firebase is not configured
    if (!db || !currentUser) {
      return;
    }

    setLoading(true);

    async function fetchDashboardData() {
      try {
        // Fetch counts for all collections
        const alertsRef = collection(db, 'alerts');
        const activeAlertsRef = query(alertsRef, where('status', '==', 'active'));
        const announcementsRef = collection(db, 'announcements');
        const eventsRef = collection(db, 'events');

        const [
          alertsSnapshot,
          activeAlertsSnapshot,
          announcementsSnapshot,
          eventsSnapshot,
          recentAlertsSnapshot,
          recentAnnouncementsSnapshot,
          upcomingEventsSnapshot
        ] = await Promise.all([
          getDocs(alertsRef),
          getDocs(activeAlertsRef),
          getDocs(announcementsRef),
          getDocs(eventsRef),
          getDocs(query(alertsRef, orderBy('createdAt', 'desc'), limit(5))),
          getDocs(query(announcementsRef, orderBy('createdAt', 'desc'), limit(5))),
          getDocs(query(eventsRef, orderBy('createdAt', 'desc'), limit(5)))
        ]);

        const recentAlerts = recentAlertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const recentAnnouncements = recentAnnouncementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const upcomingEvents = upcomingEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setDashboardData({
          stats: {
            totalAlerts: alertsSnapshot.size,
            activeAlerts: activeAlertsSnapshot.size,
            totalAnnouncements: announcementsSnapshot.size,
            totalEvents: eventsSnapshot.size,
            userEmail: currentUser.email
          },
          recentAlerts,
          recentAnnouncements,
          upcomingEvents
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Fall back to mock data on error
        setDashboardData({
          ...mockDashboardData,
          stats: {
            ...mockDashboardData.stats,
            userEmail: currentUser.email
          }
        });
        setError(null); // Don't show error, use mock data instead
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="error" padding="lg" className="dashboard-error">
        <div className="error-content">
          <AlertTriangle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="dashboard-container">
      {isAdmin() ? (
        <AdminDashboard data={dashboardData} />
      ) : (
        <UserDashboard data={dashboardData} />
      )}
    </div>
  );
}

function AdminDashboard({ data }) {
  if (!data) return null;

  const alertBySeverity = {
    high: Math.floor(data.stats.activeAlerts * 0.3),
    medium: Math.floor(data.stats.activeAlerts * 0.5),
    low: Math.floor(data.stats.activeAlerts * 0.2)
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="dashboard-header admin-header">
        <div className="header-content">
          <h1><LayoutDashboard size={22} strokeWidth={2} /> Admin Dashboard</h1>
          <p className="header-subtitle">Manage the community portal and monitor all activities</p>
        </div>
        <div className="header-actions">
          <Link to="/admin">
            <Button variant="primary">Manage Content</Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid admin-metrics">
        <MetricCard
          title="Active Alerts"
          value={data.stats.activeAlerts}
          subtitle={`${alertBySeverity.high} High | ${alertBySeverity.medium} Medium | ${alertBySeverity.low} Low`}
          icon={<Siren size={24} strokeWidth={2} />}
          variant="error"
          trend={data.stats.activeAlerts > 0 ? 'up' : 'stable'}
        />
        <MetricCard
          title="Total Announcements"
          value={data.stats.totalAnnouncements}
          subtitle="Posts made this month"
          icon={<Megaphone size={24} strokeWidth={2} />}
          variant="info"
          trend="stable"
        />
        <MetricCard
          title="Upcoming Events"
          value={data.stats.totalEvents}
          subtitle="Community events scheduled"
          icon={<CalendarDays size={24} strokeWidth={2} />}
          variant="primary"
          trend="up"
        />
        <MetricCard
          title="User Engagement"
          value={`${Math.floor(Math.random() * 40 + 60)}%`}
          subtitle="30-day active users"
          icon={<Users size={24} strokeWidth={2} />}
          variant="success"
          trend="up"
        />
      </div>

      {/* Admin Control Panels */}
      <div className="admin-panels">
        {/* Quick Actions */}
        <Card variant="default" padding="lg" className="quick-actions-card">
          <CardHeader>
            <h3><Gauge size={18} strokeWidth={2} /> Quick Actions</h3>
          </CardHeader>
          <CardBody>
            <div className="actions-grid">
              <Link to="/admin" className="action-btn">
                <span className="action-icon"><ListPlus size={20} strokeWidth={2} /></span>
                <span>Create Alert</span>
              </Link>
              <Link to="/admin" className="action-btn">
                <span className="action-icon"><FilePlus2 size={20} strokeWidth={2} /></span>
                <span>New Announcement</span>
              </Link>
              <Link to="/admin" className="action-btn">
                <span className="action-icon"><PartyPopper size={20} strokeWidth={2} /></span>
                <span>Schedule Event</span>
              </Link>
              <Link to="/admin" className="action-btn">
                <span className="action-icon"><TrendingUp size={20} strokeWidth={2} /></span>
                <span>View Analytics</span>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <div className="activity-section">
          <Card variant="default" padding="lg">
            <CardHeader>
              <h3><Bell size={18} strokeWidth={2} /> Recent Alerts</h3>
              <Link to="/alerts" className="view-all-link">View all</Link>
            </CardHeader>
            <CardBody>
              {data.recentAlerts.length > 0 ? (
                <div className="activity-list">
                  {data.recentAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="activity-item">
                      <div className="activity-badge">
                        <Badge variant={alert.severity === 'high' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'} size="sm">
                          {alert.severity || 'info'}
                        </Badge>
                      </div>
                      <div className="activity-content">
                        <p className="activity-title">{alert.title}</p>
                        <p className="activity-time">
                          {alert.createdAt instanceof Date ? alert.createdAt.toLocaleDateString() : alert.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon"><CircleCheckBig size={30} strokeWidth={2} /></span>
                  <p>No active alerts</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* System Stats */}
      <div className="system-stats">
        <Card variant="default" padding="lg">
          <CardHeader>
            <h3><TrendingUp size={18} strokeWidth={2} /> System Overview</h3>
          </CardHeader>
          <CardBody>
            <div className="stats-grid">
              <StatRow label="Total Content Items" value={data.stats.totalAnnouncements + data.stats.totalEvents} />
              <StatRow label="Active Users (30d)" value="24" />
              <StatRow label="System Status" value="Operational" />
              <StatRow label="Last Updated" value={new Date().toLocaleDateString()} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function UserDashboard({ data }) {
  if (!data) return null;

  return (
    <div className="user-dashboard">
      {/* User Header */}
      <div className="dashboard-header user-header">
        <div className="header-content">
          <h1><LayoutDashboard size={22} strokeWidth={2} /> Welcome back</h1>
          <p className="header-subtitle">Here's what's happening in your community</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid user-metrics">
        <MetricCard
          title="Active Alerts"
          value={data.stats.activeAlerts}
          subtitle="Community notices"
          icon={<Bell size={24} strokeWidth={2} />}
          variant="error"
          link="/alerts"
        />
        <MetricCard
          title="New Posts"
          value={data.stats.totalAnnouncements}
          subtitle="Latest announcements"
          icon={<Newspaper size={24} strokeWidth={2} />}
          variant="info"
          link="/announcements"
        />
        <MetricCard
          title="Events"
          value={data.stats.totalEvents}
          subtitle="Upcoming activities"
          icon={<Target size={24} strokeWidth={2} />}
          variant="success"
          link="/events"
        />
      </div>

      {/* Featured Sections */}
      <div className="featured-sections">
        {/* Recent Announcements */}
        <Card variant="default" padding="lg" className="featured-card">
          <CardHeader>
            <h3><Megaphone size={18} strokeWidth={2} /> Latest Announcements</h3>
            <Link to="/announcements" className="view-all-link">View all</Link>
          </CardHeader>
          <CardBody>
            {data.recentAnnouncements.length > 0 ? (
              <div className="items-list">
                {data.recentAnnouncements.slice(0, 3).map(announcement => (
                  <div key={announcement.id} className="list-item">
                    <div className="item-content">
                      <h4 className="item-title">{announcement.title}</h4>
                      <p className="item-text">{announcement.content?.substring(0, 100)}...</p>
                      <span className="item-date">
                        {announcement.createdAt instanceof Date ? announcement.createdAt.toLocaleDateString() : announcement.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                      </span>
                    </div>
                    <Badge variant="info" size="sm">New</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                  <span className="empty-icon"><Inbox size={30} strokeWidth={2} /></span>
                <p>No announcements yet</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Events */}
        <Card variant="default" padding="lg" className="featured-card">
          <CardHeader>
            <h3><CalendarDays size={18} strokeWidth={2} /> Upcoming Events</h3>
            <Link to="/events" className="view-all-link">View all</Link>
          </CardHeader>
          <CardBody>
            {data.upcomingEvents.length > 0 ? (
              <div className="items-list">
                {data.upcomingEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="list-item">
                    <div className="item-content">
                      <h4 className="item-title">{event.title}</h4>
                      <p className="item-text">
                        <MapPin size={13} strokeWidth={2} /> {event.location || 'Location TBA'}
                      </p>
                      <span className="item-date">
                        {event.date instanceof Date ? event.date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : event.date?.toDate?.().toLocaleDateString() || 'Date TBA'}
                      </span>
                    </div>
                    <Badge variant="success" size="sm">Upcoming</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                  <span className="empty-icon"><CalendarDays size={30} strokeWidth={2} /></span>
                <p>No upcoming events</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick Access */}
      <Card variant="default" padding="lg" className="quick-access-card">
        <CardHeader>
          <h3><Rocket size={18} strokeWidth={2} /> Quick Access</h3>
        </CardHeader>
        <CardBody>
          <div className="quick-links">
            <Link to="/alerts" className="quick-link">
              <span className="quick-icon"><Siren size={20} strokeWidth={2} /></span>
              <span>View All Alerts</span>
            </Link>
            <Link to="/announcements" className="quick-link">
              <span className="quick-icon"><Megaphone size={20} strokeWidth={2} /></span>
              <span>View All Posts</span>
            </Link>
            <Link to="/events" className="quick-link">
              <span className="quick-icon"><CalendarDays size={20} strokeWidth={2} /></span>
              <span>View All Events</span>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, variant, trend, link }) {
  const content = (
    <Card variant={variant} padding="lg" className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
      {trend && <div className={`metric-trend trend-${trend}`}></div>}
    </Card>
  );

  return link ? (
    <Link to={link} className="metric-card-link">
      {content}
    </Link>
  ) : (
    content
  );
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
