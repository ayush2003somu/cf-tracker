import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config();

/**
 * In-memory fallback Firestore mock.
 * Guarantees that the app, cache-aside logic, and test suites run smoothly
 * even before the developer connects their real Firebase service account credentials.
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
  // Check if credentials are provided via string or path
  let credential = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const parsedKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    credential = admin.credential.cert(parsedKey);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const keyPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(keyPath)) {
      const fileContent = fs.readFileSync(keyPath, 'utf8');
      const parsedKey = JSON.parse(fileContent);
      credential = admin.credential.cert(parsedKey);
    }
  }

  if (credential) {
    if (!admin.apps.length) {
      admin.initializeApp({ credential });
    }
    db = admin.firestore();
    isRealFirestore = true;
    console.log('[Firestore] 🚀 Connected to live Firebase Firestore project.');
  } else {
    console.log('[Firestore] ℹ️  No Firebase credentials configured in .env.');
    console.log('[Firestore] 💡 Falling back to in-memory Firestore cache store (ideal for local testing).');
    db = new InMemoryFirestoreMock();
  }
} catch (error) {
  console.warn(`[Firestore] ⚠️  Firebase initialization failed (${error.message}). Falling back to in-memory cache.`);
  db = new InMemoryFirestoreMock();
}

export { db, isRealFirestore };
