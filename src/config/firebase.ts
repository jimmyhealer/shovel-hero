// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6Tg8Nj4fdV9O7HAeLKKxUiOxQVuIPmRg",
  authDomain: "shovel-hero.firebaseapp.com",
  projectId: "shovel-hero",
  storageBucket: "shovel-hero.firebasestorage.app",
  messagingSenderId: "706841698283",
  appId: "1:706841698283:web:b3cb40bdc0f54758f7c3ae",
  measurementId: "G-S81XQM0ZSK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const functions = getFunctions(app)

export default app

