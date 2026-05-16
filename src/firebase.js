import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const fallbackFirebaseConfig = {
    apiKey: 'AIzaSyDjangoRestLabLocalOnlyKey000000000',
    authDomain: 'vibeo-local.firebaseapp.com',
    projectId: 'vibeo-local',
    storageBucket: 'vibeo-local.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
    measurementId: '',
};

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId
};

const app = initializeApp(firebaseConfig);

const canUseAnalytics = Boolean(firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.measurementId);

export const analytics = canUseAnalytics
    ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : null;
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
