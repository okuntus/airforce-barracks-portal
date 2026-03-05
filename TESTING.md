# 🧪 Testing Strategy & Implementation Guide

**Project:** Airforce Barracks Community Portal  
**Version:** 1.0.0  
**Date:** March 5, 2026

---

## Table of Contents

1. [Testing Overview](#1-testing-overview)
2. [Testing Pyramid](#2-testing-pyramid)
3. [Unit Testing](#3-unit-testing)
4. [Integration Testing](#4-integration-testing)
5. [End-to-End Testing](#5-end-to-end-testing)
6. [Test Automation](#6-test-automation)
7. [Performance Testing](#7-performance-testing)
8. [Security Testing](#8-security-testing)
9. [Test Data Management](#9-test-data-management)
10. [CI/CD Integration](#10-cicd-integration)
11. [Test Reporting](#11-test-reporting)
12. [Best Practices](#12-best-practices)

---

## 1. Testing Overview

### 1.1 Testing Objectives

The testing strategy for the Airforce Barracks Community Portal aims to:

- **Ensure Code Quality**: Catch bugs early in development cycle
- **Prevent Regressions**: Maintain functionality across releases
- **Improve Maintainability**: Refactor code with confidence
- **Enhance User Experience**: Validate user workflows and interactions
- **Meet Performance Standards**: Ensure responsive and scalable application
- **Maintain Security**: Protect against vulnerabilities and data breaches

### 1.2 Testing Principles

- **Test-Driven Development (TDD)**: Write tests before implementing features
- **Continuous Testing**: Integrate testing into CI/CD pipeline
- **Test Coverage**: Aim for 80%+ code coverage across all layers
- **Realistic Test Data**: Use production-like data for testing
- **Automated Testing**: Minimize manual testing efforts
- **Fail Fast**: Quick feedback on code quality issues

### 1.3 Testing Scope

#### In Scope
- React component functionality
- Firebase integration and data operations
- User authentication flows (future)
- Form validation and error handling
- Routing and navigation
- API error scenarios
- Performance benchmarks
- Security vulnerabilities

#### Out of Scope
- Third-party service reliability (Firebase uptime)
- Browser compatibility (focus on modern browsers)
- Mobile device testing (responsive design validation only)
- Accessibility testing (WCAG compliance)

---

## 2. Testing Pyramid

```
End-to-End Tests (E2E)     ██████████░░ 10%
Integration Tests          ████████████ 20%
Unit Tests                 ████████████████ 70%
```

### 2.1 Unit Tests (70%)
- **Focus**: Individual functions, components, and utilities
- **Tools**: Jest, React Testing Library
- **Coverage**: 80%+ line and branch coverage
- **Execution**: Fast (< 1 second per test suite)

### 2.2 Integration Tests (20%)
- **Focus**: Component interactions, Firebase operations
- **Tools**: Jest, React Testing Library, Firebase Emulators
- **Coverage**: Critical user journeys and data flows
- **Execution**: Medium (1-10 seconds per test suite)

### 2.3 End-to-End Tests (10%)
- **Focus**: Complete user workflows
- **Tools**: Playwright or Cypress
- **Coverage**: Critical business flows
- **Execution**: Slow (10-60 seconds per test suite)

---

## 3. Unit Testing

### 3.1 Testing Framework Setup

#### Install Testing Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### Jest Configuration
```javascript
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/firebase.js',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
  ]
};
```

#### Test Setup File
```javascript
// src/setupTests.js
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./firebase', () => ({
  db: {},
  auth: {}
}));

// Mock environment variables
process.env.VITE_APP_ENV = 'test';
process.env.VITE_APP_VERSION = '1.0.0-test';
```

### 3.2 Component Testing

#### Basic Component Test
```javascript
// src/components/Alert.test.jsx
import { render, screen } from '@testing-library/react';
import Alert from './Alert';

describe('Alert Component', () => {
  const mockAlert = {
    id: '1',
    title: 'Test Alert',
    message: 'This is a test alert',
    severity: 'high',
    date: new Date('2024-01-01')
  };

  test('renders alert with correct content', () => {
    render(<Alert alert={mockAlert} />);

    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a test alert')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('applies correct severity styling', () => {
    render(<Alert alert={mockAlert} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('alert-high');
  });

  test('formats date correctly', () => {
    render(<Alert alert={mockAlert} />);

    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
  });
});
```

#### Form Component Testing
```javascript
// src/components/forms/AlertForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertForm from './AlertForm';

describe('AlertForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders form fields correctly', () => {
    render(<AlertForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/severity/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<AlertForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create alert/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<AlertForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'Test Alert');
    await user.type(screen.getByLabelText(/message/i), 'Test message');
    await user.selectOptions(screen.getByLabelText(/severity/i), 'high');

    const submitButton = screen.getByRole('button', { name: /create alert/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Alert',
        message: 'Test message',
        severity: 'high'
      });
    });
  });
});
```

### 3.3 Custom Hook Testing

#### useForm Hook Test
```javascript
// src/hooks/useForm.test.js
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm Hook', () => {
  const initialValues = { name: '', email: '' };
  const validationRules = {
    name: (value) => value.length < 2 ? 'Name too short' : '',
    email: (value) => !value.includes('@') ? 'Invalid email' : ''
  };

  test('initializes with correct values', () => {
    const { result } = renderHook(() => useForm(initialValues));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  test('updates values on change', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange('name', 'John');
    });

    expect(result.current.values.name).toBe('John');
  });

  test('validates form correctly', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleChange('name', 'J');
      result.current.handleChange('email', 'invalid');
      result.current.validate();
    });

    expect(result.current.errors.name).toBe('Name too short');
    expect(result.current.errors.email).toBe('Invalid email');
    expect(result.current.isValid).toBe(false);
  });
});
```

### 3.4 Utility Function Testing

#### Validation Utilities Test
```javascript
// src/utils/validation.test.js
import { validateAnnouncement, validateEvent, validateAlert } from './validation';

describe('Validation Utilities', () => {
  describe('validateAnnouncement', () => {
    test('validates correct announcement', () => {
      const announcement = {
        title: 'Valid Title',
        message: 'This is a valid message with enough content.'
      };

      const result = validateAnnouncement(announcement);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('rejects announcement with short title', () => {
      const announcement = {
        title: 'Hi',
        message: 'This is a valid message with enough content.'
      };

      const result = validateAnnouncement(announcement);

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title must be at least 3 characters');
    });

    test('rejects announcement with empty message', () => {
      const announcement = {
        title: 'Valid Title',
        message: ''
      };

      const result = validateAnnouncement(announcement);

      expect(result.isValid).toBe(false);
      expect(result.errors.message).toBe('Message is required');
    });
  });

  describe('validateEvent', () => {
    test('validates correct event', () => {
      const event = {
        title: 'Community Meeting',
        location: 'Main Hall',
        date: new Date('2024-12-01'),
        time: '14:00'
      };

      const result = validateEvent(event);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('rejects event with past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const event = {
        title: 'Past Event',
        location: 'Main Hall',
        date: pastDate,
        time: '14:00'
      };

      const result = validateEvent(event);

      expect(result.isValid).toBe(false);
      expect(result.errors.date).toBe('Event date cannot be in the past');
    });
  });

  describe('validateAlert', () => {
    test('validates correct alert', () => {
      const alert = {
        title: 'Weather Alert',
        message: 'Heavy rain expected',
        severity: 'medium'
      };

      const result = validateAlert(alert);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('rejects invalid severity', () => {
      const alert = {
        title: 'Weather Alert',
        message: 'Heavy rain expected',
        severity: 'invalid'
      };

      const result = validateAlert(alert);

      expect(result.isValid).toBe(false);
      expect(result.errors.severity).toBe('Invalid severity level');
    });
  });
});
```

---

## 4. Integration Testing

### 4.1 Firebase Integration Testing

#### Firebase Emulators Setup
```javascript
// tests/firebase-setup.js
import { initializeTestApp, clearFirestoreData } from '@firebase/testing';

export const setupFirebaseTest = () => {
  const testApp = initializeTestApp({
    projectId: 'test-project',
    auth: { uid: 'test-user', admin: true }
  });

  const db = testApp.firestore();

  return {
    db,
    testApp,
    clearData: () => clearFirestoreData({ projectId: 'test-project' })
  };
};
```

#### Firebase Service Testing
```javascript
// src/services/firebase.test.js
import { announcementsService } from './announcements';
import { setupFirebaseTest } from '../../tests/firebase-setup';

describe('Firebase Services', () => {
  let db, testApp, clearData;

  beforeEach(async () => {
    ({ db, testApp, clearData } = setupFirebaseTest());
    await clearData();
  });

  afterEach(async () => {
    await testApp.delete();
  });

  describe('Announcements Service', () => {
    test('creates and retrieves announcement', async () => {
      const announcement = {
        title: 'Test Announcement',
        message: 'This is a test announcement'
      };

      const id = await announcementsService.create(announcement);
      expect(id).toBeDefined();

      const announcements = await announcementsService.getAll();
      expect(announcements).toHaveLength(1);
      expect(announcements[0].title).toBe('Test Announcement');
    });

    test('handles Firebase errors gracefully', async () => {
      // Mock Firebase error
      jest.spyOn(db, 'collection').mockImplementation(() => {
        throw new Error('Firebase connection failed');
      });

      await expect(announcementsService.getAll()).rejects.toThrow(
        'Failed to read announcements'
      );
    });
  });
});
```

### 4.2 Component Integration Testing

#### Page Component Testing
```javascript
// src/pages/Home.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { announcementsService } from '../services/announcements';

// Mock the service
jest.mock('../services/announcements');

describe('Home Page', () => {
  beforeEach(() => {
    announcementsService.getAll.mockResolvedValue([
      {
        id: '1',
        title: 'Welcome Announcement',
        message: 'Welcome to our community',
        createdAt: new Date()
      }
    ]);
  });

  test('renders home page with announcements', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Welcome Announcement')).toBeInTheDocument();
      expect(screen.getByText('Welcome to our community')).toBeInTheDocument();
    });
  });

  test('handles service errors', async () => {
    announcementsService.getAll.mockRejectedValue(
      new Error('Service unavailable')
    );

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading announcements')).toBeInTheDocument();
    });
  });
});
```

---

## 5. End-to-End Testing

### 5.1 E2E Testing Setup

#### Install Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### Playwright Configuration
```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5.2 Critical User Journey Tests

#### Admin Alert Creation Flow
```javascript
// e2e/admin-create-alert.spec.js
import { test, expect } from '@playwright/test';

test.describe('Admin Alert Management', () => {
  test('admin can create and view alerts', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');

    // Fill out alert form
    await page.fill('[name="title"]', 'Emergency Drill');
    await page.fill('[name="message"]', 'Fire drill scheduled for tomorrow at 10 AM');
    await page.selectOption('[name="severity"]', 'high');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.success-message')).toContainText('Alert created successfully');

    // Navigate to alerts page
    await page.click('a[href="/alerts"]');

    // Verify alert appears in list
    await expect(page.locator('h3')).toContainText('Emergency Drill');
    await expect(page.locator('.alert-message')).toContainText('Fire drill scheduled');
    await expect(page.locator('.severity-badge')).toContainText('High');
  });

  test('form validation prevents invalid submissions', async ({ page }) => {
    await page.goto('/admin');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('.error')).toContainText('Title is required');
    await expect(page.locator('.error')).toContainText('Message is required');
  });
});
```

#### Public Content Access Flow
```javascript
// e2e/public-content-access.spec.js
import { test, expect } from '@playwright/test';

test.describe('Public Content Access', () => {
  test('user can browse all public content', async ({ page }) => {
    // Visit home page
    await page.goto('/');

    // Check navigation links
    await expect(page.locator('nav a[href="/announcements"]')).toBeVisible();
    await expect(page.locator('nav a[href="/events"]')).toBeVisible();
    await expect(page.locator('nav a[href="/alerts"]')).toBeVisible();

    // Navigate to announcements
    await page.click('a[href="/announcements"]');
    await expect(page.locator('h1')).toContainText('Announcements');

    // Navigate to events
    await page.click('a[href="/events"]');
    await expect(page.locator('h1')).toContainText('Events');

    // Navigate to alerts
    await page.click('a[href="/alerts"]');
    await expect(page.locator('h1')).toContainText('Alerts');
  });

  test('content loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForSelector('.content-loaded');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });
});
```

---

## 6. Test Automation

### 6.1 CI/CD Test Integration

#### GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: 🧪 Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🧪 Run unit tests
        run: npm run test:unit

      - name: 📊 Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔥 Setup Firebase emulators
        run: npm run firebase:emulators:setup

      - name: 🧪 Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🧪 Run E2E tests
        run: npm run test:e2e

      - name: 📊 Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 6.2 Test Scripts

#### Package.json Test Scripts
```json
{
  "scripts": {
    "test": "npm run test:unit",
    "test:unit": "jest --coverage --watchAll=false",
    "test:unit:watch": "jest --coverage --watchAll",
    "test:integration": "jest --testPathPattern=integration --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "firebase:emulators:setup": "firebase emulators:start --import=./test-data --export-on-exit=./test-data",
    "coverage:report": "jest --coverage --coverageReporters=html",
    "lint:test": "eslint src --ext .test.js,.spec.js"
  }
}
```

---

## 7. Performance Testing

### 7.1 Performance Test Setup

#### Lighthouse CI Configuration
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Local:.+(https?://.+)',
      url: ['http://localhost:5173']
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

#### Performance Test Script
```javascript
// tests/performance/performance.test.js
import { measurePerformance } from 'performance-test-runner';

describe('Performance Tests', () => {
  test('home page loads within 2 seconds', async () => {
    const metrics = await measurePerformance('/', {
      metrics: ['load', 'domContentLoaded', 'firstPaint', 'firstContentfulPaint']
    });

    expect(metrics.load).toBeLessThan(2000);
    expect(metrics.firstContentfulPaint).toBeLessThan(1500);
  });

  test('announcements page renders quickly', async () => {
    const startTime = performance.now();

    // Simulate navigation and rendering
    const renderTime = performance.now() - startTime;

    expect(renderTime).toBeLessThan(500);
  });

  test('large dataset renders efficiently', async () => {
    // Test with 100+ items
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      id: i.toString(),
      title: `Announcement ${i}`,
      message: `Message ${i}`.repeat(10),
      createdAt: new Date()
    }));

    const startTime = performance.now();

    // Render component with large dataset
    // Measure render time

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(1000);
  });
});
```

### 7.2 Load Testing

#### Firebase Load Test
```javascript
// tests/load/firebase-load.test.js
import { announcementsService } from '../../src/services/announcements';

describe('Firebase Load Tests', () => {
  test('handles multiple concurrent reads', async () => {
    const promises = Array.from({ length: 10 }, () =>
      announcementsService.getAll()
    );

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000); // 5 seconds for 10 concurrent requests
    results.forEach(result => {
      expect(Array.isArray(result)).toBe(true);
    });
  });

  test('handles bulk write operations', async () => {
    const bulkData = Array.from({ length: 50 }, (_, i) => ({
      title: `Bulk Announcement ${i}`,
      message: `Bulk message ${i}`
    }));

    const startTime = Date.now();
    const promises = bulkData.map(item => announcementsService.create(item));
    await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(10000); // 10 seconds for 50 writes
  });
});
```

---

## 8. Security Testing

### 8.1 Security Test Categories

#### Input Validation Testing
```javascript
// tests/security/input-validation.test.js
import { validateAnnouncement, sanitizeInput } from '../../src/utils/validation';

describe('Security - Input Validation', () => {
  test('prevents XSS attacks in announcements', () => {
    const maliciousInput = {
      title: '<script>alert("XSS")</script>',
      message: '<img src=x onerror=alert("XSS")>'
    };

    const result = validateAnnouncement(maliciousInput);

    expect(result.isValid).toBe(false);
    expect(result.errors.title).toContain('Invalid characters');
    expect(result.errors.message).toContain('Invalid characters');
  });

  test('sanitizes HTML input', () => {
    const htmlInput = '<p>Hello <strong>world</strong></p>';
    const sanitized = sanitizeInput(htmlInput);

    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
  });

  test('prevents SQL injection attempts', () => {
    const sqlInjection = {
      title: "'; DROP TABLE announcements; --",
      message: 'Valid message'
    };

    const result = validateAnnouncement(sqlInjection);

    // Firestore handles SQL injection, but we still validate input
    expect(result.isValid).toBe(true); // Title is long enough
  });
});
```

#### Authentication Testing (Future)
```javascript
// tests/security/auth.test.js
describe('Security - Authentication', () => {
  test('prevents unauthorized access to admin routes', async () => {
    // Mock unauthenticated user
    // Attempt to access admin routes
    // Verify redirect to login or error
  });

  test('validates user permissions', async () => {
    // Test role-based access control
    // Verify admin vs regular user permissions
  });
});
```

### 8.2 Firebase Security Testing

#### Security Rules Testing
```javascript
// tests/security/firestore-rules.test.js
import { initializeTestApp, assertFails, assertSucceeds } from '@firebase/testing';

describe('Firestore Security Rules', () => {
  let db;

  beforeEach(async () => {
    const testApp = initializeTestApp({
      projectId: 'test-project',
      auth: { uid: 'test-user' }
    });
    db = testApp.firestore();
  });

  test('allows authenticated users to read announcements', async () => {
    const readPromise = db.collection('announcements').get();
    await assertSucceeds(readPromise);
  });

  test('prevents unauthenticated users from reading data', async () => {
    const unauthApp = initializeTestApp({
      projectId: 'test-project'
      // No auth provided
    });
    const unauthDb = unauthApp.firestore();

    const readPromise = unauthDb.collection('announcements').get();
    await assertFails(readPromise);
  });

  test('allows admin users to write data', async () => {
    const adminApp = initializeTestApp({
      projectId: 'test-project',
      auth: { uid: 'admin-user', admin: true }
    });
    const adminDb = adminApp.firestore();

    const writePromise = adminDb.collection('announcements').add({
      title: 'Test',
      message: 'Test message',
      createdAt: new Date()
    });
    await assertSucceeds(writePromise);
  });
});
```

---

## 9. Test Data Management

### 9.1 Test Data Strategy

#### Test Data Categories
- **Unit Test Data**: Minimal, focused data for isolated testing
- **Integration Test Data**: Realistic data matching production schema
- **E2E Test Data**: Complete datasets for full workflow testing
- **Performance Test Data**: Large datasets for load testing

#### Test Data Generation
```javascript
// tests/data/testDataGenerator.js
export const generateTestAnnouncements = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `announcement-${i}`,
    title: `Test Announcement ${i}`,
    message: `This is test message ${i} with some content to make it realistic.`,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Days ago
    category: ['general', 'maintenance', 'social'][i % 3]
  }));
};

export const generateTestEvents = (count = 3) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7); // Next week

  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    title: `Test Event ${i}`,
    location: ['Main Hall', 'Gym', 'Community Center'][i % 3],
    date: new Date(futureDate.getTime() + i * 24 * 60 * 60 * 1000),
    time: `${10 + i}:00`,
    description: `Description for test event ${i}`,
    createdAt: new Date()
  }));
};

