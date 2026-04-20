import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSP0Ci07cLhKz-_wMXPHqnTzO7mK-AI94",
  authDomain: "web-fashion-1382a.firebaseapp.com",
  projectId: "web-fashion-1382a",
  storageBucket: "web-fashion-1382a.firebasestorage.app",
  messagingSenderId: "461676088757",
  appId: "1:461676088757:web:cbda931df55943ecafddfc",
  measurementId: "G-MC9C8N0YX8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);