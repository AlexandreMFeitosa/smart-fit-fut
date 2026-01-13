import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-EWIWg7W6j_WGZ1l5eeoeALthl3bgH1k",
  authDomain: "smart-fit-fut.firebaseapp.com",
  projectId: "smart-fit-fut",
  storageBucket: "smart-fit-fut.firebasestorage.app",
  messagingSenderId: "150227256696",
  appId: "1:150227256696:web:22d83c00cf77df78df348d",
  measurementId: "G-34EZJ45SEP"
};

// Inicializa o Firebase uma única vez
const app = initializeApp(firebaseConfig);

// Exporta os serviços para usar no restante do app
export const db = getDatabase(app);
export const auth = getAuth(app);