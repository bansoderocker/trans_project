import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { collection, addDoc } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  Auth,
} from "firebase/auth";
import { Database, getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: process.env.apiKey,
//   authDomain: process.env.authDomain,
//   databaseURL: process.env.databaseURL,
//   projectId: process.env.projectId,
//   storageBucket: process.env.storageBucket,
//   messagingSenderId: process.env.messagingSenderId,
//   appId: process.env.appId,
//   measurementId: process.env.measurementId,
// };
const firebaseConfig = {
  apiKey: "AIzaSyA_rBak5Zb7rlQmBK70y4rHOI-fnDlvhp0",
  authDomain: "mywallet-afcbb.firebaseapp.com",
  databaseURL: "https://mywallet-afcbb-default-rtdb.firebaseio.com",
  projectId: "mywallet-afcbb",
  storageBucket: "mywallet-afcbb.firebasestorage.app",
  messagingSenderId: "261378138156",
  appId: "1:261378138156:web:3b20797308f7abfd2ab189",
  measurementId: "G-RRH82BBVYG",
};

// firebase.initializeApp(firebaseConfig);
let app: FirebaseApp;
let db: Database;
let auth: Auth;
// Initialize Firebase only if it hasn't been initialized before
if (typeof window !== "undefined" && !getApps().length) {
  // app = initializeApp(firebaseConfig);
  // db = getFirestore(app);
  // Use Firebase Auth service

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
} else {
  app = getApps()[0]; // Get the already initialized app
}
export const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in: ", error);
  }
};

export const logout = async () => {
  await signOut(auth);
};

export { auth, collection, createUserWithEmailAndPassword, db, addDoc };
