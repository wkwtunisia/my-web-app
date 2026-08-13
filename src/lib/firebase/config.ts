import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyACvcB1t4-bvlJdNNbgPcOr3WbYaNRmbQc",
  authDomain: "my-web-app-effd1.firebaseapp.com",
  projectId: "my-web-app-effd1",
  storageBucket: "my-web-app-effd1.firebasestorage.app",
  messagingSenderId: "669429060267",
  appId: "1:669429060267:web:a2876f1126c312c1b71dee",
  measurementId: "G-0ES8HPFZSG"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence to local
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase persistence set to local');
    })
    .catch((err) => {
      console.error('Firebase persistence error:', err);
    });

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn('Firestore persistence error:', err);
  });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const githubProvider = new GithubAuthProvider();

export { app, auth, db, storage, googleProvider, githubProvider };
