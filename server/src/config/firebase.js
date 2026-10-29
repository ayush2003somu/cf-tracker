import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config();

/**
 * In-memory fallback Firestore mock.
 * Used if credentials are not provided or during offline testing.
 */
class InMemoryFirestoreMock {
  constructor() {
    this.storage = new Map();
  }

  collection(collectionName) {
    return {
      doc: (docId) => {
        const fullKey = `${collectionName}/${docId}`;
        return {
          get: async () => {
            const hasData = this.storage.has(fullKey);
            return {
              exists: hasData,
              data: () => (hasData ? JSON.parse(JSON.stringify(this.storage.get(fullKey))) : undefined)
            };
          },
          set: async (data) => {
            this.storage.set(fullKey, JSON.parse(JSON.stringify(data)));
            return { writeTime: new Date() };
          }
        };
      }
    };
  }
}

let db = null;
let isRealFirestore = false;

try {
  let credential = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const parsedKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    credential = cert(parsedKey);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const keyPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(keyPath)) {
      const fileContent = fs.readFileSync(keyPath, 'utf8');
      const parsedKey = JSON.parse(fileContent);
      credential = cert(parsedKey);
    }
  }

  if (credential) {
    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp({ credential });
    db = getFirestore(app);
    isRealFirestore = true;
    console.log('[Firestore] 🚀 Connected to live Firebase Firestore project.');
  } else {
    console.log('[Firestore] ℹ️  No Firebase credentials configured in .env.');
    console.log('[Firestore] 💡 Falling back to in-memory Firestore cache store.');
    db = new InMemoryFirestoreMock();
  }
} catch (error) {
  console.warn(`[Firestore] ⚠️  Firebase initialization failed (${error.message}). Falling back to in-memory cache.`);
  db = new InMemoryFirestoreMock();
}

export { db, isRealFirestore };
