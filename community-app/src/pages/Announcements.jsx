import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { CalendarDays, Inbox, Megaphone, RefreshCw, Search, UserCircle2 } from "lucide-react";
import { announcementsApi } from "../services/api";
import './Pages.css';

const PRIORITY_VARIANT = { high: 'error', medium: 'warning', low: 'info' };

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const load = async () => {
    setLoading(true); setError('');
    try { setAnnouncements(await announcementsApi.getAll()); }
    catch (err) { setError(err.message || 'Failed to load announcements.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const categories = ['all', ...new Set(announcements.map(a => a.category || 'general'))];

  const filtered = announcements.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || (a.category || 'general') === categoryFilter;
    const matchPri = priorityFilter === 'all' || a.priority === priorityFilter;
    return matchSearch && matchCat && matchPri;
  });

  if (loading) return (
    <div className="page-container">
      <div className="loading-state"><div className="loading-spinner"></div><p>Loading announcements...</p></div>
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
            <span className="page-icon"><Megaphone size={30} strokeWidth={2} /></span>
            Announcements
          </h1>
          <p className="page-subtitle">Stay updated with the latest community news and important updates</p>
        </div>
        <div className="page-header-actions">
          <Badge variant="primary" size="lg">{announcements.length} Total</Badge>
          <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        {search && <button className="search-clear" onClick={() => setSearch('')}>×</button>}
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-bar">
          {categories.map(cat => (
            <button key={cat} className={`filter-btn ${categoryFilter === cat ? 'filter-btn-active' : ''}`} onClick={() => setCategoryFilter(cat)}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          {['all', 'high', 'medium', 'low'].map(p => (
            <button key={p} className={`filter-btn filter-btn-sm ${priorityFilter === p ? 'filter-btn-active' : ''}`} onClick={() => setPriorityFilter(p)}>
              {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card padding="lg">
          <div className="empty-state">
            <span className="empty-icon"><Inbox size={46} strokeWidth={2} /></span>
            <h3>No Announcements</h3>
            <p>{search ? `No results for "${search}"` : 'No announcements match the selected filters.'}</p>
          </div>
        </Card>
      ) : (
        <div className="content-list">
          {filtered.map(item => (
            <Card key={item.id} hover padding="lg" className="announcement-card">
              <div className="announcement-header">
                <h3 className="announcement-title">{item.title}</h3>
                <div className="announcement-badges">
                  <Badge variant={PRIORITY_VARIANT[item.priority] || 'info'} size="sm">
                    {item.priority || 'medium'}
                  </Badge>
                  <Badge variant="default" size="sm">{item.category || 'general'}</Badge>
                </div>
              </div>
              <p className="announcement-message">{item.content}</p>
              <div className="announcement-footer">
                <span className="announcement-author">
                  <UserCircle2 size={13} strokeWidth={2} /> {item.author || 'Admin'}
                </span>
                <span className="announcement-date">
                  <CalendarDays size={13} strokeWidth={2} />
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