export const generateTestAlerts = (count = 3) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `alert-${i}`,
    title: `Test Alert ${i}`,
    message: `Alert message ${i} requiring attention.`,
    severity: ['low', 'medium', 'high'][i % 3],
    date: new Date(),
    status: 'active',
    createdAt: new Date()
  }));
};
```

### 9.2 Test Database Management

#### Firebase Test Data Setup
```javascript
// tests/setup/testDatabase.js
import { generateTestAnnouncements, generateTestEvents, generateTestAlerts } from '../data/testDataGenerator';

export const seedTestDatabase = async (db) => {
  const batch = db.batch();

  // Seed announcements
  const announcements = generateTestAnnouncements(10);
  announcements.forEach(announcement => {
    const docRef = db.collection('announcements').doc(announcement.id);
    batch.set(docRef, announcement);
  });

  // Seed events
  const events = generateTestEvents(5);
  events.forEach(event => {
    const docRef = db.collection('events').doc(event.id);
    batch.set(docRef, event);
  });

  // Seed alerts
  const alerts = generateTestAlerts(5);
  alerts.forEach(alert => {
    const docRef = db.collection('alerts').doc(alert.id);
    batch.set(docRef, alert);
  });

  await batch.commit();
};

export const clearTestDatabase = async (db) => {
  const collections = ['announcements', 'events', 'alerts'];

  for (const collection of collections) {
    const snapshot = await db.collection(collection).get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
};
```

---

## 10. CI/CD Integration

### 10.1 Test Pipeline Configuration

#### Comprehensive CI/CD Workflow
```yaml
# .github/workflows/ci.yml
name: 🚀 CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Run linting
        run: npm run lint

      - name: 🧪 Type checking
        run: npm run type-check

  test:
    needs: quality
    runs-on: ubuntu-latest
    services:
      firebase:
        image: google/cloud-sdk:emulators
        ports:
          - 8080:8080
          - 9099:9099
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🧪 Run unit tests
        run: npm run test:unit

      - name: 🧪 Run integration tests
        run: npm run test:integration

      - name: 📊 Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🧪 Run E2E tests
        run: npm run test:e2e

  security:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔒 Security audit
        run: npm audit --audit-level high

      - name: 🔒 CodeQL analysis
        uses: github/codeql-action/init@v3
        with:
          languages: javascript

  performance:
    needs: e2e
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: ⚡ Performance testing
        run: npm run test:performance

  deploy:
    needs: [e2e, security, performance]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: 🚀 Deploy to production
        run: echo "Deploy logic here"
```

### 10.2 Quality Gates

#### Code Coverage Requirements
```javascript
// jest.config.js coverage thresholds
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/components/': {
    branches: 90,
    functions: 90
  },
  './src/services/': {
    branches: 85,
    functions: 85
  }
}
```

#### Performance Budgets
```javascript
// performance-budgets.json
{
  "budgets": [
    {
      "path": "/",
      "timings": [
        {
          "metric": "firstContentfulPaint",
          "budget": 1500
        },
        {
          "metric": "largestContentfulPaint",
          "budget": 2500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 200
        }
      ]
    }
  ]
}
```

---

## 11. Test Reporting

### 11.1 Test Report Generation

#### Jest HTML Report
```javascript
// jest.config.js
reporters: [
  'default',
  ['jest-html-reporter', {
    pageTitle: 'Test Report',
    outputPath: 'test-results/index.html',
    includeFailureMsg: true,
    includeConsoleLog: true
  }]
]
```

#### Coverage Report
```javascript
// Generate detailed coverage report
npm run test:unit -- --coverage --coverageReporters=html,json,lcov

