// lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  serverTimestamp,
  increment,
  Firestore,
} from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "newtalents-a7c29.firebaseapp.com",
  projectId: "newtalents-a7c29",
  storageBucket: "newtalents-a7c29.appspot.com",
  messagingSenderId: "507408992610",
  appId: "1:507408992610:web:05ce220a4cb4922de9843b",
};

const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { app, db, auth };

export const firestoreTimestamp = serverTimestamp;
export const firestoreIncrement = increment;
