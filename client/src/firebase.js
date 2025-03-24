import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkJlgU9ozVDn49CWtJkqlTbK8Cs1zdobE",
  authDomain: "casaconnect-5fa6c.firebaseapp.com",
  projectId: "casaconnect-5fa6c",
  storageBucket: "casaconnect-5fa6c.firebasestorage.app",
  messagingSenderId: "541664050536",
  appId: "1:541664050536:web:59be901ae789b8e20a6add"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, provider, db, storage };
