import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { AlarmClock, CalendarDays, CircleCheckBig, RefreshCw, ShieldAlert } from "lucide-react";
import { alertsApi } from "../services/api";
import './Pages.css';

const SEVERITY_VARIANT = { high: 'error', warning: 'warning', medium: 'warning', info: 'info', low: 'success' };
const CARD_VARIANT = { high: 'error', warning: 'warning', medium: 'default', info: 'info', low: 'default' };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setAlerts(await alertsApi.getAll());
    } catch (err) {
      setError(err.message || 'Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = alerts.filter(a => {
    const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSeverity && matchStatus;
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;

  if (loading) return (
    <div className="page-container">
      <div className="loading-state"><div className="loading-spinner"></div><p>Loading alerts...</p></div>
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
            <span className="page-icon"><ShieldAlert size={30} strokeWidth={2} /></span>
            Emergency Alerts
          </h1>
          <p className="page-subtitle">Critical updates and emergency notifications for the community</p>
        </div>
        <div className="page-header-actions">
          <Badge variant="error" size="lg" dot>{activeCount} Active</Badge>
          <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-bar">
          {['all', 'high', 'warning', 'medium', 'info', 'low'].map(s => (
            <button key={s} className={`filter-btn ${severityFilter === s ? 'filter-btn-active' : ''}`} onClick={() => setSeverityFilter(s)}>
              {s === 'all' ? `All (${alerts.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${alerts.filter(a => a.severity === s).length})`}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          {['active', 'resolved', 'all'].map(s => (
            <button key={s} className={`filter-btn filter-btn-sm ${statusFilter === s ? 'filter-btn-active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="content-list">
        {filtered.length === 0 ? (
          <Card padding="lg">
            <div className="empty-state">
              <span className="empty-icon"><CircleCheckBig size={46} strokeWidth={2} /></span>
              <h3>No Alerts</h3>
              <p>{severityFilter === 'all' && statusFilter === 'active' ? 'No active alerts. All clear!' : 'No alerts match the selected filters.'}</p>
            </div>
          </Card>
        ) : (
          filtered.map(alert => (
            <Card key={alert.id} hover padding="lg" variant={CARD_VARIANT[alert.severity] || 'default'} className="alert-card">
              <div className="alert-card-header">
                <div className="alert-badges">
                  <Badge variant={SEVERITY_VARIANT[alert.severity] || 'default'} size="sm" dot>
                    {alert.severity?.toUpperCase()}
                  </Badge>
                  <Badge variant={alert.status === 'active' ? 'success' : 'gray'} size="sm">
                    {alert.status === 'active' ? 'Active' : 'Resolved'}
                  </Badge>
                </div>
                <span className="alert-date">
                  <CalendarDays size={13} strokeWidth={2} />
                  {alert.created_at ? new Date(alert.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                </span>
              </div>
              <h3 className="alert-title">{alert.title}</h3>
              <p className="alert-message">{alert.message}</p>
              {alert.expires_at && (
                <div className="alert-footer">
                  <span className="alert-expires">
                    <AlarmClock size={13} strokeWidth={2} />
                    Expires: {new Date(alert.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
