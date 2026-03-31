import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { alertsApi, eventsApi, announcementsApi, statsApi } from '../services/api';
import Card, { CardHeader, CardBody } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import {
  AlertTriangle, Bell, CalendarDays, CircleCheckBig,
  FilePlus2, Gauge, Inbox, LayoutDashboard, ListPlus,
  MapPin, Megaphone, Newspaper, PartyPopper, Rocket,
  Siren, Target, TrendingUp, Users
} from 'lucide-react';
import '../styles/Dashboard.css';

const fmtDate = (v) => {
  if (!v) return 'Recently';
  const d = new Date(v);
  return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
};

const fmtDateLong = (v) => {
  if (!v) return 'Date TBA';
  const d = new Date(v);
  return isNaN(d.getTime()) ? 'Date TBA' : d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function Dashboard() {
  const { currentUser, isAdmin, userProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [alerts, announcements, events] = await Promise.all([
          alertsApi.getAll(),
          announcementsApi.getAll(),
          eventsApi.getAll()
        ]);

        let statsData = null;
        if (isAdmin()) {
          try { statsData = await statsApi.get(); } catch { /* non-admin */ }
        }

        setData({
          stats: statsData || {
            totalAlerts: alerts.length,
            activeAlerts: alerts.filter(a => a.status === 'active').length,
            totalAnnouncements: announcements.length,
            totalEvents: events.length,
            totalUsers: 0,
            displayName: userProfile?.displayName || ''
          },
          recentAlerts: alerts.slice(0, 5),
          recentAnnouncements: announcements.slice(0, 5),
          upcomingEvents: events.slice(0, 5)
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [currentUser, isAdmin]);

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
      {isAdmin() ? <AdminDashboard data={data} /> : <UserDashboard data={data} />}
    </div>
  );
}

function AdminDashboard({ data }) {
  if (!data) return null;
  const { stats, recentAlerts } = data;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header admin-header">
        <div className="header-content">
          <h1><LayoutDashboard size={22} strokeWidth={2} /> Admin Dashboard</h1>
          <p className="header-subtitle">Manage the community portal and monitor all activities</p>
        </div>
        <div className="header-actions">
          <Link to="/admin"><Button variant="primary">Manage Content</Button></Link>
        </div>
      </div>

      <div className="metrics-grid admin-metrics">
        <MetricCard title="Active Alerts" value={stats.activeAlerts} subtitle={`${stats.totalAlerts} total`} icon={<Siren size={24} strokeWidth={2} />} variant="error" />
        <MetricCard title="Announcements" value={stats.totalAnnouncements} subtitle="Total posts" icon={<Megaphone size={24} strokeWidth={2} />} variant="info" />
        <MetricCard title="Events" value={stats.totalEvents} subtitle="Scheduled" icon={<CalendarDays size={24} strokeWidth={2} />} variant="primary" />
        <MetricCard title="Registered Users" value={stats.totalUsers} subtitle="Personnel accounts" icon={<Users size={24} strokeWidth={2} />} variant="success" />
      </div>

      <div className="admin-panels">
        <Card variant="default" padding="lg" className="quick-actions-card">
          <CardHeader><h3><Gauge size={18} strokeWidth={2} /> Quick Actions</h3></CardHeader>
          <CardBody>
            <div className="actions-grid">
              <Link to="/admin" className="action-btn"><span className="action-icon"><ListPlus size={20} strokeWidth={2} /></span><span>Create Alert</span></Link>
              <Link to="/admin" className="action-btn"><span className="action-icon"><FilePlus2 size={20} strokeWidth={2} /></span><span>New Announcement</span></Link>
              <Link to="/admin" className="action-btn"><span className="action-icon"><PartyPopper size={20} strokeWidth={2} /></span><span>Schedule Event</span></Link>
              <Link to="/admin" className="action-btn"><span className="action-icon"><TrendingUp size={20} strokeWidth={2} /></span><span>View Analytics</span></Link>
            </div>
          </CardBody>
        </Card>

        <div className="activity-section">
          <Card variant="default" padding="lg">
            <CardHeader>
              <h3><Bell size={18} strokeWidth={2} /> Recent Alerts</h3>
              <Link to="/alerts" className="view-all-link">View all</Link>
            </CardHeader>
            <CardBody>
              {recentAlerts.length > 0 ? (
                <div className="activity-list">
                  {recentAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="activity-item">
                      <div className="activity-badge">
                        <Badge variant={alert.severity === 'high' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'} size="sm">
                          {alert.severity || 'info'}
                        </Badge>
                      </div>
                      <div className="activity-content">
                        <p className="activity-title">{alert.title}</p>
                        <p className="activity-time">{fmtDate(alert.created_at)}</p>
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

      <div className="system-stats">
        <Card variant="default" padding="lg">
          <CardHeader><h3><TrendingUp size={18} strokeWidth={2} /> System Overview</h3></CardHeader>
          <CardBody>
            <div className="stats-grid">
              <StatRow label="Total Content Items" value={stats.totalAnnouncements + stats.totalEvents} />
              <StatRow label="Active Alerts" value={stats.activeAlerts} />
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
  const { stats, recentAnnouncements, upcomingEvents } = data;

  return (
    <div className="user-dashboard">
      <div className="dashboard-header user-header">
        <div className="header-content">
          <h1><LayoutDashboard size={22} strokeWidth={2} /> Welcome back{stats?.displayName ? `, ${stats.displayName}` : ''}</h1>
          <p className="header-subtitle">Here's what's happening in your community</p>
        </div>
      </div>

      <div className="metrics-grid user-metrics">
        <MetricCard title="Active Alerts" value={stats.activeAlerts} subtitle="Community notices" icon={<Bell size={24} strokeWidth={2} />} variant="error" link="/alerts" />
        <MetricCard title="Announcements" value={stats.totalAnnouncements} subtitle="Latest posts" icon={<Newspaper size={24} strokeWidth={2} />} variant="info" link="/announcements" />
        <MetricCard title="Events" value={stats.totalEvents} subtitle="Upcoming activities" icon={<Target size={24} strokeWidth={2} />} variant="success" link="/events" />
      </div>

      <div className="featured-sections">
        <Card variant="default" padding="lg" className="featured-card">
          <CardHeader>
            <h3><Megaphone size={18} strokeWidth={2} /> Latest Announcements</h3>
            <Link to="/announcements" className="view-all-link">View all</Link>
          </CardHeader>
          <CardBody>
            {recentAnnouncements.length > 0 ? (
              <div className="items-list">
                {recentAnnouncements.slice(0, 3).map(a => (
                  <div key={a.id} className="list-item">
                    <div className="item-content">
                      <h4 className="item-title">{a.title}</h4>
                      <p className="item-text">{a.content?.substring(0, 100)}...</p>
                      <span className="item-date">{fmtDate(a.created_at)}</span>
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

        <Card variant="default" padding="lg" className="featured-card">
          <CardHeader>
            <h3><CalendarDays size={18} strokeWidth={2} /> Upcoming Events</h3>
            <Link to="/events" className="view-all-link">View all</Link>
          </CardHeader>
          <CardBody>
            {upcomingEvents.length > 0 ? (
              <div className="items-list">
                {upcomingEvents.slice(0, 3).map(e => (
                  <div key={e.id} className="list-item">
                    <div className="item-content">
                      <h4 className="item-title">{e.title}</h4>
                      <p className="item-text"><MapPin size={13} strokeWidth={2} /> {e.location || 'Location TBA'}</p>
                      <span className="item-date">{fmtDateLong(e.date)}</span>
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

      <Card variant="default" padding="lg" className="quick-access-card">
        <CardHeader><h3><Rocket size={18} strokeWidth={2} /> Quick Access</h3></CardHeader>
        <CardBody>
          <div className="quick-links">
            <Link to="/alerts" className="quick-link"><span className="quick-icon"><Siren size={20} strokeWidth={2} /></span><span>View All Alerts</span></Link>
            <Link to="/announcements" className="quick-link"><span className="quick-icon"><Megaphone size={20} strokeWidth={2} /></span><span>View All Posts</span></Link>
            <Link to="/events" className="quick-link"><span className="quick-icon"><CalendarDays size={20} strokeWidth={2} /></span><span>View All Events</span></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, variant, link }) {
  const content = (
    <Card variant={variant} padding="lg" className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
    </Card>
  );
  return link ? <Link to={link} className="metric-card-link">{content}</Link> : content;
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
