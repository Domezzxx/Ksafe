# 🛡️ Ksafe — ระบบแจ้งเหตุฉุกเฉิน

แอปพลิเคชันรวมความช่วยเหลือฉุกเฉินไว้ในที่เดียว  
สร้างด้วย **React Native (Expo)** + **Firebase Firestore** + **Google Maps**

---

## 📁 โครงสร้างโปรเจกต์

```
ksafe/
├── App.js                        ← จุดเริ่มต้นแอป (Navigation ทั้งหมด)
├── firebaseConfig.js             ← Firebase config (Firestore, Storage, Auth)
│
├── screens/
│   ├── WelcomeScreen.js          ← Onboarding หน้า 1
│   ├── WelcomeScreen2.js         ← Onboarding หน้า 2
│   ├── WelcomeScreen3.js         ← Onboarding หน้า 3
│   ├── login.js                  ← หน้าเข้าสู่ระบบ (ตรวจสอบผ่าน Firestore)
│   ├── Register.js               ← หน้าสมัครสมาชิก (บันทึกลง Firestore)
│   ├── OtpScreen.js              ← ยืนยัน OTP (จำลองใน App)
│   ├── Success.js                ← หน้าสมัครสมาชิกสำเร็จ
│   ├── ForgotPassword.js         ← ลืมรหัสผ่าน (กรอกเบอร์โทร)
│   ├── ResetPassword.js          ← ตั้งรหัสผ่านใหม่ (อัปเดตลง Firestore)
│   │
│   ├── HomeScreen.js             ← หน้าหลัก (แสดง emergency_services แยกหมวดหมู่)
│   ├── SearchScreen.js           ← ค้นหาสถานที่ (ดึงจาก facilities)
│   ├── DetailScreen.js           ← รายละเอียดสถานที่ + โทร + นำทาง
│   ├── MapScreen.js              ← แผนที่นำทาง GPS Real-time + Progress Bar
│   ├── sos.js                    ← หน้า SOS (Slide to call + นับถอยหลัง + บันทึก incident)
│   ├── ProfileScreen.js          ← โปรไฟล์ผู้ใช้ + แก้ไข + เลือกเบอร์ฉุกเฉิน
│   │
│   ├── AdminHomeScreen.js        ← แดชบอร์ด Admin (สถิติ + แผนที่ + รายงาน)
│   ├── IncidentSortingScreen.js  ← สรุปพิกัดแยกประเภทความเสี่ยง + ปฏิทิน
│   ├── ManageContactScreen.js    ← จัดการเบอร์หน่วยงานฉุกเฉิน
│   ├── ManageFacilitiesScreen.js ← จัดการสถานที่ (CRUD + ปักหมุดแผนที่)
│   └── ManageUserScreen.js       ← จัดการผู้ใช้ (แก้ไข/ลบ)
│
└── assets/                       ← รูปภาพและไอคอน
```

---

## 🔄 Navigation Flow

```
Welcome1 → Welcome2 → Welcome3
                              ↓
                           Login ←──────────────────┐
                          ↙      ↘                   │
                    Register    ForgotPassword        │
                       ↓              ↓              │
                      OTP          ForgotOtp          │
                       ↓              ↓              │
                    Success      ResetPassword ───────┘
                       ↓
                     Login
                    ↙      ↘
              (role=user)  (role=admin)
                  ↓              ↓
               Home          AdminHome
             ↙ ↓ ↘ ↘       ↙ ↓ ↘ ↘
          Home SOS Search Profile  ManageContact ManageFacilities ManageUser IncidentSorting
                  ↓
               Detail → Map
```

---

## 🗄️ Firestore Collections

| Collection | คำอธิบาย |
|---|---|
| `users` | ข้อมูลผู้ใช้ทั้งหมด (ใช้ `phone_number` เป็น key หลัก) |
| `emergency_services` | เบอร์หน่วยงานฉุกเฉิน (ตำรวจ, โรงพยาบาล, กู้ภัย ฯลฯ) |
| `facilities` | สถานที่ฉุกเฉิน (พร้อมพิกัด GeoPoint และรูปภาพ Base64) |
| `incident_reports` | บันทึกทุกครั้งที่มีการโทรหรือกด SOS |
| `emergencyContact` | ข้อมูลผู้ติดต่อฉุกเฉินของผู้ใช้แต่ละคน |

### โครงสร้าง `users/{docId}`
```js
{
  firstName: string,
  lastName: string,
  phone_number: string,   // ใช้ login และ query
  password: string,       // เก็บตรงๆ (plain text)
  role: 'user' | 'admin',
  weight: string,
  height: string,
  birthDate: string,      // รูปแบบ 'DD/MM/YYYY (พ.ศ.)'
  gender: string,
  bloodType: string,
  organDonor: string,
  aboutMe: string,
  address: string,
  coordinate: { latitude, longitude },
  emergencyContact: { name, phone },
  profileImage: string,   // URL หรือ Base64
  createdAt: Timestamp,
}
```

