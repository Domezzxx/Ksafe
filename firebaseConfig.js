import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth"; // 💡 เพิ่มบรรทัดนี้

const firebaseConfig = {
  apiKey: "AIzaSyB937hfvZjrN0lMax8f2MGSOxuM7VUegrE",
  authDomain: "ksafe-2cb9f.firebaseapp.com",
  databaseURL: "https://ksafe-2cb9f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ksafe-2cb9f",
  storageBucket: "ksafe-2cb9f.firebasestorage.app",
  messagingSenderId: "257440695264",
  appId: "1:257440695264:web:7e5e0608ecee3aedc4a185",
  measurementId: "G-9FRHXPPW3X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 💡 สร้างตัวแปร db และ auth ส่งออกไปใช้งานในหน้าอื่นๆ
export const db = getFirestore(app);
export const auth = getAuth(app);
