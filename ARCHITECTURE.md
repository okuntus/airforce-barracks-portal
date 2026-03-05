# 🏗️ Technical Architecture Document

**Project:** Airforce Barracks Community Portal  
**Version:** 1.0.0  
**Date:** March 5, 2026

---

## 1. System Overview

### 1.1 Architecture Principles
- **Separation of Concerns**: Clear separation between UI, business logic, and data layers
- **Component-Based Architecture**: Modular, reusable React components
- **Real-time Data**: Live updates using Firebase real-time capabilities
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Security First**: Defense in depth with multiple security layers

### 1.2 Technology Stack

#### Frontend Layer
```
React 18.2.0 + Vite 5.4.21
├── React Router DOM 7.13.1 (Routing)
├── Firebase 12.10.0 (Backend Services)
└── Inline CSS (Styling)
```

#### Backend Layer
```
Firebase (Google Cloud Platform)
├── Firestore (NoSQL Database)
├── Firebase Auth (Authentication)
├── Firebase Hosting (Deployment)
└── Firebase Security Rules (Access Control)
```

#### Development Tools
```
├── ESLint (Code Quality)
├── Prettier (Code Formatting)
├── GitHub Actions (CI/CD)
└── VS Code (IDE)
```

---

## 2. Application Architecture

### 2.1 Component Hierarchy

```
App (Root Component)
├── BrowserRouter (React Router)
│   └── Routes
│       └── Route (Layout Wrapper)
│           ├── Layout Component
│           │   ├── Navigation Component
│           │   └── Outlet (Dynamic Content)
│           │
│           ├── Home Page
│           │   ├── Firebase Data Fetch
│           │   ├── Content Preview Cards
│           │   └── Navigation Links
│           │
│           ├── Announcements Page
│           │   ├── Firebase Query (announcements)
│           │   ├── Announcement List
│           │   └── Loading/Error States
│           │
│           ├── Events Page
│           │   ├── Firebase Query (events)
│           │   ├── Event Cards
│           │   └── Date/Time Formatting
│           │
│           ├── Alerts Page
│           │   ├── Firebase Query (alerts)
│           │   ├── Severity-Based Styling
│           │   └── Alert Cards
│           │
│           └── Admin Page
│               ├── Tab Navigation
│               ├── Form Components
│               │   ├── Alert Form
│               │   ├── Event Form
│               │   └── Announcement Form
│               └── Firebase Write Operations
```

### 2.2 Data Flow Architecture

#### Unidirectional Data Flow
```
User Interaction → Component State → Firebase Operation → Database → Real-time Update → UI Re-render
```

#### State Management Pattern
```javascript
// Component-level state using React Hooks
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Effect for data fetching
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await firebaseOperation();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependencies]);
```

---

## 3. Database Design

### 3.1 Firestore Collections Structure

#### Collection: `/announcements`
```javascript
// Document Structure
{
  id: "auto-generated-document-id",
  title: "string (required, indexed)",
  message: "string (required)",
  createdAt: "timestamp (required, indexed)",
  updatedAt: "timestamp (optional)",
  category: "string (optional, future)",
  priority: "string (optional, future)",
  author: "string (optional, future)",
  status: "string (default: 'published')"
}

// Indexes Required
- createdAt (descending)
- Composite: createdAt + status
```

#### Collection: `/events`
```javascript
// Document Structure
{
  id: "auto-generated-document-id",
  title: "string (required, indexed)",
  location: "string (required)",
  date: "timestamp (required, indexed)",
  time: "string (required)",
  description: "string (optional)",
  createdAt: "timestamp (required)",
  updatedAt: "timestamp (optional)",
  category: "string (optional, future)",
  maxAttendees: "number (optional, future)",
  registrationRequired: "boolean (default: false)",
  status: "string (default: 'upcoming')"
}

// Indexes Required
- date (ascending)
- createdAt (descending)
- Composite: date + status
```

#### Collection: `/alerts`
```javascript
// Document Structure
{
  id: "auto-generated-document-id",
  title: "string (required, indexed)",
  message: "string (required)",
  severity: "string (required: 'low'|'medium'|'high')",
  date: "timestamp (required)",
  status: "string (default: 'active')",
  createdAt: "timestamp (required, indexed)",
  expiresAt: "timestamp (optional)",
  acknowledgedBy: "array (optional, future)",
  category: "string (optional, future)",
  targetAudience: "string (default: 'all')"
}

// Indexes Required
- createdAt (descending)
- status (ascending)
- Composite: status + createdAt
- Composite: severity + createdAt
```

