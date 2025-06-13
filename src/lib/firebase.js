// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth,GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCk4mKaqaYNbtAeeCY77hhRhHlaVZXgCJg",
  authDomain: "credit-tracker-236c3.firebaseapp.com",
  projectId: "credit-tracker-236c3",
  storageBucket: "credit-tracker-236c3.firebasestorage.app",
  messagingSenderId: "443985382041",
  appId: "1:443985382041:web:2cd31f46129eef77be0608",
  measurementId: "G-2WEQ4LD3RL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);