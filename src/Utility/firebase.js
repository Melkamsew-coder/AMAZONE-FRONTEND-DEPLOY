import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGAAr9PDfbNWeTz5SiBf5tO9TDKsqLj1k",
  authDomain: "e-clone-2024-6244e.firebaseapp.com",
  projectId: "e-clone-2024-6244e",
  storageBucket: "e-clone-2024-6244e.appspot.com",
  messagingSenderId: "1032582925239",
  appId: "1:1032582925239:web:1679a8dc59e5d4937bf632",
};

// Initialize Firebase/ Firestore
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = app.firestore();