### 3.2 Database Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return request.auth != null &&
             request.auth.token.admin == true;
    }

    function isValidAnnouncement() {
      return request.resource.data.keys().hasAll(['title', 'message', 'createdAt']) &&
             request.resource.data.title is string &&
             request.resource.data.title.size() > 0 &&
             request.resource.data.title.size() <= 200 &&
             request.resource.data.message is string &&
             request.resource.data.message.size() > 0 &&
             request.resource.data.message.size() <= 2000;
    }

    // Announcements rules
    match /announcements/{document} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() && isValidAnnouncement();
      allow update: if isAdmin() && isValidAnnouncement();
      allow delete: if isAdmin();
    }

    // Events rules
    match /events/{document} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() &&
                   request.resource.data.keys().hasAll(['title', 'location', 'date', 'time']);
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Alerts rules
    match /alerts/{document} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() &&
                   request.resource.data.keys().hasAll(['title', 'message', 'severity']) &&
                   request.resource.data.severity in ['low', 'medium', 'high'];
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

---

## 4. API Design

### 4.1 Firebase Service Layer

#### Service Architecture
```javascript
// services/firebase.js
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

class FirebaseService {
  // Generic CRUD operations
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create ${collectionName}: ${error.message}`);
    }
  }

  async read(collectionName, orderByField = 'createdAt') {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy(orderByField, 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to read ${collectionName}: ${error.message}`);
    }
  }
}

export const firebaseService = new FirebaseService();
```

#### Specific Service Methods

**Announcements Service:**
```javascript
// services/announcements.js
export const announcementsService = {
  async getAll() {
    return firebaseService.read('announcements');
  },

  async create(announcement) {
    return firebaseService.create('announcements', announcement);
  }
};
```

**Events Service:**
```javascript
// services/events.js
export const eventsService = {
  async getAll() {
    return firebaseService.read('events', 'date');
  },

  async create(event) {
    return firebaseService.create('events', event);
  }
};
```

**Alerts Service:**
```javascript
// services/alerts.js
export const alertsService = {
  async getActive() {
    // Custom query for active alerts only
    const q = query(
      collection(db, 'alerts'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(alert) {
    return firebaseService.create('alerts', {
      ...alert,
      status: 'active'
    });
  }
};
```

### 4.2 Error Handling Strategy

#### Global Error Boundary
```javascript
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>Please refresh the page or contact support</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### API Error Handling
```javascript
// hooks/useAsync.js
import { useState, useEffect } from 'react';

export function useAsync(asyncFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: execute };
}
```

---

## 5. Component Design Patterns

### 5.1 Higher-Order Components (HOC)

#### With Firebase Data HOC
```javascript
// components/hocs/withFirebaseData.jsx
import React, { useState, useEffect } from 'react';

export function withFirebaseData(WrappedComponent, collectionName) {
  return function FirebaseDataComponent(props) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await firebaseService.read(collectionName);
          setData(result);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    return (
      <WrappedComponent
        {...props}
        data={data}
        loading={loading}
        error={error}
      />
    );
  };
}
```

### 5.2 Custom Hooks

#### useForm Hook
```javascript
// hooks/useForm.js
import { useState } from 'react';

export function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validate = (validationRules) => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = values[field];
      const error = rule(value, values);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}
```

#### useLocalStorage Hook
```javascript
// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

### 5.3 Component Composition Patterns

#### Compound Components
```javascript
// components/forms/Form.jsx
import React, { createContext, useContext } from 'react';

const FormContext = createContext();

export function Form({ children, onSubmit, ...props }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <FormContext.Provider value={{}}>
      <form onSubmit={handleSubmit} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function FormField({ name, label, type = 'text', ...props }) {
  const { values, errors, handleChange, handleBlur } = useForm();

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={values[name] || ''}
        onChange={(e) => handleChange(name, e.target.value)}
        onBlur={() => handleBlur(name)}
        {...props}
      />
      {errors[name] && <span className="error">{errors[name]}</span>}
    </div>
  );
}

export function FormSubmit({ children, ...props }) {
  return (
    <button type="submit" {...props}>
      {children}
    </button>
  );
}
```

---

## 6. Performance Optimization

### 6.1 Code Splitting Strategy

#### Route-based Code Splitting
```javascript
// App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Events = lazy(() => import('./pages/Events'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/events" element={<Events />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}
```

### 6.2 Firebase Optimization

