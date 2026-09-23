import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBfiWRkX7Y_qKZeGspo0f5FEQR2kZHpmmY",
  authDomain: "kiranawala01.firebaseapp.com",
  projectId: "kiranawala01",
  storageBucket: "kiranawala01.firebasestorage.app",
  messagingSenderId: "654440054992",
  appId: "1:654440054992:web:fabf5cce93c1fb4aad5ed5",
  measurementId: "G-9SG3M6YSWG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
