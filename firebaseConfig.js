import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // นำเข้า Auth เพิ่มเติม

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

// เช็คว่ามีแอปเดิมอยู่ไหม ถ้าไม่มีค่อยสร้างใหม่ (ป้องกัน Error "Firebase: App named '[DEFAULT]' already exists")
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ส่งออกตัวแปรเพื่อให้ไฟล์อื่นๆ นำไปใช้งานได้
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // สำหรับระบบ Login / Register

export default app;
