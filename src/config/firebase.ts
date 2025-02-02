import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, Auth } from "firebase/auth";

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
let auth: Auth;
// Initialize Firebase only if it hasn't been initialized before
if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  // Use Firebase Auth service
  auth = getAuth(app);
} else {
  app = getApps()[0]; // Get the already initialized app
}

export { auth, createUserWithEmailAndPassword };
