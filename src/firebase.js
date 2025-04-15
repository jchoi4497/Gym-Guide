// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8-_QrxFfHt86o8eVZWcBlNiozSu8wxE0",
  authDomain: "jcsgymguide.firebaseapp.com",
  projectId: "jcsgymguide",
  storageBucket: "jcsgymguide.firebasestorage.app",
  messagingSenderId: "439544885300",
  appId: "1:439544885300:web:264046dd0e1f20da85da61",
  measurementId: "G-99GC22Z661"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);
// const analytics = getAnalytics(app);

export default db