#### Query Optimization
```javascript
// Optimized queries with limits
const getRecentAnnouncements = async () => {
  const q = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc'),
    limit(10) // Limit results
  );
  return await getDocs(q);
};

const getUpcomingEvents = async () => {
  const now = new Date();
  const q = query(
    collection(db, 'events'),
    where('date', '>=', now), // Only future events
    orderBy('date', 'asc'),
    limit(5)
  );
  return await getDocs(q);
};
```

#### Real-time Listener Management
```javascript
// Proper cleanup of listeners
useEffect(() => {
  let unsubscribe;

  const setupListener = async () => {
    const q = query(collection(db, 'alerts'));
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlerts(alerts);
    });
  };

  setupListener();

  // Cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, []);
```

### 6.3 Caching Strategy

#### React Query Integration (Future)
```javascript
// lib/queryClient.js
import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 7. Security Architecture

### 7.1 Authentication Flow (Future Implementation)

#### Firebase Auth Integration
```javascript
// services/auth.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export class AuthService {
  constructor() {
    this.auth = getAuth();
  }

  async signIn(email, password) {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return result.user;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(this.auth, callback);
  }
}
```

### 7.2 Authorization Strategy

#### Role-Based Access Control
```javascript
// constants/roles.js
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
};

// utils/permissions.js
export const checkPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    [ROLES.GUEST]: 0,
    [ROLES.USER]: 1,
    [ROLES.MODERATOR]: 2,
    [ROLES.ADMIN]: 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
```

### 7.3 Data Sanitization

#### Input Validation
```javascript
// utils/validation.js
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim() // Remove leading/trailing whitespace
    .substring(0, 1000); // Limit length
};

export const validateAnnouncement = (data) => {
  const errors = {};

  if (!data.title || data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!data.message || data.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

---

## 8. Deployment Architecture

### 8.1 CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: 🚀 Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run security audit
        run: npm audit --audit-level high

      - name: CodeQL Analysis
        uses: github/codeql-action/init@v3
        with:
          languages: javascript

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: airforce-barracks-portal
```

### 8.2 Environment Configuration

#### Environment Variables
```bash
# .env.production
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### 8.3 Monitoring and Logging

#### Error Tracking
```javascript
// services/monitoring.js
import * as Sentry from '@sentry/react';

export const initMonitoring = () => {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.VITE_APP_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};
```

#### Performance Monitoring
```javascript
// services/performance.js
import { getPerformance } from 'firebase/performance';

export const initPerformanceMonitoring = () => {
  const perf = getPerformance();
  // Performance monitoring is automatically enabled
};
```

---

## 9. Future Architecture Considerations

### 9.1 Scalability Improvements

#### Database Sharding Strategy
- Implement collection group queries for better performance
- Consider Firestore composite indexes for complex queries
- Plan for data archival strategy for old announcements/events

#### CDN Integration
- Implement Firebase Hosting CDN for static assets
- Consider Cloudflare for additional caching layers
- Optimize images and assets for web delivery

### 9.2 Microservices Architecture (Future)

#### Service Decomposition
```
Frontend (React SPA)
├── Admin Service (Future microservice)
├── Notification Service (Future microservice)
├── Analytics Service (Future microservice)
└── Content Management Service (Future microservice)
```

#### API Gateway Pattern
```javascript
// Future API Gateway implementation
const API_GATEWAY = {
  announcements: '/api/v1/announcements',
  events: '/api/v1/events',
  alerts: '/api/v1/alerts',
  admin: '/api/v1/admin'
};
```

### 9.3 Advanced Features Architecture

#### Real-time Notifications
```javascript
// Future WebSocket implementation
import { io } from 'socket.io-client';

export class NotificationService {
  constructor() {
    this.socket = io(process.env.VITE_WS_URL);
  }

  subscribeToAlerts(callback) {
    this.socket.on('new-alert', callback);
  }

  subscribeToAnnouncements(callback) {
    this.socket.on('new-announcement', callback);
  }
}
```

#### Offline Support
```javascript
// Future PWA implementation
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update prompt
  },
  onOfflineReady() {
    // App is ready for offline use
  },
});
```

---

## 10. Conclusion

This Technical Architecture Document provides a comprehensive blueprint for the Airforce Barracks Community Portal. The architecture emphasizes:

- **Scalability**: Firebase backend with efficient data structures
- **Maintainability**: Modular component design and clear separation of concerns
- **Security**: Defense in depth with multiple security layers
- **Performance**: Optimized queries, caching, and code splitting
- **User Experience**: Responsive design with real-time updates

The architecture is designed to support current requirements while providing a solid foundation for future enhancements and scaling needs.

---

*This document should be reviewed and updated as the system evolves and new architectural decisions are made.*