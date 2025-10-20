
'use client';

import { firebaseConfig as hardcodedConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  // In a Vercel environment, process.env will be populated with the
  // NEXT_PUBLIC_FIREBASE_* variables. We can use these to initialize Firebase.
  const envConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  // Use environment variables if they are all available, otherwise fall back to the hardcoded config.
  // This supports both local development (using config.ts) and Vercel deployment (using env vars).
  const shouldUseEnvConfig = Object.values(envConfig).every(Boolean);
  const firebaseApp = initializeApp(shouldUseEnvConfig ? envConfig : hardcodedConfig);

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  
  onAuthStateChanged(auth, async (user) => {
      if (user) {
          // User is signed in.
          // This could be an anonymous user or a logged-in admin.
          const userRef = doc(firestore, "users", user.uid);
          const userData = {
              email: user.email || "anonymous",
              registrationDate: user.metadata.creationTime || new Date().toISOString(),
          };
          // We use non-blocking setDoc with merge:true to create or update the user document.
          // This way, we can track all users (anonymous or not) and their creation date.
          // If an anonymous user later signs in as an admin, their record will be updated.
          setDocumentNonBlocking(userRef, userData, { merge: true });
      } else {
          // User is signed out. We automatically sign them in anonymously.
          // This ensures that every visitor has a UID and can have data associated with them.
          signInAnonymously(auth).catch((error) => {
              console.error("Automatic anonymous sign-in failed:", error);
          });
      }
  });

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