### โครงสร้าง `facilities/{docId}`
```js
{
  ชื่อ: string,
  เบอร์โทร: string,
  ที่อยู่: string,
  ประเภท: 'โรงพยาบาล' | 'สถานีตำรวจ' | 'กู้ภัย' | 'สถานีดับเพลิง',
  พิกัด: GeoPoint,
  รูปภาพ: string,         // Base64
}
```

### โครงสร้าง `incident_reports/{docId}`
```js
{
  service_name: string,
  phone_called: string,
  latitude: number,
  longitude: number,
  reporter_id: string,    // phone_number ของผู้แจ้ง
  timestamp: Timestamp,
  source: 'SOS' | null,
}
```

### โครงสร้าง `emergency_services/{docId}`
```js
{
  title: string,
  phone: string,
  category: 'สถานีตำรวจ' | 'โรงพยาบาล' | 'กู้ภัย' | 'เพลิงไหม้' | 'สาธารณูปโภค' | 'ความปลอดภัย',
  image: string,          // Base64
  updatedAt: string,
}
```

---

## 🔧 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
npm install
# หรือ
yarn install
```

### 2. ตั้งค่า Firebase

1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. สร้าง Project และเปิดใช้งาน:
   - **Firestore Database**
   - **Storage**
   - **Authentication** (เปิดไว้แม้ระบบ login จะใช้ Firestore เอง)
3. แก้ไขค่าใน `firebaseConfig.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. ตั้งค่า Google Maps API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. เปิดใช้งาน:
   - Maps SDK for Android / iOS
   - Directions API
3. แทนที่ API Key ใน `MapScreen.js` และ `IncidentSortingScreen.js`:

```js
const GOOGLE_MAPS_APIKEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```

### 4. รัน Development

```bash
# ผ่าน Expo Go
npx expo start

# หรือรันบน Simulator
npx expo run:ios
npx expo run:android
```

---

## 👤 สร้างบัญชี Admin

เพิ่มหรือแก้ไขข้อมูลใน Firestore collection `users` โดยตั้ง field `role` เป็น `'admin'`:

```js
{
  phone_number: "0812345678",
  password: "your_password",
  role: "admin",   // ← ตั้งค่าตรงนี้
  firstName: "Admin",
  ...
}
```

---

## 📱 Features

### User
- Onboarding 3 หน้า
- สมัครสมาชิก + OTP จำลอง (แสดงรหัสผ่านกระดิ่งในแอป)
- Login ด้วยเบอร์โทร + รหัสผ่าน (ตรวจสอบผ่าน Firestore)
- ลืมรหัสผ่าน → OTP → ตั้งรหัสใหม่
- หน้าหลักแสดงหน่วยงานฉุกเฉินแยก 4 หมวด (เหตุด่วน / การแพทย์ / ความปลอดภัย / สาธารณูปโภค)
- **🚨 SOS** — Slide to call พร้อมนับถอยหลัง 5 วินาที, บันทึก incident + GPS ลง Firestore
- **🗺️ ค้นหาสถานที่** — กรองตามหมวดหมู่, กดดูรายละเอียด, นำทางด้วยแผนที่ใน App
- **นำทาง GPS Real-time** — แสดงเส้นทาง, Progress Bar, แจ้งเตือนเมื่อใกล้ถึง / ถึงที่หมาย
- โปรไฟล์ผู้ใช้ — ข้อมูลสุขภาพ, ปักหมุดที่อยู่, เลือกเบอร์ติดต่อฉุกเฉิน

### Admin
- แดชบอร์ด — จำนวนเหตุการณ์วันนี้, ผู้ใช้ทั้งหมด, สถานที่ในระบบ
- แผนที่แสดงจุดเสี่ยง (สูง / ปานกลาง / เฝ้าระวัง) คำนวณจากความหนาแน่นใน 1 กม.
- กราฟสรุปการโทรรายเดือน แยกตามหน่วยงาน
- จัดการเบอร์หน่วยงาน (CRUD + หมวดหมู่ + รูปภาพ)
- จัดการสถานที่ (CRUD + ปักหมุดแผนที่ + รูปภาพ Base64)
- จัดการผู้ใช้ (ดูข้อมูล, แก้ไข, ลบ)
- สรุปพิกัดแยกประเภท + กรองตามวันที่ด้วยปฏิทิน

---

## ⚠️ ข้อควรระวัง

- ระบบนี้เก็บ **password เป็น plain text** ใน Firestore ไม่เหมาะสำหรับ Production จริง ควรใช้ Firebase Authentication แทน
- API Key ของ Google Maps และ Firebase ที่อยู่ในโค้ดควรย้ายไปไว้ใน `.env` ก่อน deploy
- รูปภาพที่อัปโหลดเก็บเป็น Base64 ใน Firestore ซึ่งมีขีดจำกัด 1 MB ต่อ Document ควรย้ายไป Firebase Storage สำหรับรูปขนาดใหญ่
