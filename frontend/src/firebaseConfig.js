// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaUTlt2rSAfPPhXVQECHNssoIryqe1B_o",
  authDomain: "vivo-fashion.firebaseapp.com",
  projectId: "vivo-fashion",
  storageBucket: "vivo-fashion.firebasestorage.app",
  messagingSenderId: "311049710607",
  appId: "1:311049710607:web:8cad4faa423ef82239077a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();