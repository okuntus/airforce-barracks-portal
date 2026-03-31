import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

const THEME_PREFERENCE_KEY = 'appThemePreference';
const THEME_RESOLVED_KEY = 'appTheme';
const THEME_OPTIONS = new Set(['light', 'dark', 'system']);

const sanitizeTheme = (t = 'system') => THEME_OPTIONS.has(t) ? t : 'system';

const getSystemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const resolveTheme = (pref = 'system') => {
  const p = sanitizeTheme(pref);
  return p === 'system' ? getSystemTheme() : p;
};

const getStoredThemePref = () => {
  if (typeof localStorage === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_PREFERENCE_KEY);
  if (stored) return sanitizeTheme(stored);
  return sanitizeTheme(localStorage.getItem(THEME_RESOLVED_KEY) || 'system');
};

function applyTheme(pref) {
  const preference = sanitizeTheme(pref);
  const resolved = resolveTheme(preference);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-preference', preference);
    document.documentElement.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0b1220' : '#eef3fa');
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    localStorage.setItem(THEME_RESOLVED_KEY, resolved);
  }
  return { preference, resolvedTheme: resolved };
}

function applyCompactMode(compact) {
  const val = compact ? 'true' : 'false';
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-compact', val);
  if (typeof localStorage !== 'undefined') localStorage.setItem('appCompactMode', val);
}

const defaultProfile = (email = '') => ({
  displayName: email ? email.split('@')[0] : 'User',
  rank: 'Personnel',
  unit: 'Community Member',
  phone: '',
  bio: ''
});

const defaultSettings = (theme = 'system') => ({
  theme: sanitizeTheme(theme),
  emailNotifications: true,
  smsNotifications: false,
  compactMode: false
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(defaultProfile());
  const [userSettings, setUserSettings] = useState(defaultSettings());
  const [resolvedTheme, setResolvedTheme] = useState(resolveTheme(getStoredThemePref()));
  const [loading, setLoading] = useState(true);

  // Apply stored theme on mount
  useEffect(() => {
    const { resolvedTheme: rt } = applyTheme(getStoredThemePref());
    setResolvedTheme(rt);

    // Restore session from JWT
    const token = authApi.getToken();
    if (token) {
      authApi.me()
        .then(user => {
          setCurrentUser({ uid: user.id, email: user.email });
          setUserRole(user.role);
          setUserProfile({
            ...defaultProfile(user.email),
            displayName: user.displayName || defaultProfile(user.email).displayName,
            rank: user.rank || 'Personnel',
            unit: user.unit || 'Community Member'
          });
        })
        .catch(() => authApi.removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (sanitizeTheme(userSettings?.theme) !== 'system') return;
      const { resolvedTheme: rt } = applyTheme('system');
      setResolvedTheme(rt);
    };
    mq.addEventListener?.('change', handler) ?? mq.addListener?.(handler);
    return () => mq.removeEventListener?.('change', handler) ?? mq.removeListener?.(handler);
  }, [userSettings?.theme]);

  const login = async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    authApi.setToken(token);
    setCurrentUser({ uid: user.id, email: user.email });
    setUserRole(user.role);
    setUserProfile({
      ...defaultProfile(user.email),
      displayName: user.displayName || defaultProfile(user.email).displayName
    });
  };

  const register = async (email, password, fullName) => {
    const displayName = fullName?.trim() || email.split('@')[0];
    const { token, user } = await authApi.register(email, password, displayName);
    authApi.setToken(token);
    setCurrentUser({ uid: user.id, email: user.email });
    setUserRole(user.role);
    setUserProfile({ ...defaultProfile(user.email), displayName: user.displayName || displayName });
  };

  const logout = () => {
    authApi.removeToken();
    setCurrentUser(null);
    setUserRole(null);
    setUserProfile(defaultProfile());
  };

  const updateUserProfile = (updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const updateUserSettings = (updates) => {
    setUserSettings(prev => {
      const next = { ...prev, ...updates };
      if (updates.theme) {
        const { resolvedTheme: rt } = applyTheme(updates.theme);
        setResolvedTheme(rt);
      }
      applyCompactMode(next.compactMode);
      return next;
    });
  };

  const isAdmin = () => userRole === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser, userRole, userProfile, userSettings, resolvedTheme,
      login, register, logout, updateUserProfile, updateUserSettings,
      isAdmin, loading, isDemoMode: false
    }}>
      {children}
    </AuthContext.Provider>
  );
};
