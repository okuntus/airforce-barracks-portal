import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

const defaultProfile = (email = '') => ({
  displayName: email ? email.split('@')[0] : 'User',
  rank: 'Personnel',
  unit: 'Community Member',
  phone: '',
  bio: ''
});

const THEME_PREFERENCE_KEY = 'appThemePreference';
const THEME_RESOLVED_KEY = 'appTheme';
const THEME_OPTIONS = new Set(['light', 'dark', 'system']);

const sanitizeThemePreference = (theme = 'system') => (
  THEME_OPTIONS.has(theme) ? theme : 'system'
);

const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveThemePreference = (themePreference = 'system') => {
  const preference = sanitizeThemePreference(themePreference);
  return preference === 'system' ? getSystemTheme() : preference;
};

const getStoredThemePreference = () => {
  if (typeof localStorage === 'undefined') {
    return 'system';
  }

  const storedPreference = localStorage.getItem(THEME_PREFERENCE_KEY);
  if (storedPreference) {
    return sanitizeThemePreference(storedPreference);
  }

  // Backward compatibility for previous versions that only stored resolved theme.
  const legacyResolvedTheme = localStorage.getItem(THEME_RESOLVED_KEY);
  return sanitizeThemePreference(legacyResolvedTheme || 'system');
};

const defaultSettings = (theme = 'system') => ({
  theme: sanitizeThemePreference(theme),
  emailNotifications: true,
  smsNotifications: false,
  compactMode: false
});

function applyTheme(themePreference) {
  const preference = sanitizeThemePreference(themePreference);
  const resolvedTheme = resolveThemePreference(preference);
  const browserThemeColor = resolvedTheme === 'dark' ? '#0b1220' : '#eef3fa';

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-preference', preference);
    document.documentElement.style.colorScheme = resolvedTheme;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', browserThemeColor);
    }
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    localStorage.setItem(THEME_RESOLVED_KEY, resolvedTheme);
  }

  return { preference, resolvedTheme };
}

