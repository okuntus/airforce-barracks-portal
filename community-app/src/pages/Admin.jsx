import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Input, Textarea, Select } from "../components/ui/Input";
import { alertsApi, eventsApi, announcementsApi, statsApi, usersApi } from "../services/api";
import {
  Activity, AlertTriangle, CalendarDays, CheckCircle2, LayoutDashboard,
  Megaphone, Pencil, Plus, Settings2, ShieldAlert, ShieldCheck,
  Trash2, UserPlus, Users, X, RefreshCw, Mail, Crown, User
} from "lucide-react";
import "./Admin.css";

const fmt = (v) => { if (!v) return "N/A"; const d = new Date(v); return isNaN(d.getTime()) ? "N/A" : d.toLocaleString(); };
const fmtDate = (v) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10); };

const TABS = [
  { key: "dashboard",     icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { key: "users",         icon: <Users size={16} />,           label: "Users" },
  { key: "alerts",        icon: <ShieldAlert size={16} />,     label: "Alerts" },
  { key: "events",        icon: <CalendarDays size={16} />,    label: "Events" },
  { key: "announcements", icon: <Megaphone size={16} />,       label: "Announcements" },
  { key: "settings",      icon: <Settings2 size={16} />,       label: "Settings" },
];

// Stable toast hook — avoids stale closure issues
function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const show = useCallback((type, msg) => {
    clearTimeout(timerRef.current);
    setToast({ type, msg });
    timerRef.current = setTimeout(() => setToast(null), type === 'error' ? 5000 : 4000);
  }, []);
  const showSuccess = useCallback((msg) => show('success', msg), [show]);
  const showError   = useCallback((msg) => show('error',   msg), [show]);
  return { toast, setToast, showSuccess, showError };
}