// Coverage report will be available at coverage/lcov-report/index.html
```

### 11.2 Test Result Analysis

#### Coverage Analysis Script
```javascript
// scripts/analyze-coverage.js
import { readFileSync } from 'fs';
import { join } from 'path';

const coverageData = JSON.parse(
  readFileSync(join(process.cwd(), 'coverage', 'coverage-final.json'), 'utf8')
);

const analyzeCoverage = () => {
  const files = Object.keys(coverageData);

  files.forEach(file => {
    const fileCoverage = coverageData[file];
    const { branches, functions, lines, statements } = fileCoverage;

    if (lines.pct < 80) {
      console.warn(`Low coverage in ${file}: ${lines.pct}% lines`);
    }

    if (branches.pct < 80) {
      console.warn(`Low branch coverage in ${file}: ${branches.pct}% branches`);
    }
  });
};

analyzeCoverage();
```

### 11.3 Test Metrics Dashboard

#### Test Metrics Collection
```javascript
// scripts/collect-metrics.js
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const collectMetrics = () => {
  const metrics = {
    timestamp: new Date().toISOString(),
    testResults: {},
    coverage: {},
    performance: {}
  };

  try {
    // Run tests and collect results
    const testOutput = execSync('npm run test:unit -- --json', { encoding: 'utf8' });
    metrics.testResults = JSON.parse(testOutput);

    // Collect coverage data
    const coverageOutput = execSync('npm run test:unit -- --coverage --coverageReporters=json-summary', { encoding: 'utf8' });
    metrics.coverage = JSON.parse(coverageOutput);

    // Collect performance metrics
    const perfOutput = execSync('npm run lighthouse', { encoding: 'utf8' });
    metrics.performance = JSON.parse(perfOutput);

  } catch (error) {
    console.error('Error collecting metrics:', error);
  }

  writeFileSync('metrics.json', JSON.stringify(metrics, null, 2));
};

