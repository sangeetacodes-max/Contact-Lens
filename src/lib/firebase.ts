import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import baseAppletConfig from '../../firebase-applet-config.json';

const effectiveConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || baseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "customer-lens-bd503.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "customer-lens-bd503",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || baseAppletConfig.appId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "customer-lens-bd503.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || baseAppletConfig.messagingSenderId,
  measurementId: baseAppletConfig.measurementId
};

const app = !getApps().length ? initializeApp(effectiveConfig) : getApp();

let dbInstance;
try {
  if (
    effectiveConfig.projectId === baseAppletConfig.projectId && 
    baseAppletConfig.firestoreDatabaseId && 
    baseAppletConfig.firestoreDatabaseId !== '(default)'
  ) {
    dbInstance = getFirestore(app, baseAppletConfig.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (e) {
  console.warn('Fallback to default Firestore database instance:', e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);

export function verifyFirebaseConfig(): boolean {
  if (!auth || !auth.app || !auth.app.options) {
    throw new Error('Firebase Auth is not initialized.');
  }
  const config = auth.app.options;
  if (!config.apiKey) {
    throw new Error('Firebase API Key is unconfigured.');
  }
  if (!config.projectId) {
    throw new Error('Firebase Project ID is unconfigured.');
  }
  return true;
}

export async function getFirebaseIdToken(): Promise<string | null> {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (err) {
      console.warn('Failed to retrieve Firebase ID Token:', err);
    }
  }
  return null;
}

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = await getFirebaseIdToken();
  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers
  });
}

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

