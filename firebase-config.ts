import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apikey as string,
  authDomain: import.meta.env.VITE_authDomain as string,
  databaseURL: import.meta.env.VITE_databaseURL as string,
  projectId: import.meta.env.VITE_projectId as string,
  storageBucket: import.meta.env.VITE_storageBucket as string,
  messagingSenderId: import.meta.env.VITE_messagingSenderId as string,
  appId: import.meta.env.VITE_appId as string,
  measurementId: import.meta.env.VITE_measurementId as string
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
