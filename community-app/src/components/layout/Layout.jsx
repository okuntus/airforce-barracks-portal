import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  House,
  Megaphone,
  CalendarDays,
  ShieldAlert,
  Settings2,
  UserCircle2,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Moon,
  RotateCcw,
  Save,
  Sun,
  UserCog,
  X
} from 'lucide-react';
import GhanaAirForceLogo from '../../assets/images.jpg';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    userRole,
    userProfile,
    userSettings,
    resolvedTheme,
    updateUserProfile,
    updateUserSettings,
    logout,
    isAdmin,
  } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [draftProfile, setDraftProfile] = useState(userProfile);
  const [draftSettings, setDraftSettings] = useState(userSettings);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const displayName = userProfile?.displayName?.trim() || currentUser?.email?.split('@')[0] || 'User';

  const buildDefaultProfile = () => ({
    displayName: currentUser?.email?.split('@')[0] || 'User',
    rank: 'Personnel',
    unit: 'Community Member',
    phone: '',
    bio: ''
  });

  const buildDefaultSettings = () => ({
    theme: 'system',
    emailNotifications: true,
    smsNotifications: false,
    compactMode: false
  });

  const activeTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const themePreference = draftSettings.theme || 'system';
  const themePreferenceLabel = themePreference === 'system'
    ? `Following system (${activeTheme === 'dark' ? 'Dark' : 'Light'})`
    : `Manually set to ${themePreference === 'dark' ? 'Dark' : 'Light'}`;

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (showSettingsModal) {
      setDraftProfile(userProfile);
      setDraftSettings(userSettings);
    }
  }, [showSettingsModal, userProfile, userSettings]);

  const openSettingsModal = () => {
    setActiveSettingsTab('profile');
    setSettingsMessage('');
    setSettingsError('');
    setShowUserMenu(false);
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setSettingsMessage('');
    setSettingsError('');
  };

  const handleSaveProfile = async () => {
    setSettingsError('');
    setSettingsMessage('');
    if (!draftProfile.displayName?.trim()) {
      setSettingsError('✗ Display name is required.');
      return;
    }

    try {
      await updateUserProfile({
        ...draftProfile,
        displayName: draftProfile.displayName.trim()
      });
      // Persist to backend
      const { authApi } = await import('../../services/api');
      await authApi.updateProfile({
        displayName: draftProfile.displayName.trim(),
        rank: draftProfile.rank,
        unit: draftProfile.unit
      });
      setSettingsMessage('✓ Profile updated successfully.');
    } catch (error) {
      console.error('Save profile failed:', error);
      setSettingsError('✗ Failed to save profile. Please try again.');
    }
  };

  const handleSavePreferences = async () => {
    setSettingsError('');
    setSettingsMessage('');
    try {
      await updateUserSettings(draftSettings);
      setSettingsMessage('✓ Preferences saved successfully.');
    } catch (error) {
      console.error('Save preferences failed:', error);
      setSettingsError('✗ Failed to save preferences. Please try again.');
    }
  };

  const handleThemeQuickToggle = async () => {
    try {
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
      await updateUserSettings({ theme: nextTheme });
      setShowUserMenu(false);
    } catch (error) {
      console.error('Theme toggle failed:', error);
    }
  };

  const handleResetDefaults = async () => {
    setSettingsError('');
    setSettingsMessage('');

    const nextProfile = buildDefaultProfile();
    const nextSettings = buildDefaultSettings();

    try {
      await Promise.all([
        updateUserProfile(nextProfile),
        updateUserSettings(nextSettings)
      ]);
      setDraftProfile(nextProfile);
      setDraftSettings(nextSettings);
      setActiveSettingsTab('profile');
      setSettingsMessage('✓ Profile and preferences reset to defaults.');
    } catch (error) {
      console.error('Reset defaults failed:', error);
      setSettingsError('✗ Failed to reset. Please try again.');
    }
  };

  return (
    <div className="layout">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo & Brand */}
          <div className="navbar-brand">
            <div className="brand-icon">
              <img src={GhanaAirForceLogo} alt="Ghana Air Force Logo" className="brand-logo" />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Airforce Information Portal</h1>
              <p className="brand-subtitle">Information Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navbar-links">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
            >
              <span className="nav-icon"><House size={18} strokeWidth={2} /></span>
              <span className="nav-text">Home</span>
            </Link>
            
            <Link 
              to="/announcements" 
              className={`nav-link ${isActive('/announcements') ? 'nav-link-active' : ''}`}
            >
              <span className="nav-icon"><Megaphone size={18} strokeWidth={2} /></span>
              <span className="nav-text">Announcements</span>
            </Link>
            
            <Link 
              to="/events" 
              className={`nav-link ${isActive('/events') ? 'nav-link-active' : ''}`}
            >
              <span className="nav-icon"><CalendarDays size={18} strokeWidth={2} /></span>
              <span className="nav-text">Events</span>
            </Link>
            
            <Link 
              to="/alerts" 
              className={`nav-link ${isActive('/alerts') ? 'nav-link-active' : ''}`}
            >
              <span className="nav-icon"><ShieldAlert size={18} strokeWidth={2} /></span>
              <span className="nav-text">Alerts</span>
            </Link>
            
            {/* Admin link - only visible to admins */}
            {isAdmin() && (
              <Link 
                to="/admin" 
                className={`nav-link nav-link-admin ${isActive('/admin') ? 'nav-link-active' : ''}`}
              >
                <span className="nav-icon"><Settings2 size={18} strokeWidth={2} /></span>
                <span className="nav-text">Admin</span>
              </Link>
            )}
          </div>

          {/* User Profile */}
          <div className="navbar-actions">
            <div className="user-menu">
              <button 
                className="user-avatar-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {isAdmin() ? <ShieldCheck size={20} strokeWidth={2} /> : <UserCircle2 size={20} strokeWidth={2} />}
                </div>
                <div className="user-info">
                  <span className="user-email">{displayName}</span>
                  <span className="user-role">{userRole === 'admin' ? 'Administrator' : 'User'}</span>
                </div>
                <span className="dropdown-icon"><ChevronDown size={14} strokeWidth={2} /></span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-email">{currentUser?.email}</div>
                    <div className="user-dropdown-role-badge">
                      {userRole === 'admin' ? <ShieldCheck size={13} strokeWidth={2} /> : <UserCircle2 size={13} strokeWidth={2} />} {userRole === 'admin' ? 'Admin' : 'User'}
                    </div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <button onClick={openSettingsModal} className="user-dropdown-item">
                    <UserCog size={14} strokeWidth={2} /> Profile & Settings
                  </button>
                  <button onClick={handleThemeQuickToggle} className="user-dropdown-item">
                    {activeTheme === 'dark' ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
                    {activeTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </button>
                  <div className="user-dropdown-divider"></div>
                  <button onClick={handleLogout} className="user-dropdown-item logout">
                    <LogOut size={14} strokeWidth={2} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {showSettingsModal && (
        <div className="settings-modal-backdrop" onClick={closeSettingsModal}>
          <div className="settings-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Profile and settings">
            <div className="settings-modal-header">
              <h2>Profile and Settings</h2>
              <button className="settings-close-btn" onClick={closeSettingsModal}>
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="settings-tab-row">
              <button
                className={`settings-tab ${activeSettingsTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('profile')}
              >
                Profile
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('preferences')}
              >
                Preferences
              </button>
            </div>

            {settingsMessage && <div className="settings-success-msg">{settingsMessage}</div>}
            {settingsError && <div className="settings-error-msg">{settingsError}</div>}

            {activeSettingsTab === 'profile' && (
              <div className="settings-form-grid">
                <label>
                  Display Name
                  <input
                    type="text"
                    value={draftProfile.displayName || ''}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, displayName: event.target.value }))}
                    placeholder="Your display name"
                  />
                </label>
                <label>
                  Rank / Title
                  <input
                    type="text"
                    value={draftProfile.rank || ''}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, rank: event.target.value }))}
                    placeholder="e.g. Flight Lieutenant"
                  />
                </label>
                <label>
                  Unit / Department
                  <input
                    type="text"
                    value={draftProfile.unit || ''}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, unit: event.target.value }))}
                    placeholder="e.g. Engineering Unit"
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    type="text"
                    value={draftProfile.phone || ''}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Contact number"
                  />
                </label>
                <label className="settings-full-width">
                  Bio
                  <textarea
                    value={draftProfile.bio || ''}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, bio: event.target.value }))}
                    placeholder="Short bio"
                    rows={4}
                  />
                </label>
              </div>
            )}

            {activeSettingsTab === 'preferences' && (
              <div className="settings-form-grid">
                <label>
                  Theme
                  <select
                    value={draftSettings.theme || 'system'}
                    onChange={(event) => setDraftSettings((prev) => ({ ...prev, theme: event.target.value }))}
                  >
                    <option value="system">System (Auto)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>

                <p className="settings-theme-hint settings-full-width">{themePreferenceLabel}</p>

                <label className="settings-toggle-row settings-full-width">
                  <input
                    type="checkbox"
                    checked={Boolean(draftSettings.emailNotifications)}
                    onChange={(event) => setDraftSettings((prev) => ({ ...prev, emailNotifications: event.target.checked }))}
                  />
                  <span>Email notifications</span>
                </label>

                <label className="settings-toggle-row settings-full-width">
                  <input
                    type="checkbox"
                    checked={Boolean(draftSettings.smsNotifications)}
                    onChange={(event) => setDraftSettings((prev) => ({ ...prev, smsNotifications: event.target.checked }))}
                  />
                  <span>SMS notifications</span>
                </label>

                <label className="settings-toggle-row settings-full-width">
                  <input
                    type="checkbox"
                    checked={Boolean(draftSettings.compactMode)}
                    onChange={(event) => setDraftSettings((prev) => ({ ...prev, compactMode: event.target.checked }))}
                  />
                  <span>Compact spacing mode</span>
                </label>
              </div>
            )}

            <div className="settings-modal-actions">
              <button className="settings-btn reset" onClick={handleResetDefaults}>
                <RotateCcw size={15} strokeWidth={2} /> Reset to Defaults
              </button>
              <button className="settings-btn secondary" onClick={closeSettingsModal}>Cancel</button>
              {activeSettingsTab === 'profile' ? (
                <button className="settings-btn primary" onClick={handleSaveProfile}>
                  <Save size={15} strokeWidth={2} /> Save Profile
                </button>
              ) : (
                <button className="settings-btn primary" onClick={handleSavePreferences}>
                  <Save size={15} strokeWidth={2} /> Save Preferences
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="footer-text">
            © {new Date().getFullYear()} Airforce Information Portal. All rights reserved.
          </p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
