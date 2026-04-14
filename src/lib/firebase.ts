// src/lib/firebase.ts — Firebase Configuration (Cloud Storage)

import { initializeApp, getApps } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

// ─── Upload File ────────────────────────────────────

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

// ─── Delete File ────────────────────────────────────

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

// ─── Generate Storage Path ─────────────────────────

export function getStoragePath(
  type: "notes" | "videos" | "avatars",
  userId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${type}/${userId}/${timestamp}_${sanitizedName}`;
}

export { storage };