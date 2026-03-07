import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc
} from "firebase/firestore";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Input, Textarea, Select } from "../components/ui/Input";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Info,
  LayoutDashboard,
  Megaphone,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
  Wrench
} from "lucide-react";
import { mockAdminData } from "../utils/mockData";
import "./Admin.css";

function formatDate(value) {
  if (!value) return "N/A";
  const dateObj = value instanceof Date ? value : new Date(value);
  return Number.isNaN(dateObj.getTime()) ? "N/A" : dateObj.toLocaleString();
}

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontSize: "18px"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
    setTimeout(() => setErrorMessage(""), 5000);
  };

  return (
    <div className="admin-container">
      {/* Admin Header with Role Badge */}
      <div className="admin-header-section">
        <div className="admin-header-content">
          <h1><ShieldCheck size={24} strokeWidth={2} /> Administration Panel</h1>
          <p className="admin-subtitle">Manage community content and system settings</p>
          <Badge variant="primary" size="lg">Administrator Access</Badge>
        </div>
      </div>

      {/* Notification Messages */}
      {successMessage && (
        <div className="notification success">
          <CheckCircle2 size={18} strokeWidth={2} />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="notification error">
          <AlertTriangle size={18} strokeWidth={2} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="tab-icon"><LayoutDashboard size={16} strokeWidth={2} /></span>
          Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("alerts")}
        >
          <span className="tab-icon"><ShieldAlert size={16} strokeWidth={2} /></span>
          Alerts
        </button>
        <button
          className={`admin-tab ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          <span className="tab-icon"><CalendarDays size={16} strokeWidth={2} /></span>
          Events
        </button>
        <button
          className={`admin-tab ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          <span className="tab-icon"><Megaphone size={16} strokeWidth={2} /></span>
          Announcements
        </button>
        <button
          className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <span className="tab-icon"><Settings2 size={16} strokeWidth={2} /></span>
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === "dashboard" && <AdminDashboardTab showError={showError} />}
        {activeTab === "alerts" && <AlertsTab showSuccess={showSuccess} showError={showError} />}
        {activeTab === "events" && <EventsTab showSuccess={showSuccess} showError={showError} />}
        {activeTab === "announcements" && <AnnouncementsTab showSuccess={showSuccess} showError={showError} />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// Admin Dashboard Tab
function AdminDashboardTab({ showError }) {
  const [stats, setStats] = useState(mockAdminData.stats);
  const [dashboardLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!db) {
      setStats(mockAdminData.stats);
      setLoading(false);
      return;
    }

    setLoading(true);

    async function fetchStats() {
      try {
        const alertsSnap = await getDocs(collection(db, "alerts"));
        const eventsSnap = await getDocs(collection(db, "events"));
        const announcementsSnap = await getDocs(collection(db, "announcements"));

        setStats({
          totalAlerts: alertsSnap.size,
          totalEvents: eventsSnap.size,
          totalAnnouncements: announcementsSnap.size,
          recentActivity: alertsSnap.size + eventsSnap.size + announcementsSnap.size
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        showError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [showError]);

  if (dashboardLoading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-tab-content">
      <h2><LayoutDashboard size={22} strokeWidth={2} /> Admin Dashboard</h2>
      <div className="admin-stats-grid">
        <Card variant="default" padding="lg">
          <div className="admin-stat-card">
            <div className="stat-icon large"><ShieldAlert size={28} strokeWidth={2} /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.totalAlerts || 0}</div>
              <div className="stat-label">Total Alerts</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="lg">
          <div className="admin-stat-card">
            <div className="stat-icon large"><CalendarDays size={28} strokeWidth={2} /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.totalEvents || 0}</div>
              <div className="stat-label">Scheduled Events</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="lg">
          <div className="admin-stat-card">
            <div className="stat-icon large"><Megaphone size={28} strokeWidth={2} /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.totalAnnouncements || 0}</div>
              <div className="stat-label">Announcements</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="lg">
          <div className="admin-stat-card">
            <div className="stat-icon large"><Activity size={28} strokeWidth={2} /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.recentActivity || 0}</div>
              <div className="stat-label">Total Content</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="lg">
          <div className="admin-stat-card">
            <div className="stat-icon large"><Users size={28} strokeWidth={2} /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.activeUsers || 0}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="lg">
          <div className="admin-stat-card">
            <div className="stat-icon large"><Wrench size={28} strokeWidth={2} /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.pendingRequests || 0}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="default" padding="lg" style={{ marginTop: "24px" }}>
        <CardHeader>
          <h3>System Information</h3>
        </CardHeader>
        <CardBody>
          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Portal Status</span>
              <span className="info-value"><Badge variant="success">Operational</Badge></span>
            </div>
            <div className="info-row">
              <span className="info-label">Database Status</span>
              <span className="info-value">
                {db ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <Badge variant="warning">Demo Data Mode</Badge>
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Admin Role</span>
              <span className="info-value"><Badge variant="primary">Administrator</Badge></span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card variant="default" padding="lg" style={{ marginTop: "24px" }}>
        <CardHeader>
          <h3>Recent Administrative Activity</h3>
        </CardHeader>
        <CardBody>
          <div className="admin-items-list">
            {mockAdminData.auditLogs.map((entry) => (
              <div key={entry.id} className="info-row">
                <span className="info-label">{entry.action}</span>
                <span className="info-value">
                  {entry.actor} | {formatDate(entry.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Alerts Tab
function AlertsTab({ showSuccess, showError }) {
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("medium");
  const [alertDate, setAlertDate] = useState("");
  const [alertErrors, setAlertErrors] = useState({});
  const [recentAlerts, setRecentAlerts] = useState(mockAdminData.recentAlerts);

  useEffect(() => {
    fetchRecentAlerts();
  }, []);

  const fetchRecentAlerts = async () => {
    if (!db) {
      setRecentAlerts(mockAdminData.recentAlerts);
      return;
    }

    try {
      const q = query(
        collection(db, "alerts"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const snap = await getDocs(q);
      setRecentAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching alerts:", error);
      showError("Failed to fetch recent alerts.");
    }
  };

  const addAlert = async (e) => {
    e.preventDefault();
    setAlertErrors({});

    const errors = {};
    if (!alertTitle.trim()) errors.title = "Title is required";
    if (!alertMessage.trim()) errors.message = "Message is required";
    if (!alertDate) errors.date = "Date is required";

    if (Object.keys(errors).length > 0) {
      setAlertErrors(errors);
      return;
    }

    const newAlert = {
      id: `demo-alert-${Date.now()}`,
      title: alertTitle.trim(),
      message: alertMessage.trim(),
      severity: alertSeverity,
      date: alertDate,
      status: "active",
      createdAt: new Date()
    };

    if (!db) {
      setRecentAlerts((prev) => [newAlert, ...prev].slice(0, 5));
      showSuccess("Alert created successfully in demo mode.");
      setAlertTitle("");
      setAlertMessage("");
      setAlertSeverity("medium");
      setAlertDate("");
      return;
    }

    try {
      await addDoc(collection(db, "alerts"), {
        title: alertTitle.trim(),
        message: alertMessage.trim(),
        severity: alertSeverity,
        date: alertDate,
        status: "active",
        createdAt: serverTimestamp()
      });

      showSuccess("Alert created successfully.");
      setAlertTitle("");
      setAlertMessage("");
      setAlertSeverity("medium");
      setAlertDate("");
      fetchRecentAlerts();
    } catch (error) {
      console.error("Error adding alert:", error);
      showError("Failed to create alert. Please try again.");
    }
  };

  const deleteAlert = async (alertId) => {
    if (!db) {
      setRecentAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      showSuccess("Alert deleted in demo mode.");
      return;
    }

    try {
      await deleteDoc(doc(db, "alerts", alertId));
      showSuccess("Alert deleted successfully!");
      fetchRecentAlerts();
    } catch (error) {
      showError("Failed to delete alert.");
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <h2><ShieldAlert size={20} strokeWidth={2} /> Manage Alerts</h2>
        <p>Create and manage emergency alerts for the community</p>
      </div>

      <div className="admin-form-section">
        <Card variant="default" padding="lg">
          <CardHeader>
            <h3>Create New Alert</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={addAlert} className="admin-form">
              <div className="form-group">
                <Input
                  label="Alert Title *"
                  type="text"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="e.g., Security Maintenance"
                  error={alertErrors.title}
                />
              </div>

              <div className="form-group">
                <Textarea
                  label="Alert Message *"
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Describe the alert in detail..."
                  error={alertErrors.message}
                  rows={5}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Select
                    label="Severity Level *"
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </Select>
                </div>

                <div className="form-group">
                  <Input
                    label="Date *"
                    type="date"
                    value={alertDate}
                    onChange={(e) => setAlertDate(e.target.value)}
                    error={alertErrors.date}
                  />
                </div>
              </div>

              <Button variant="primary" type="submit" fullWidth>
                Publish Alert
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      {recentAlerts.length > 0 && (
        <div className="admin-list-section">
          <h3>Recent Alerts</h3>
          <div className="admin-items-list">
            {recentAlerts.map(alert => (
              <Card key={alert.id} variant="default" padding="md">
                <div className="admin-item-header">
                  <div>
                    <h4>{alert.title}</h4>
                    <Badge variant={alert.severity}>{alert.severity}</Badge>
                    <p className="admin-item-description">
                      {alert.message}
                    </p>
                    <p className="admin-item-meta">
                      Created: {formatDate(alert.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Events Tab
function EventsTab({ showSuccess, showError }) {
  const [eventTitle, setEventTitle] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [recentEvents, setRecentEvents] = useState(mockAdminData.recentEvents);

  useEffect(() => {
    fetchRecentEvents();
  }, []);

  const fetchRecentEvents = async () => {
    if (!db) {
      setRecentEvents(mockAdminData.recentEvents);
      return;
    }

    try {
      const q = query(
        collection(db, "events"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const snap = await getDocs(q);
      setRecentEvents(snap.docs.map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() })));
    } catch (error) {
      console.error("Error fetching events:", error);
      showError("Failed to fetch recent events.");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventLocation || !eventDate || !eventTime) {
      showError("All fields are required");
      return;
    }

    const newEvent = {
      id: `demo-event-${Date.now()}`,
      title: eventTitle.trim(),
      location: eventLocation.trim(),
      date: new Date(`${eventDate}T${eventTime}`),
      time: eventTime,
      category: "operations",
      organizer: "Administration",
      createdAt: new Date()
    };

    if (!db) {
      setRecentEvents((prev) => [newEvent, ...prev].slice(0, 5));
      showSuccess("Event created successfully in demo mode.");
      setEventTitle("");
      setEventLocation("");
      setEventDate("");
      setEventTime("");
      return;
    }

    try {
      await addDoc(collection(db, "events"), {
        title: eventTitle,
        location: eventLocation,
        date: eventDate,
        time: eventTime,
        createdAt: serverTimestamp()
      });
      showSuccess("Event created successfully!");
      setEventTitle("");
      setEventLocation("");
      setEventDate("");
      setEventTime("");
      fetchRecentEvents();
    } catch (error) {
      showError("Failed to create event");
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <h2><CalendarDays size={20} strokeWidth={2} /> Manage Events</h2>
        <p>Create and schedule community events</p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader>
          <h3>Create New Event</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAddEvent} className="admin-form">
            <div className="form-group">
              <Input
                label="Event Title *"
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g., Community Meeting"
              />
            </div>

            <div className="form-group">
              <Input
                label="Location *"
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="e.g., Main Hall"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Date *"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <Input
                  label="Time *"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>

            <Button variant="primary" type="submit" fullWidth>
              Create Event
            </Button>
          </form>
        </CardBody>
      </Card>

      {recentEvents.length > 0 && (
        <div className="admin-list-section">
          <h3>Recent Events</h3>
          <div className="admin-items-list">
            {recentEvents.map((eventItem) => (
              <Card key={eventItem.id} variant="default" padding="md">
                <div className="admin-item-header">
                  <div>
                    <h4>{eventItem.title}</h4>
                    <Badge variant="info">{eventItem.category || "general"}</Badge>
                    <p className="admin-item-description">
                      {eventItem.location}
                    </p>
                    <p className="admin-item-meta">
                      Scheduled: {formatDate(eventItem.date)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Announcements Tab
function AnnouncementsTab({ showSuccess, showError }) {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [recentAnnouncements, setRecentAnnouncements] = useState(mockAdminData.recentAnnouncements);

  useEffect(() => {
    fetchRecentAnnouncements();
  }, []);

  const fetchRecentAnnouncements = async () => {
    if (!db) {
      setRecentAnnouncements(mockAdminData.recentAnnouncements);
      return;
    }

    try {
      const q = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const snap = await getDocs(q);
      setRecentAnnouncements(snap.docs.map((announcementDoc) => ({ id: announcementDoc.id, ...announcementDoc.data() })));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      showError("Failed to fetch recent announcements.");
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle || !announcementContent) {
      showError("All fields are required");
      return;
    }

    const newAnnouncement = {
      id: `demo-announcement-${Date.now()}`,
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      priority: "medium",
      category: "general",
      createdAt: new Date(),
      author: "Admin Office"
    };

    if (!db) {
      setRecentAnnouncements((prev) => [newAnnouncement, ...prev].slice(0, 5));
      showSuccess("Announcement posted successfully in demo mode.");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      return;
    }

    try {
      await addDoc(collection(db, "announcements"), {
        title: announcementTitle,
        content: announcementContent,
        createdAt: serverTimestamp()
      });
      showSuccess("Announcement posted successfully!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      fetchRecentAnnouncements();
    } catch (error) {
      showError("Failed to post announcement");
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <h2><Megaphone size={20} strokeWidth={2} /> Manage Announcements</h2>
        <p>Post important announcements to the community</p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader>
          <h3>Create New Announcement</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAddAnnouncement} className="admin-form">
            <div className="form-group">
              <Input
                label="Title *"
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>

            <div className="form-group">
              <Textarea
                label="Content *"
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows={6}
              />
            </div>

            <Button variant="primary" type="submit" fullWidth>
              Post Announcement
            </Button>
          </form>
        </CardBody>
      </Card>

      {recentAnnouncements.length > 0 && (
        <div className="admin-list-section">
          <h3>Recent Announcements</h3>
          <div className="admin-items-list">
            {recentAnnouncements.map((announcementItem) => (
              <Card key={announcementItem.id} variant="default" padding="md">
                <div className="admin-item-header">
                  <div>
                    <h4>{announcementItem.title}</h4>
                    <Badge variant={announcementItem.priority || "info"}>{announcementItem.priority || "info"}</Badge>
                    <p className="admin-item-description">
                      {announcementItem.content}
                    </p>
                    <p className="admin-item-meta">
                      Published: {formatDate(announcementItem.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  const previewUsers = mockAdminData.managedUsers.slice(0, 15);

  return (
    <div className="admin-tab-content">
      <h2><Settings2 size={22} strokeWidth={2} /> Administration Settings</h2>
      <Card variant="default" padding="lg">
        <CardHeader>
          <h3>Portal Settings</h3>
        </CardHeader>
        <CardBody>
          <div className="settings-info">
            <p>Configured settings currently active in the portal:</p>
            <div className="admin-items-list" style={{ marginTop: "12px" }}>
              {mockAdminData.settings.map((setting) => (
                <div key={setting.id} className="info-row">
                  <span className="info-label">{setting.name}</span>
                  <span className="info-value">
                    {setting.value} <Badge variant={setting.status === "review" ? "warning" : "success"}>{setting.status}</Badge>
                  </span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "16px" }}>Current features:</p>
            <ul className="settings-features">
              <li>Alert Management</li>
              <li>Event Scheduling</li>
              <li>Announcements Publishing</li>
              <li>User Role Management</li>
              <li>Analytics Dashboard</li>
            </ul>
          </div>
        </CardBody>
      </Card>

      <Card variant="default" padding="lg" style={{ marginTop: "24px" }}>
        <CardHeader>
          <h3>User Access Snapshot</h3>
        </CardHeader>
        <CardBody>
          <div className="info-row">
            <span className="info-label">Total Personnel Records</span>
            <span className="info-value">
              <Badge variant="primary">{mockAdminData.stats.totalPersonnel}</Badge>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Actively Available Personnel</span>
            <span className="info-value">
              <Badge variant="success">{mockAdminData.stats.activeUsers}</Badge>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Displayed Roster Preview</span>
            <span className="info-value">
              <Badge variant="info">{previewUsers.length} of {mockAdminData.managedUsers.length}</Badge>
            </span>
          </div>

          <div className="admin-items-list">
            {previewUsers.map((user) => (
              <div key={user.id} className="info-row">
                <span className="info-label">{user.name} ({user.unit})</span>
                <span className="info-value">
                  <Badge variant="primary">{user.role}</Badge>
                  <Badge variant={user.status === "active" || user.status === "on-duty" ? "success" : "warning"}>{user.status}</Badge>
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card variant="default" padding="lg" style={{ marginTop: "24px" }}>
        <CardHeader>
          <h3>Unit Strength Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="admin-items-list">
            {mockAdminData.unitSummary.map((unitItem) => (
              <div key={unitItem.unit} className="info-row">
                <span className="info-label">{unitItem.unit}</span>
                <span className="info-value">
                  <Badge variant="primary">Total {unitItem.personnel}</Badge>
                  <Badge variant="success">Active {unitItem.active}</Badge>
                  <Badge variant="warning">Training {unitItem.training}</Badge>
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card variant="default" padding="lg" style={{ marginTop: "24px" }}>
        <CardHeader>
          <h3>Latest Audit Log Entries</h3>
        </CardHeader>
        <CardBody>
          <div className="admin-items-list">
            {mockAdminData.auditLogs.map((entry) => (
              <div key={entry.id} className="info-row">
                <span className="info-label">{entry.target}</span>
                <span className="info-value">
                  {entry.action} by {entry.actor} | {formatDate(entry.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
