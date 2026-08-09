import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import baseAppletConfig from '../../firebase-applet-config.json';

const effectiveConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || baseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || baseAppletConfig.authDomain || "customer-lens-bd503.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || baseAppletConfig.projectId || "customer-lens-bd503",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || baseAppletConfig.appId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || baseAppletConfig.storageBucket || "customer-lens-bd503.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || baseAppletConfig.messagingSenderId,
  measurementId: baseAppletConfig.measurementId
};

const app = initializeApp(effectiveConfig);
export const db = getFirestore(app, baseAppletConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);


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
