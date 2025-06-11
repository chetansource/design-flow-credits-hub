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
  apiKey: "AIzaSyD4W_sKRsw6BmXiNSsr72u4BOe_ato_i54",
  authDomain: "design-flow-credits-hub.firebaseapp.com",
  projectId: "design-flow-credits-hub",
  storageBucket: "design-flow-credits-hub.firebasestorage.app",
  messagingSenderId: "217368631137",
  appId: "1:217368631137:web:d6ddb6d1ff0677949c1720",
  measurementId: "G-ZGFPMYS38J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);