export default function Admin() {
  const { isAdmin, loading, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast, setToast, showSuccess, showError } = useToast();

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!isAdmin()) return <Navigate to="/" replace />;

  // currentUser.uid is set from user.id in AuthContext login
  const currentUserId = currentUser?.uid;

  return (
    <div className="admin-container">
      <div className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-icon"><ShieldCheck size={32} strokeWidth={1.5} /></div>
          <div>
            <h1 className="admin-hero-title">Administration Panel</h1>
            <p className="admin-hero-sub">Manage users, content, and system settings</p>
          </div>
        </div>
        <Badge variant="primary" size="lg">Administrator</Badge>
      </div>

      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toast.msg}</span>
          <button className="toast-close" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <div className="admin-tabs">
        {TABS.map(({ key, icon, label }) => (
          <button key={key} className={`admin-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
            <span className="tab-icon">{icon}</span>
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === "dashboard"     && <DashboardTab showError={showError} />}
        {activeTab === "users"         && <UsersTab showSuccess={showSuccess} showError={showError} currentUserId={currentUserId} />}
        {activeTab === "alerts"        && <AlertsTab showSuccess={showSuccess} showError={showError} />}
        {activeTab === "events"        && <EventsTab showSuccess={showSuccess} showError={showError} />}
        {activeTab === "announcements" && <AnnouncementsTab showSuccess={showSuccess} showError={showError} />}
        {activeTab === "settings"      && <SettingsTab />}
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function DashboardTab({ showError }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsApi.get();
      setStats(data);
    } catch (err) {
      setError(err.message || "Could not load stats.");
      showError(err.message || "Could not load stats.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  if (error) return (
    <div className="admin-tab-content">
      <div className="tab-header"><h2><LayoutDashboard size={20} /> Dashboard Overview</h2></div>
      <div className="admin-error-state">
        <AlertTriangle size={32} />
        <p>{error}</p>
        <Button variant="primary" onClick={load}>Retry</Button>
      </div>
    </div>
  );

  const cards = [
    { icon: <ShieldAlert size={24} />, value: stats?.activeAlerts ?? 0,      label: "Active Alerts",    color: "var(--color-error)" },
    { icon: <Users size={24} />,       value: stats?.totalUsers ?? 0,         label: "Registered Users", color: "var(--color-primary)" },
    { icon: <CalendarDays size={24} />,value: stats?.totalEvents ?? 0,        label: "Events",           color: "var(--color-success)" },
    { icon: <Megaphone size={24} />,   value: stats?.totalAnnouncements ?? 0, label: "Announcements",    color: "var(--color-info)" },
    { icon: <Activity size={24} />,    value: stats?.recentActivity ?? 0,     label: "Total Content",    color: "var(--color-warning)" },
    { icon: <ShieldAlert size={24} />, value: stats?.totalAlerts ?? 0,        label: "Total Alerts",     color: "var(--color-text-tertiary)" },
  ];

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2><LayoutDashboard size={20} /> Dashboard Overview</h2>
        <button className="icon-action-btn" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
      </div>
      <div className="stats-grid-6">
        {cards.map(({ icon, value, label, color }) => (
          <div key={label} className="stat-tile">
            <div className="stat-tile-icon" style={{ color }}>{icon}</div>
            <div className="stat-tile-value">{value}</div>
            <div className="stat-tile-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="info-card">
        <h3>System Status</h3>
        <div className="info-grid">
          {[
            ["Portal",   <Badge variant="success">Operational</Badge>],
            ["Database", <Badge variant="success">Connected</Badge>],
            ["Role",     <Badge variant="primary">Administrator</Badge>],
            ["Updated",  new Date().toLocaleString()],
          ].map(([k, v]) => (
            <div key={k} className="info-row">
              <span className="info-label">{k}</span>
              <span className="info-value">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ──────────────────────────────────────────────────────────────
const EMPTY_USER = { email: "", password: "", displayName: "", rank: "Personnel", unit: "Community Member", role: "user", phone: "" };

function UsersTab({ showSuccess, showError, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_USER);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await usersApi.getAll()); }
    catch (err) { showError(err.message || "Failed to load users."); }
    finally { setLoading(false); }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.unit?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { showError("Email and password are required."); return; }
    setSubmitting(true);
    try {
      await usersApi.create(form);
      showSuccess(`User ${form.email} created.`);
      setForm(EMPTY_USER); setShowCreate(false); load();
    } catch (err) { showError(err.message || "Failed to create user."); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usersApi.update(editingUser.id, {
        displayName: editingUser.displayName,
        rank: editingUser.rank,
        unit: editingUser.unit,
        role: editingUser.role,
        phone: editingUser.phone
      });
      showSuccess("User updated.");
      setEditingUser(null); load();
    } catch (err) { showError(err.message || "Failed to update user."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await usersApi.delete(id); showSuccess("User deleted."); load(); }
    catch (err) { showError(err.message || "Failed to delete user."); }
    finally { setDeleteConfirm(null); }
  };

  const startEdit = (u) => setEditingUser({
    id: u.id,
    displayName: u.display_name || "",
    rank: u.rank || "",
    unit: u.unit || "",
    role: u.role || "user",
    phone: u.phone || ""
  });

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <div>
          <h2><Users size={20} /> User Management</h2>
          <p className="tab-sub">Create, edit roles, and manage personnel accounts</p>
        </div>
        <div className="tab-actions">
          <button className="icon-action-btn" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
          <Button variant="primary" onClick={() => { setShowCreate(v => !v); setEditingUser(null); }}>
            <UserPlus size={15} /> {showCreate ? "Cancel" : "Add User"}
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card variant="default" padding="lg" className="form-card">
          <CardHeader><h3><UserPlus size={16} /> Create New User</h3></CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="admin-form">
              <div className="form-row">
                <div className="form-group"><Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" /></div>
                <div className="form-group"><Input label="Password *" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><Input label="Display Name" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="e.g. Flight Lieutenant Mensah" /></div>
                <div className="form-group"><Input label="Rank" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} placeholder="e.g. Corporal" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><Input label="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. Engineering Squadron" /></div>
                <div className="form-group"><Input label="Phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+233 24 000 0000" /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
              </div>
              <div className="form-actions">
                <Button variant="primary" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create User"}</Button>
                <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}><X size={15} /> Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Pencil size={16} /> Edit User</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdate} className="admin-form">
              <div className="form-row">
                <div className="form-group"><Input label="Display Name" value={editingUser.displayName} onChange={e => setEditingUser(u => ({ ...u, displayName: e.target.value }))} /></div>
                <div className="form-group"><Input label="Rank" value={editingUser.rank} onChange={e => setEditingUser(u => ({ ...u, rank: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><Input label="Unit" value={editingUser.unit} onChange={e => setEditingUser(u => ({ ...u, unit: e.target.value }))} /></div>
                <div className="form-group"><Input label="Phone" type="tel" value={editingUser.phone} onChange={e => setEditingUser(u => ({ ...u, phone: e.target.value }))} placeholder="+233 24 000 0000" /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Select label="Role" value={editingUser.role} onChange={e => setEditingUser(u => ({ ...u, role: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
              </div>
              <div className="form-actions">
                <Button variant="primary" type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
                <Button variant="ghost" type="button" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-search-row">
        <input className="users-search" placeholder="Search by name, email or unit..." value={search} onChange={e => setSearch(e.target.value)} />
        <span className="users-count">{filtered.length} of {users.length} users</span>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr><th>User</th><th>Rank / Unit</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={u.id === currentUserId ? "current-user-row" : ""}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">{u.role === 'admin' ? <Crown size={14} /> : <User size={14} />}</div>
                      <div>
                        <div className="user-name">{u.display_name || "—"}</div>
                        <div className="user-email-sm"><Mail size={11} /> {u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-rank">{u.rank || "—"}</div>
                    <div className="user-unit-sm">{u.unit || "—"}</div>
                    {u.phone && <div className="user-unit-sm">📞 {u.phone}</div>}
                  </td>
                  <td><Badge variant={u.role === 'admin' ? 'primary' : 'default'} size="sm">{u.role}</Badge></td>
                  <td className="user-date">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn edit-btn" onClick={() => startEdit(u)} title="Edit"><Pencil size={13} /></button>
                      {u.id !== currentUserId && (
                        deleteConfirm === u.id ? (
                          <div className="inline-confirm">
                            <span>Delete?</span>
                            <button className="confirm-yes" onClick={() => handleDelete(u.id)}>Yes</button>
                            <button className="confirm-no" onClick={() => setDeleteConfirm(null)}>No</button>
                          </div>
                        ) : (
                          <button className="row-btn delete-btn" onClick={() => setDeleteConfirm(u.id)} title="Delete"><Trash2 size={13} /></button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="empty-row">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Reusable CRUD Section ──────────────────────────────────────────────────
function CrudSection({ title, icon, items, form, setForm, emptyForm, editing, setEditing, submitting, deleteConfirm, setDeleteConfirm, onSubmit, onDelete, renderForm, renderItem, onRefresh }) {
  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>{icon} {title}</h2>
        {onRefresh && <button className="icon-action-btn" onClick={onRefresh} title="Refresh"><RefreshCw size={15} /></button>}
      </div>
      <Card variant="default" padding="lg" className="form-card">
        <CardHeader>
          <h3>{editing ? <><Pencil size={15} /> Edit</> : <><Plus size={15} /> Create New</>}</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="admin-form">
            {renderForm()}
            <div className="form-actions">
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
              {editing && (
                <Button variant="ghost" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>
                  <X size={15} /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
      <div className="items-section">
        <h3 className="items-heading">{items.length} {title.replace('Manage ', '')}s</h3>
        <div className="items-list">
          {items.map(item => (
            <div key={item.id} className="item-row">
              <div className="item-row-content">{renderItem(item)}</div>
              <div className="item-row-actions">
                <button className="row-btn edit-btn" onClick={() => { setEditing(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} title="Edit"><Pencil size={13} /></button>
                {deleteConfirm === item.id ? (
                  <div className="inline-confirm">
                    <span>Delete?</span>
                    <button className="confirm-yes" onClick={() => onDelete(item.id)}>Yes</button>
                    <button className="confirm-no" onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                ) : (
                  <button className="row-btn delete-btn" onClick={() => setDeleteConfirm(item.id)} title="Delete"><Trash2 size={13} /></button>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="empty-list">Nothing here yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ── Alerts Tab ─────────────────────────────────────────────────────────────
const EMPTY_ALERT = { title: "", message: "", severity: "medium", status: "active", expires_at: "" };

function AlertsTab({ showSuccess, showError }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_ALERT);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try { setItems(await alertsApi.getAll()); }
    catch (err) { showError(err.message || "Failed to load alerts."); }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (editing) {
      const item = items.find(i => i.id === editing);
      if (item) setForm({ title: item.title, message: item.message, severity: item.severity, status: item.status, expires_at: fmtDate(item.expires_at) });
    } else {
      setForm(EMPTY_ALERT);
    }
  }, [editing, items]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { showError("Title and message required."); return; }
    setSubmitting(true);
    try {
      editing ? await alertsApi.update(editing, form) : await alertsApi.create(form);
      showSuccess(editing ? "Alert updated." : "Alert created.");
      setEditing(null); load();
    } catch (err) { showError(err.message || "Failed to save alert."); }
    finally { setSubmitting(false); }
  };

  const onDelete = async (id) => {
    try { await alertsApi.delete(id); showSuccess("Alert deleted."); load(); }
    catch (err) { showError(err.message || "Failed to delete alert."); }
    finally { setDeleteConfirm(null); }
  };

  return (
    <CrudSection
      title="Manage Alerts" icon={<ShieldAlert size={20} />}
      items={items} form={form} setForm={setForm} emptyForm={EMPTY_ALERT}
      editing={editing} setEditing={setEditing} submitting={submitting}
      deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
      onSubmit={onSubmit} onDelete={onDelete} onRefresh={load}
      renderForm={() => (
        <>
          <div className="form-group"><Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Alert title" /></div>
          <div className="form-group"><Textarea label="Message *" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Alert details..." /></div>
          <div className="form-row">
            <div className="form-group">
              <Select label="Severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                {['low','medium','high','warning','info'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </Select>
            </div>
            <div className="form-group">
              <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>
            <div className="form-group"><Input label="Expires On" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} /></div>
          </div>
        </>
      )}
      renderItem={item => (
        <>
          <div className="item-title">{item.title}</div>
          <div className="item-badges">
            <Badge variant={item.severity === 'high' ? 'error' : item.severity === 'warning' ? 'warning' : 'info'} size="sm">{item.severity}</Badge>
            <Badge variant={item.status === 'active' ? 'success' : 'gray'} size="sm">{item.status}</Badge>
          </div>
          <div className="item-meta">{item.message?.slice(0, 100)}{item.message?.length > 100 ? '…' : ''}</div>
          <div className="item-date">{fmt(item.created_at)}</div>
        </>
      )}
    />
  );
}

// ── Events Tab ─────────────────────────────────────────────────────────────
const EMPTY_EVENT = { title: "", description: "", location: "", date: "", time: "", category: "general", organizer: "Administration" };

function EventsTab({ showSuccess, showError }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_EVENT);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try { setItems(await eventsApi.getAll()); }
    catch (err) { showError(err.message || "Failed to load events."); }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (editing) {
      const item = items.find(i => i.id === editing);
      if (item) setForm({ title: item.title, description: item.description || "", location: item.location, date: fmtDate(item.date), time: item.time || "", category: item.category || "general", organizer: item.organizer || "Administration" });
    } else {
      setForm(EMPTY_EVENT);
    }
  }, [editing, items]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.date) { showError("Title, location, and date required."); return; }
    setSubmitting(true);
    const payload = { ...form, date: new Date(`${form.date}T${form.time || "08:00"}`).toISOString() };
    try {
      editing ? await eventsApi.update(editing, payload) : await eventsApi.create(payload);
      showSuccess(editing ? "Event updated." : "Event created.");
      setEditing(null); load();
    } catch (err) { showError(err.message || "Failed to save event."); }
    finally { setSubmitting(false); }
  };

  const onDelete = async (id) => {
    try { await eventsApi.delete(id); showSuccess("Event deleted."); load(); }
    catch (err) { showError(err.message || "Failed to delete event."); }
    finally { setDeleteConfirm(null); }
  };

  return (
    <CrudSection
      title="Manage Events" icon={<CalendarDays size={20} />}
      items={items} form={form} setForm={setForm} emptyForm={EMPTY_EVENT}
      editing={editing} setEditing={setEditing} submitting={submitting}
      deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
      onSubmit={onSubmit} onDelete={onDelete} onRefresh={load}
      renderForm={() => (
        <>
          <div className="form-group"><Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" /></div>
          <div className="form-group"><Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional details..." /></div>
          <div className="form-group"><Input label="Location *" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main Parade Ground" /></div>
          <div className="form-row">
            <div className="form-group"><Input label="Date *" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="form-group"><Input label="Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['general','ceremony','sports','training','social','operations','education','community'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </Select>
            </div>
            <div className="form-group"><Input label="Organizer" value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} placeholder="e.g. Command HQ" /></div>
          </div>
        </>
      )}
      renderItem={item => (
        <>
          <div className="item-title">{item.title}</div>
          <div className="item-badges"><Badge variant="primary" size="sm">{item.category || 'general'}</Badge></div>
          <div className="item-meta">{item.location} · {item.organizer}</div>
          <div className="item-date">{fmt(item.date)}</div>
        </>
      )}
    />
  );
}

// ── Announcements Tab ──────────────────────────────────────────────────────
const EMPTY_ANN = { title: "", content: "", priority: "medium", category: "general", author: "Admin Office" };

function AnnouncementsTab({ showSuccess, showError }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_ANN);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try { setItems(await announcementsApi.getAll()); }
    catch (err) { showError(err.message || "Failed to load announcements."); }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (editing) {
      const item = items.find(i => i.id === editing);
      if (item) setForm({ title: item.title, content: item.content, priority: item.priority, category: item.category || "general", author: item.author || "Admin Office" });
    } else {
      setForm(EMPTY_ANN);
    }
  }, [editing, items]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { showError("Title and content required."); return; }
    setSubmitting(true);
    try {
      editing ? await announcementsApi.update(editing, form) : await announcementsApi.create(form);
      showSuccess(editing ? "Announcement updated." : "Announcement posted.");
      setEditing(null); load();
    } catch (err) { showError(err.message || "Failed to save announcement."); }
    finally { setSubmitting(false); }
  };

  const onDelete = async (id) => {
    try { await announcementsApi.delete(id); showSuccess("Announcement deleted."); load(); }
    catch (err) { showError(err.message || "Failed to delete announcement."); }
    finally { setDeleteConfirm(null); }
  };

  return (
    <CrudSection
      title="Manage Announcements" icon={<Megaphone size={20} />}
      items={items} form={form} setForm={setForm} emptyForm={EMPTY_ANN}
      editing={editing} setEditing={setEditing} submitting={submitting}
      deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
      onSubmit={onSubmit} onDelete={onDelete} onRefresh={load}
      renderForm={() => (
        <>
          <div className="form-group"><Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" /></div>
          <div className="form-group"><Textarea label="Content *" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} placeholder="Write your announcement..." /></div>
          <div className="form-row">
            <div className="form-group">
              <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['low','medium','high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </Select>
            </div>
            <div className="form-group">
              <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['general','personnel','welfare','education','security','infrastructure','health'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </Select>
            </div>
            <div className="form-group"><Input label="Author" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="e.g. Air Force HQ" /></div>
          </div>
        </>
      )}
      renderItem={item => (
        <>
          <div className="item-title">{item.title}</div>
          <div className="item-badges">
            <Badge variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'info'} size="sm">{item.priority}</Badge>
            <Badge variant="default" size="sm">{item.category}</Badge>
          </div>
          <div className="item-meta">{item.content?.slice(0, 100)}{item.content?.length > 100 ? '…' : ''}</div>
          <div className="item-date">By {item.author} · {fmt(item.created_at)}</div>
        </>
      )}
    />
  );
}

// ── Settings Tab ───────────────────────────────────────────────────────────
function SettingsTab() {
  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <div>
          <h2><Settings2 size={20} /> Settings</h2>
          <p className="tab-sub">Portal configuration and system information</p>
        </div>
      </div>
      <div className="settings-grid">
        <div className="info-card">
          <h3><Activity size={16} /> Portal Features</h3>
          <div className="info-grid">
            {["Alert Management","Event Scheduling","Announcements","User Management","Analytics Dashboard"].map(f => (
              <div key={f} className="info-row">
                <span className="info-label">{f}</span>
                <span className="info-value"><Badge variant="success">Active</Badge></span>
              </div>
            ))}
          </div>
        </div>
        <div className="info-card">
          <h3><ShieldCheck size={16} /> System Info</h3>
          <div className="info-grid">
            {[
              ["Database", <Badge variant="success">Connected</Badge>],
              ["Portal",   <Badge variant="success">Operational</Badge>],
              ["Role",     <Badge variant="primary">Administrator</Badge>],
              ["Version",  "1.0.0"],
            ].map(([k, v]) => (
              <div key={k} className="info-row">
                <span className="info-label">{k}</span>
                <span className="info-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
