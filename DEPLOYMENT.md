# 🚀 Deployment Guide

**Project:** Airforce Barracks Community Portal  
**Version:** 1.0.0  
**Date:** March 5, 2026

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Firebase Configuration](#3-firebase-configuration)
4. [Local Development](#4-local-development)
5. [Production Deployment](#5-production-deployment)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Monitoring and Maintenance](#7-monitoring-and-maintenance)
8. [Troubleshooting](#8-troubleshooting)
9. [Rollback Procedures](#9-rollback-procedures)
10. [Security Checklist](#10-security-checklist)

---

## 1. Prerequisites

### System Requirements

#### Development Environment
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: Version 2.30.0 or higher
- **VS Code**: Latest version (recommended)
- **Windows PowerShell**: Version 5.1 or higher

#### Production Environment
- **Firebase Account**: With billing enabled
- **GitHub Account**: For repository hosting and CI/CD
- **Domain Name**: Optional, for custom domain deployment

### Required Accounts and Permissions

#### Firebase Console
- Project Owner or Editor permissions
- Access to Firestore Database
- Access to Firebase Hosting
- Access to Firebase Authentication (future)

#### GitHub Repository
- Repository Admin permissions
- Access to GitHub Actions
- Access to repository secrets

---

## 2. Environment Setup

### 2.1 Install Node.js and npm

#### Windows Installation
```powershell
# Download and install Node.js from official website
# Visit: https://nodejs.org/
# Or use winget:
winget install OpenJS.NodeJS
```

#### Verify Installation
```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check npm configuration
npm config list
```

### 2.2 Install Git

#### Windows Installation
```powershell
# Install Git for Windows
winget install Git.Git

# Configure Git (replace with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### Verify Installation
```powershell
# Check Git version
git --version

# Check Git configuration
git config --list
```

### 2.3 Install Firebase CLI

#### Global Installation
```powershell
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase (opens browser)
firebase login

# Verify installation
firebase --version
```

### 2.4 Clone Repository

```powershell
# Clone the repository
git clone https://github.com/your-username/airforce-barracks-portal.git

# Navigate to project directory
cd airforce-barracks-portal

# Install dependencies
npm install
```

---

## 3. Firebase Configuration

### 3.1 Create Firebase Project

#### Step 1: Create Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `airforce-barracks-portal`
4. Choose whether to enable Google Analytics (recommended for production)
5. Select Google Analytics account or create new one
6. Click "Create project"

#### Step 2: Enable Required Services

**Firestore Database:**
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location (choose closest to your users)
5. Click "Done"

**Firebase Hosting:**
1. In Firebase Console, go to "Hosting"
2. Click "Get started"
3. Follow the setup wizard (we'll configure deployment later)

### 3.2 Configure Firebase in Project

#### Update Firebase Configuration
```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
```

#### Get Configuration Values
1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>) icon
4. Register app with name: "Airforce Barracks Portal"
5. Copy the config object values to `src/firebase.js`

### 3.3 Security Rules Setup

#### Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.auth.token.admin == true;
    }
  }
}
```

#### Deploy Security Rules
```powershell
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## 4. Local Development

### 4.1 Environment Variables

#### Create Environment Files

**Development Environment (.env.local):**
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_dev_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_dev_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
VITE_FIREBASE_APP_ID=your_dev_app_id

# Application Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0-dev
VITE_APP_NAME=Airforce Barracks Portal (Dev)
```

**Production Environment (.env.production):**
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_prod_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_prod_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
VITE_FIREBASE_APP_ID=your_prod_app_id

# Application Configuration
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Airforce Barracks Portal
```

### 4.2 Development Scripts

#### Available npm Scripts
```json
// package.json scripts section
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext js,jsx --fix",
    "format": "prettier --write src/**/*.{js,jsx}",
    "test": "echo \"No tests specified\" && exit 0",
    "firebase:serve": "firebase serve",
    "firebase:deploy": "firebase deploy"
  }
}
```

#### Start Development Server
```powershell
# Start Vite development server
npm run dev

# Server will be available at: http://localhost:5173
```

#### Code Quality Checks
```powershell
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### 4.3 Firebase Emulators (Optional)

#### Install Java (Required for Emulators)
```powershell
# Check if Java is installed
java -version

# If not installed, install OpenJDK
winget install Microsoft.OpenJDK.17
```

#### Start Firebase Emulators
```powershell
# Start emulators for Firestore and Hosting
firebase emulators:start

# Emulators will be available at:
# - Firestore: http://localhost:8080
# - Hosting: http://localhost:5000
```

---

## 5. Production Deployment

### 5.1 Build Configuration

#### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

#### Build Optimization
```javascript
// Additional Vite config for production
export default defineConfig({
  // ... existing config
  build: {
    // ... existing build config
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 5.2 Firebase Hosting Deployment

#### Initialize Firebase Hosting
```powershell
# Initialize Firebase in project
firebase init hosting

# Answer prompts:
# - Choose "Hosting"
# - Select Firebase project
# - Public directory: dist
# - Configure as SPA: Yes
# - Automatic builds: No (we'll use GitHub Actions)
```

#### Manual Deployment
```powershell
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Get deployment URL
firebase hosting:channel:list
```

### 5.3 Custom Domain Setup (Optional)

#### Add Custom Domain
1. In Firebase Console, go to "Hosting" → "Add custom domain"
2. Enter your domain name
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (can take up to 24 hours)

#### DNS Configuration
```
Type: A
Name: @
Value: 199.36.158.100

Type: CNAME
Name: www
Value: your-project.web.app
```

---

## 6. CI/CD Pipeline

### 6.1 GitHub Actions Setup

#### Create GitHub Repository
1. Create new repository on GitHub
2. Push local code to GitHub:
```powershell
git remote add origin https://github.com/your-username/airforce-barracks-portal.git
git branch -M main
git push -u origin main
```

#### Configure Repository Secrets
1. Go to repository Settings → Secrets and variables → Actions
2. Add the following secrets:

**FIREBASE_SERVICE_ACCOUNT:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**FIREBASE_PROJECT_ID:** `your-project-id`

### 6.2 CI/CD Workflow Configuration

#### Create Workflow File
```yaml
# .github/workflows/deploy.yml
name: 🚀 Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  test:
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

      - name: 🧪 Run tests
        run: npm run test

      - name: 🔍 Run linting
        run: npm run lint

      - name: 🏗️ Build application
        run: npm run build

      - name: 📤 Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/

  security:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: 🔒 Security audit
        run: npm audit --audit-level high

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/

      - name: 🚀 Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

### 6.3 Branch Protection Rules

#### Configure Branch Protection
1. Go to repository Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks (test, security)
   - Include administrators
   - Restrict pushes that create matching branches

---

## 7. Monitoring and Maintenance

### 7.1 Firebase Console Monitoring

#### Performance Monitoring
1. In Firebase Console, go to "Performance"
2. Monitor Core Web Vitals
3. Track custom metrics
4. Set up alerts for performance regressions

#### Error Monitoring
1. In Firebase Console, go to "Crashlytics" (if enabled)
2. Monitor JavaScript errors
3. Track error trends
4. Set up alerts for critical errors

### 7.2 Application Monitoring

#### Add Monitoring Libraries
```powershell
# Install monitoring libraries
npm install @sentry/react @sentry/tracing
```

#### Configure Error Tracking
```javascript
// src/services/monitoring.js
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initMonitoring = () => {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.VITE_APP_ENV,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
};
```

#### Initialize Monitoring
```javascript
// src/main.jsx
import { initMonitoring } from './services/monitoring';

// Initialize monitoring
initMonitoring();
```

### 7.3 Database Maintenance

#### Firestore Backup Strategy
```powershell
# Export Firestore data
firebase firestore:export gs://your-backup-bucket/firestore-backup

# Import Firestore data
firebase firestore:import gs://your-backup-bucket/firestore-backup
```

#### Data Cleanup Scripts
```javascript
// scripts/cleanup.js
import { db } from '../src/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export const cleanupOldAlerts = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const q = query(
    collection(db, 'alerts'),
    where('createdAt', '<', thirtyDaysAgo)
  );

  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

  await Promise.all(deletePromises);
  console.log(`Cleaned up ${querySnapshot.docs.length} old alerts`);
};
```

### 7.4 Regular Maintenance Tasks

#### Weekly Tasks
- Review Firebase usage and costs
- Check error logs and performance metrics
- Update dependencies
- Review security rules

#### Monthly Tasks
- Database cleanup and optimization
- Security audit
- Performance review
- Backup verification

#### Quarterly Tasks
- Major dependency updates
- Security assessment
- Architecture review
- Feature planning

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Build Failures
```powershell
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check Node.js version compatibility
node --version
npm --version
```

#### Firebase Connection Issues
```powershell
# Check Firebase project configuration
firebase projects:list

# Test Firebase connection
firebase firestore:locations

# Check service account permissions
firebase use --add
```

#### Deployment Issues
```powershell
# Check Firebase hosting status
firebase hosting:sites:list

# View deployment history
firebase hosting:channel:list

# Clear hosting cache
firebase hosting:channel:delete live
```

### 8.2 Debug Commands

#### Development Debugging
```powershell
# Enable verbose logging
DEBUG=vite:* npm run dev

# Check environment variables
echo $VITE_FIREBASE_API_KEY

# Test Firebase connection
node -e "const { initializeApp } = require('firebase/app'); console.log('Firebase initialized');"
```

#### Production Debugging
```powershell
# Check deployed version
firebase hosting:channel:list

# View hosting logs
firebase functions:log

# Check Firestore indexes
firebase firestore:indexes
```

### 8.3 Performance Issues

#### Bundle Analysis
```powershell
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
});
```

#### Lighthouse Audit
```powershell
# Run Lighthouse audit
npx lighthouse http://localhost:5173 --output html --output-path ./lighthouse-report.html
```

---

## 9. Rollback Procedures

### 9.1 Emergency Rollback

#### Immediate Rollback to Previous Version
```powershell
# Deploy previous version from GitHub
git checkout <previous-commit-hash>
npm run build
firebase deploy --only hosting
```

#### Firebase Hosting Rollback
```powershell
# List all hosting versions
firebase hosting:channel:list

# Rollback to specific version
firebase hosting:channel:deploy live --version <version-id>
```

### 9.2 Database Rollback

#### Restore from Backup
```powershell
# Import from backup
firebase firestore:import gs://your-backup-bucket/firestore-backup
```

#### Selective Data Recovery
```javascript
// scripts/recovery.js
import { db } from '../src/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const recoverData = async (backupData) => {
  const batch = [];
  for (const item of backupData) {
    batch.push(addDoc(collection(db, item.collection), item.data));
  }
  await Promise.all(batch);
};
```

### 9.3 Rollback Checklist

- [ ] Identify the issue causing rollback
- [ ] Notify stakeholders
- [ ] Create backup of current state
- [ ] Execute rollback procedure
- [ ] Verify application functionality
- [ ] Monitor for issues post-rollback
- [ ] Document rollback reason and resolution

---

## 10. Security Checklist

### 10.1 Pre-Deployment Security

#### Firebase Security
- [ ] Firestore security rules are properly configured
- [ ] Firebase Authentication is enabled (future)
- [ ] Service account permissions are minimal
- [ ] API keys are restricted to necessary domains

#### Application Security
- [ ] Environment variables are not committed to repository
- [ ] Dependencies are up to date and secure
- [ ] ESLint security rules are enabled
- [ ] Input validation is implemented
- [ ] XSS protection is in place

#### Infrastructure Security
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented (future)
- [ ] CDN is configured securely

### 10.2 Post-Deployment Security

#### Monitoring
- [ ] Security monitoring is enabled
- [ ] Alert system is configured
- [ ] Regular security audits are scheduled
- [ ] Incident response plan is documented

#### Access Control
- [ ] Admin access is properly restricted
- [ ] API access is authenticated
- [ ] Database access is logged
- [ ] Backup access is secured

### 10.3 Security Maintenance

#### Regular Updates
- [ ] Dependencies are updated regularly
- [ ] Security patches are applied promptly
- [ ] Security rules are reviewed quarterly
- [ ] Penetration testing is performed annually

---

## Quick Reference

### Useful Commands

```powershell
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview               # Preview production build

# Firebase
firebase login                # Login to Firebase
firebase init                 # Initialize Firebase services
firebase deploy               # Deploy to production
firebase emulators:start      # Start local emulators

# Git
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin main          # Push to main branch

# Monitoring
firebase hosting:channel:list # List hosting deployments
firebase firestore:export     # Export database
npm run lint                  # Run code quality checks
```

### Important URLs

- **Firebase Console:** https://console.firebase.google.com/
- **GitHub Repository:** https://github.com/your-username/airforce-barracks-portal
- **Production Site:** https://your-project.web.app
- **Documentation:** https://github.com/your-username/airforce-barracks-portal#readme

### Support Contacts

- **Technical Support:** your-email@example.com
- **Firebase Support:** https://firebase.google.com/support
- **GitHub Support:** https://github.com/support

---

*This deployment guide should be kept up to date as the deployment process evolves. Regular reviews and updates are recommended.*