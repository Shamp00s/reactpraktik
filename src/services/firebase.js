import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = { 
  apiKey: "AIzaSyDu5k4MGxsgQiTCoT_bkWftJhKJdpgvurY", 
  authDomain: "magazin-electroniki.firebaseapp.com", 
  projectId: "magazin-electroniki", 
  storageBucket: "magazin-electroniki.firebasestorage.app", 
  messagingSenderId: "571363653315", 
  appId: "1:571363653315:web:8bedaf506b054894bc1476", 
  measurementId: "G-H6HRQWQPDG" 
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);