function applyCompactMode(compactMode) {
  const mode = compactMode ? 'true' : 'false';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-compact', mode);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('appCompactMode', mode);
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(defaultProfile());
  const [userSettings, setUserSettings] = useState(defaultSettings());
  const [resolvedTheme, setResolvedTheme] = useState(resolveThemePreference(getStoredThemePreference()));
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const savedThemePreference = getStoredThemePreference();
    const { preference: normalizedThemePreference, resolvedTheme: initialResolvedTheme } = applyTheme(savedThemePreference);
    setResolvedTheme(initialResolvedTheme);

    // Check for demo user on mount first
    const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
    if (demoUser.email) {
      const nextProfile = {
        ...defaultProfile(demoUser.email),
        ...(demoUser.profile || {})
      };
      const nextSettings = {
        ...defaultSettings(normalizedThemePreference),
        ...(demoUser.settings || {})
      };

      setCurrentUser({
        uid: 'demo-' + demoUser.email,
        email: demoUser.email,
        isDemo: true
      });
      setUserRole(demoUser.role || 'user');
      setUserProfile(nextProfile);
      setUserSettings(nextSettings);
      const { resolvedTheme: appliedTheme } = applyTheme(nextSettings.theme);
      setResolvedTheme(appliedTheme);
      applyCompactMode(nextSettings.compactMode);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // If Firebase is not configured, skip listener and stay in instant demo mode.
    if (!auth || !db) {
      setUserProfile(defaultProfile('user@demo.com'));
      const nextSettings = defaultSettings(normalizedThemePreference);
      setUserSettings(nextSettings);
      const { resolvedTheme: appliedTheme } = applyTheme(nextSettings.theme);
      setResolvedTheme(appliedTheme);
      applyCompactMode(nextSettings.compactMode);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // Try to set up Firebase auth listener with error handling
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        setIsDemoMode(false);
        
        if (user) {
          // Fetch user role from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              const nextProfile = {
                ...defaultProfile(user.email),
                ...(data.profile || {})
              };
              const nextSettings = {
                ...defaultSettings(normalizedThemePreference),
                ...(data.settings || {})
              };

              setUserRole(data.role || 'user');
              setUserProfile(nextProfile);
              setUserSettings(nextSettings);
              const { resolvedTheme: appliedTheme } = applyTheme(nextSettings.theme);
              setResolvedTheme(appliedTheme);
              applyCompactMode(nextSettings.compactMode);
            } else {
              // Default role for new users
              setUserRole('user');
              const nextProfile = defaultProfile(user.email);
              const nextSettings = defaultSettings(normalizedThemePreference);
              setUserProfile(nextProfile);
              setUserSettings(nextSettings);
              const { resolvedTheme: appliedTheme } = applyTheme(nextSettings.theme);
              setResolvedTheme(appliedTheme);
              applyCompactMode(nextSettings.compactMode);

              // Create user document with default role
              await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                role: 'user',
                profile: nextProfile,
                settings: nextSettings,
                createdAt: new Date()
              });
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('user');
            const nextProfile = defaultProfile(user.email);
            const nextSettings = defaultSettings(normalizedThemePreference);
            setUserProfile(nextProfile);
            setUserSettings(nextSettings);
            const { resolvedTheme: appliedTheme } = applyTheme(nextSettings.theme);
            setResolvedTheme(appliedTheme);
            applyCompactMode(nextSettings.compactMode);
          }
        } else {
          setUserRole(null);
          setUserProfile(defaultProfile());
          const nextSettings = defaultSettings(normalizedThemePreference);
          setUserSettings(nextSettings);
          const { resolvedTheme: appliedTheme } = applyTheme(nextSettings.theme);
          setResolvedTheme(appliedTheme);
          applyCompactMode(nextSettings.compactMode);
        }
        
        setLoading(false);
      }, (error) => {
        // Handle Firebase initialization errors
        console.error('Firebase auth error:', error);
        console.log('Firebase not properly configured, using demo mode');
        setLoading(false);
      });
    } catch (error) {
      console.error('Failed to initialize Firebase auth:', error);
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (sanitizeThemePreference(userSettings?.theme) !== 'system') {
        return;
      }

      const { resolvedTheme: nextResolvedTheme } = applyTheme('system');
      setResolvedTheme(nextResolvedTheme);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, [userSettings?.theme]);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const demoLogin = (user) => {
    const savedThemePreference = getStoredThemePreference();
    const { preference: themePreference } = applyTheme(savedThemePreference);
    const profile = {
      ...defaultProfile(user.email),
      ...(user.profile || {}),
      displayName: user.name || user.username || defaultProfile(user.email).displayName
    };
    const settings = {
      ...defaultSettings(themePreference),
      ...(user.settings || {})
    };

    // Demo mode login - store in localStorage
    const demoUser = {
      email: user.email,
      role: user.role || 'user',
      profile,
      settings
    };
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    setCurrentUser({
      uid: 'demo-' + user.email,
      email: user.email,
      isDemo: true
    });
    setUserRole(user.role || 'user');
    setUserProfile(profile);
    setUserSettings(settings);
    const { resolvedTheme: appliedTheme } = applyTheme(settings.theme);
    setResolvedTheme(appliedTheme);
    applyCompactMode(settings.compactMode);
    setIsDemoMode(true);
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;

    const nextProfile = {
      ...userProfile,
      ...updates
    };

    setUserProfile(nextProfile);

    try {
      if (isDemoMode) {
        const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
        localStorage.setItem('demoUser', JSON.stringify({
          ...demoUser,
          profile: nextProfile
        }));
        return;
      }

      if (db && currentUser?.uid) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          profile: nextProfile
        }, { merge: true });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const updateUserSettings = async (updates) => {
    if (!currentUser) return;

    const nextSettings = {
      ...userSettings,
      ...updates
    };

    setUserSettings(nextSettings);
    if (nextSettings.theme) {
      const { resolvedTheme: appliedTheme } = applyTheme(nextSettings.theme);
      setResolvedTheme(appliedTheme);
    }
    applyCompactMode(nextSettings.compactMode);

    try {
      if (isDemoMode) {
        const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
        localStorage.setItem('demoUser', JSON.stringify({
          ...demoUser,
          settings: nextSettings
        }));
        return;
      }

      if (db && currentUser?.uid) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          settings: nextSettings
        }, { merge: true });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const register = async (email, password, role = 'user') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document with role
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role,
        createdAt: new Date()
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isDemoMode) {
        // Demo mode logout - clear localStorage
        localStorage.removeItem('demoUser');
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(defaultProfile());
        setIsDemoMode(false);
      } else {
        // Firebase logout
        await signOut(auth);
      }
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = () => {
    return userRole === 'admin';
  };

  const value = {
    currentUser,
    userRole,
    userProfile,
    userSettings,
    resolvedTheme,
    login,
    demoLogin,
    register,
    logout,
    updateUserProfile,
    updateUserSettings,
    isAdmin,
    loading,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