collectMetrics();
```

---

## 12. Best Practices

### 12.1 Testing Best Practices

#### Test Organization
- **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested
- **Arrange-Act-Assert Pattern**: Structure tests with clear setup, execution, and verification phases
- **Single Responsibility**: Each test should verify one specific behavior
- **Independent Tests**: Tests should not depend on each other or shared state

#### Code Quality in Tests
- **DRY Principle**: Avoid code duplication in test files
- **Test Data Factories**: Use factories to generate consistent test data
- **Custom Matchers**: Create custom Jest matchers for common assertions
- **Test Helpers**: Extract common test logic into reusable helper functions

### 12.2 Test Maintenance

#### Regular Test Updates
- **Update Tests with Code Changes**: Keep tests in sync with implementation changes
- **Remove Obsolete Tests**: Delete tests that no longer provide value
- **Refactor Tests**: Improve test readability and maintainability
- **Test Documentation**: Document complex test scenarios and edge cases

#### Test Performance Optimization
- **Fast Test Execution**: Optimize tests to run quickly
- **Parallel Execution**: Run tests in parallel when possible
- **Selective Test Runs**: Use test filters to run only relevant tests
- **Mock External Dependencies**: Mock slow or external services

### 12.3 Test Culture

#### Team Practices
- **Test Reviews**: Include test code in code reviews
- **Pair Testing**: Collaborate on complex test scenarios
- **Test Ownership**: Assign test maintenance responsibilities
- **Knowledge Sharing**: Document testing patterns and share best practices

#### Continuous Improvement
- **Test Metrics Monitoring**: Track test health and coverage over time
- **Failure Analysis**: Investigate and fix flaky tests
- **Test Strategy Evolution**: Regularly review and improve testing approach
- **Training**: Provide testing training and resources for team members

---

## Quick Reference

### Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:unit -- --coverage

# Run specific test file
npm run test:unit -- src/components/Button.test.jsx

# Run tests in watch mode
npm run test:unit:watch

# Generate coverage report
npm run coverage:report
```

### Test File Naming Convention

```
src/
├── components/
│   ├── Button.jsx
│   ├── Button.test.jsx          # Unit tests
│   └── Button.integration.test.jsx  # Integration tests
├── pages/
│   ├── Home.jsx
│   ├── Home.test.jsx
│   └── Home.e2e.spec.js         # E2E tests (in e2e/ folder)
└── services/
    ├── api.js
    └── api.test.js
```

### Test Status Indicators

- ✅ **Passing**: Test passes consistently
- ❌ **Failing**: Test fails and needs fixing
- ⏳ **Flaky**: Test passes sometimes, fails others
- 🚫 **Skipped**: Test temporarily disabled
- 📝 **Todo**: Test needs to be written

---

*This testing strategy should be reviewed and updated regularly to ensure it continues to meet the project's needs and industry best practices.*