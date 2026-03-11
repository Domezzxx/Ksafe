# 🛡️ Ksafe — ระบบแจ้งเหตุฉุกเฉิน

React Native + Firebase + Google Maps

---

## 📁 โครงสร้างโปรเจกต์

```
ksafe/
├── App.tsx                          ← จุดเริ่มต้นแอพ
├── src/
│   ├── types/index.ts               ← TypeScript types ทั้งหมด
│   ├── constants/index.ts           ← สี, ค่าคงที่, API Keys
│   ├── store/authStore.ts           ← Zustand state management
│   ├── services/
│   │   ├── authService.ts           ← Firebase Phone Auth + OTP
│   │   ├── incidentService.ts       ← SOS / แจ้งเหตุ
│   │   ├── locationService.ts       ← GPS + Google Maps API
│   │   ├── poiService.ts            ← สถานที่ฉุกเฉิน
│   │   └── notificationService.ts   ← FCM Push Notifications
│   ├── components/common/           ← UI components ที่ใช้ร่วม
│   ├── screens/
│   │   ├── auth/                    ← Onboarding, Login, OTP, Register
│   │   ├── user/                    ← Home, SOS, Map, Profile, Contacts
│   │   └── admin/                   ← Dashboard, Users, Incidents, POI...
│   └── navigation/index.tsx         ← React Navigation setup
├── firebase-functions/
│   └── functions/src/index.ts       ← Cloud Functions (Notifications, Stats)
├── firestore.rules                  ← Security Rules
└── package.json
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
2. สร้าง Project ใหม่ หรือใช้โปรเจกต์เดิม
3. เปิดใช้งาน:
   - **Authentication** → Phone
   - **Firestore Database**
   - **Realtime Database**
   - **Cloud Storage**
   - **Cloud Messaging (FCM)**
4. ดาวน์โหลด `google-services.json` (Android) และ `GoogleService-Info.plist` (iOS)
5. วางไฟล์:
   - `google-services.json` → `android/app/`
   - `GoogleService-Info.plist` → `ios/ksafe/`
6. แก้ไข `src/services/firebase/config.ts`:

```ts
const firebaseConfig = {
  apiKey: 'YOUR_ACTUAL_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  ...
};
```

### 3. ตั้งค่า Google Maps API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. เปิดใช้งาน APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API**
   - **Geocoding API**
   - **Directions API**
3. สร้าง API Key
4. แก้ไข `src/constants/index.ts`:

```ts
export const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY';
```

5. เพิ่มใน Android (`android/app/src/main/AndroidManifest.xml`):

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY" />
```

6. เพิ่มใน iOS (`ios/ksafe/AppDelegate.swift`):

```swift
GMSServices.provideAPIKey("YOUR_API_KEY")
```

### 4. รัน Development

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### 5. Deploy Cloud Functions

```bash
cd firebase-functions/functions
npm install
npm run build
firebase deploy --only functions
```

---

## 🗄️ Firestore Data Structure

```
users/{uid}
  ├── displayName: string
  ├── phoneNumber: string
  ├── bloodType: string
  ├── medicalConditions: string
  ├── role: 'user' | 'admin' | 'superadmin'
  ├── fcmToken: string
  └── isVerified: boolean

incidents/{incidentId}
  ├── userId, userName, userPhone
  ├── type: 'accident' | 'medical' | 'fire' | 'drowning' | 'other'
  ├── status: 'new' | 'inProgress' | 'resolved' | 'cancelled'
  ├── location: { latitude, longitude }
  ├── address: string
  └── createdAt, updatedAt

poi/{poiId}
  ├── name, type, phone, address
  ├── location: { latitude, longitude }
  └── isActive: boolean

systemContacts/{id}
  ├── name, phone, icon, category
  ├── order: number
  └── isActive: boolean
```

## 🔴 Realtime Database Structure

```
userLocations/{userId}
  ├── location: { latitude, longitude }
  ├── timestamp: number
  └── isOnline: boolean

activeIncidents/{incidentId}
  └── (incident data สำหรับ Admin Live view)
```

---

## 👤 สร้าง Admin Account

```js
// ใน Firebase Console > Firestore > users collection
// แก้ field role เป็น 'admin' หรือ 'superadmin'
{
  uid: "USER_UID",
  role: "superadmin",  // ← แก้ตรงนี้
  ...
}
```

---

## 📱 Features ทั้งหมด

### User App
- [x] Onboarding 3 หน้า
- [x] สมัครสมาชิก + OTP ยืนยัน
- [x] หน้าหลัก + Quick Actions
- [x] **🚨 แจ้งเหตุ SOS** + เลือกประเภท + ส่งรูปภาพ
- [x] **🗺️ แผนที่** + ค้นหาสถานที่ใกล้เคียง + นำทาง
- [x] ติดตามตำแหน่ง GPS Real-time
- [x] เบอร์ติดต่อฉุกเฉิน
- [x] โปรไฟล์ + ข้อมูลสุขภาพ

### Admin Backend
- [x] Dashboard + Live Statistics
- [x] จัดการผู้ใช้ (ดู/แบน/ปลดแบน)
- [x] **เหตุการณ์ฉุกเฉิน Real-time**
- [x] แผนที่ Live tracking
- [x] จัดการ POI (เพิ่ม/แก้ไข/ลบสถานที่)
- [x] จัดการเบอร์ฉุกเฉิน
- [x] ส่ง Push Notification
- [x] รายงาน & สถิติ
- [x] ตั้งค่าระบบ

### Cloud Functions
- [x] แจ้งเตือน Admin เมื่อมีเหตุการณ์ใหม่
- [x] ส่ง Push Notification
- [x] คำนวณสถิติ Dashboard
- [x] ทำความสะอาด location data เก่า
