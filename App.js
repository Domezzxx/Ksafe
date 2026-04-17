import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import WelcomeScreen2 from './WelcomeScreen2';
import WelcomeScreen3 from './WelcomeScreen3'; 
import Login from './login'; 
import Register from './Register'; 
import OtpScreen from './OtpScreen'; 
import Success from './Success'; 
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import DetailScreen from './DetailScreen';
import SosScreen from './sos'; 
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import ProfileScreen from './ProfileScreen';
import MapScreen from './MapScreen'; // 💡 Import เพิ่มตามชุดที่ 2

export default function App() {
  // 1. สถานะสำหรับสลับหน้าจอ
  const [currentScreen, setCurrentScreen] = useState('Welcome1');
  
  // 2. สถานะสำหรับเก็บข้อมูลสถานที่ที่เลือก (ใช้ร่วมกันทั้งระบบ)
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 3. ฟังก์ชันส่วนกลางสำหรับ Navigation (Footer/Main)
  const navigateTo = {
    home: () => setCurrentScreen('Home'),
    sos: () => setCurrentScreen('SOS'),
    search: () => setCurrentScreen('Search'),
    profile: () => setCurrentScreen('Profile'),
  };

  // --- 1. กลุ่มหน้า Welcome ---
  if (currentScreen === 'Welcome1') return <WelcomeScreen onNext={() => setCurrentScreen('Welcome2')} />;
  if (currentScreen === 'Welcome2') return <WelcomeScreen2 onNext={() => setCurrentScreen('Welcome3')} onBack={() => setCurrentScreen('Welcome1')} />;
  if (currentScreen === 'Welcome3') return <WelcomeScreen3 onNext={() => setCurrentScreen('Login')} onBack={() => setCurrentScreen('Welcome2')} />;

  // --- 2. กลุ่มหน้า Login / Register / OTP / Success ---
  if (currentScreen === 'Login') {
    return (
      <Login 
        onLogin={navigateTo.home} 
        onRegister={() => setCurrentScreen('Register')} 
        onForgotPassword={() => setCurrentScreen('ForgotPassword')} 
      />
    );
  }
  if (currentScreen === 'Register') return <Register onNext={() => setCurrentScreen('OTP')} onBack={() => setCurrentScreen('Login')} />;
  if (currentScreen === 'OTP') return <OtpScreen onVerify={() => setCurrentScreen('Success')} onBack={() => setCurrentScreen('Register')} />;
  if (currentScreen === 'Success') return <Success onNext={() => setCurrentScreen('Login')} />;

  // --- 3. กลุ่มหน้าลืมรหัสผ่าน (Forgot Password Flow) ---
  if (currentScreen === 'ForgotPassword') return <ForgotPassword onNext={() => setCurrentScreen('ForgotOTP')} onBack={() => setCurrentScreen('Login')} />;
  if (currentScreen === 'ForgotOTP') return <OtpScreen onVerify={() => setCurrentScreen('ResetPassword')} onBack={() => setCurrentScreen('ForgotPassword')} />;
  if (currentScreen === 'ResetPassword') return <ResetPassword onNext={() => setCurrentScreen('Login')} onBack={() => setCurrentScreen('ForgotOTP')} />;

  // --- 4. กลุ่มหน้าฟีเจอร์หลัก (Search, Detail, Map, SOS, Profile) ---
  
  // 📌 หน้าค้นหาสถานที่
  if (currentScreen === 'Search') {
    return (
      <SearchScreen 
        onBack={navigateTo.home} 
        onGoHome={navigateTo.home}
        onGoSOS={navigateTo.sos}
        onGoSearch={navigateTo.search}
        onGoProfile={navigateTo.profile}
        goToDetail={(placeData) => {
          setSelectedPlace(placeData); 
          setCurrentScreen('Detail');  
        }}
      />
    );
  }

  // 📌 หน้าแสดงรายละเอียดสถานที่
  if (currentScreen === 'Detail') {
    return (
      <DetailScreen 
        data={selectedPlace} 
        onBack={() => setCurrentScreen('Search')} 
        onPressMap={() => setCurrentScreen('Map')} // 💡 เชื่อมไปหน้า Map
      />
    );
  }

  // 📌 หน้าแผนที่และการนำทาง
  if (currentScreen === 'Map') {
    return (
      <MapScreen 
        onBack={() => setCurrentScreen('Detail')} 
        destinationName={selectedPlace?.name} 
        destinationCoords={{
          latitude: selectedPlace?.latitude,
          longitude: selectedPlace?.longitude
        }}
      />
    );
  }

  // 📌 หน้าฉุกเฉิน SOS
  if (currentScreen === 'SOS') {
    return (
      <SosScreen 
        onCancel={navigateTo.home} 
        onGoHome={navigateTo.home}
        onGoSearch={navigateTo.search}
        onGoProfile={navigateTo.profile}
      />
    );
  }

  // 📌 หน้าโปรไฟล์
  if (currentScreen === 'Profile') {
    return (
      <ProfileScreen 
        onGoHome={navigateTo.home}
        onGoSOS={navigateTo.sos}
        onGoSearch={navigateTo.search}
        onGoProfile={navigateTo.profile}
      />
    );
  }

  // --- 5. หน้าหลัก (Home) ---
  // จะถูกเรียกใช้เมื่อ currentScreen === 'Home' หรือไม่อยู่ในเงื่อนไขด้านบน
  return (
    <HomeScreen 
      onGoHome={navigateTo.home}
      onGoSOS={navigateTo.sos}
      onGoSearch={navigateTo.search}
      onGoProfile={navigateTo.profile}
      onGoToSearch={navigateTo.search} // สำหรับปุ่มลัดในหน้า Home
      onGoToSOS={navigateTo.sos}      // สำหรับปุ่มลัดในหน้า Home
    />
  );
}
