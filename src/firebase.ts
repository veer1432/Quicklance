import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  sendEmailVerification,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Safely attempt to load local config if it exists
let localConfig: any = {};
try {
  const configs = import.meta.glob('../firebase-applet-config.json', { eager: true });
  localConfig = (Object.values(configs)[0] as any)?.default || {};
} catch (e) {
  console.warn("Could not load local firebase config file:", e);
}

// Use environment variables if available, otherwise fallback to local config file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig?.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig?.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig?.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig?.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig?.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig?.appId || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localConfig?.measurementId || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig?.firestoreDatabaseId || '(default)'
};

if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing. Please check your firebase-applet-config.json or set VITE_FIREBASE_API_KEY in the Secrets panel.");
}

// Initialize Firebase SDK
let app: any;
let db: any;
let auth: any;
let storage: any;
const isFirebaseConfigured = !!firebaseConfig.apiKey;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase is not configured. Features like Login and Dashboard will be placeholder/inactive until Firebase is set up in the AI Studio UI.");
}

export { db, auth, storage, isFirebaseConfigured };
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  sendEmailVerification,
  RecaptchaVerifier,
  updateAuthProfile,
  ref,
  uploadBytes,
  getDownloadURL
};
export type { User, ConfirmationResult };
