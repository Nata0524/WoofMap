// src/firebaseConfig.js  (o en la raíz /firebaseConfig.js según tu estructura)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB0cRaOb_fbR_NXqg-Xpr31ewNGElLXoqs",
  authDomain: "woofmap-209ca.firebaseapp.com",
  projectId: "woofmap-209ca",
  storageBucket: "woofmap-209ca.appspot.com",
  messagingSenderId: "920216560538",
  appId: "1:920216560538:web:84354927bafda690d95023",
  measurementId: "G-78PRS22RR9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
