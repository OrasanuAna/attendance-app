import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBbcwKW09lDx-NQzUj_WhZ1gvNYLowLA8U",
  authDomain: "attendance-app-7b3b0.firebaseapp.com",
  projectId: "attendance-app-7b3b0",
  storageBucket: "attendance-app-7b3b0.firebasestorage.app",
  messagingSenderId: "13623889565",
  appId: "1:13623889565:web:b4dd76a9507bd5aedd4e74"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);