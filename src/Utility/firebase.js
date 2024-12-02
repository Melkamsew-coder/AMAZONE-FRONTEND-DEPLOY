import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABfUc4qw1FrRxazfO-mYTD3dcjMf6EUU8",
  authDomain: "clone-a862d.firebaseapp.com",
  projectId: "clone-a862d",
  storageBucket: "clone-a862d.appspot.com",
  messagingSenderId: "679089413869",
  appId: "1:679089413869:web:c0c3e72348796feb5536e4",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = app.firestore();


