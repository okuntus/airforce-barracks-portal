import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…"
};

function isFirebaseConfigValueValid(value) {
  if (!value || typeof value !== 'string') return false;

  const trimmed = value.trim();
  const knownPlaceholders = ['…', '...', 'YOUR_', 'REPLACE_ME', 'PLACEHOLDER'];

  if (!trimmed) return false;
  if (knownPlaceholders.some((token) => trimmed.includes(token))) return false;
  return true;
}

const isFirebaseConfigured = Object.values(firebaseConfig).every(isFirebaseConfigValueValid);

let app;
let auth;
let db;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn('Firebase config is incomplete. Running in demo mode with mock data.');
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, db, isFirebaseConfigured };
export default app;
