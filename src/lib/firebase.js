// Firebase Configuration
// IPS Maintenance Manager

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwWDkOyZ2UTPcK6M5PnigvyTwaVArSeL8",
  authDomain: "maintenance-manager-ae292.firebaseapp.com",
  projectId: "maintenance-manager-ae292",
  storageBucket: "maintenance-manager-ae292.firebasestorage.app",
  messagingSenderId: "112715689411",
  appId: "1:112715689411:web:a8fbec735d776fe00aa176"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
