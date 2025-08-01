// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// for poduction use
const firebaseConfig = {
  apiKey: "AIzaSyCk4mKaqaYNbtAeeCY77hhRhHlaVZXgCJg",
  authDomain: "credit-tracker-236c3.firebaseapp.com",
  projectId: "credit-tracker-236c3",
  storageBucket: "credit-tracker-236c3.firebasestorage.app",
  messagingSenderId: "443985382041",
  appId: "1:443985382041:web:2cd31f46129eef77be0608",
  measurementId: "G-2WEQ4LD3RL",
};

// Test Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyArBlTmShXNcZtiM3byyRsrWIYhFbuemWc",
//   authDomain: "credit-tracker-development.firebaseapp.com",
//   projectId: "credit-tracker-development",
//   storageBucket: "credit-tracker-development.firebasestorage.app",
//   messagingSenderId: "377224360058",
//   appId: "1:377224360058:web:7ee22e527c3ad9341a4bc3",
//   measurementId: "G-ZJB70EH3XQ",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
