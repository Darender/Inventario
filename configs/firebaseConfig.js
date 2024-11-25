// configs/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBdIpHA-oNkjtwuwVGX9FARSJoAe2d-7JY",
    authDomain: "inventario-softwere.firebaseapp.com",
    projectId: "inventario-softwere",
    storageBucket: "inventario-softwere.firebasestorage.app",
    messagingSenderId: "603265731318",
    appId: "1:603265731318:web:e3ab21c224222618907ad7",
    measurementId: "G-60PF4X4TV8"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };