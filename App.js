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
import MapScreen from './MapScreen';
import AdminHomeScreen from './AdminHomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome1');
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [tempUserData, setTempUserData] = useState(null);
  const [resetPhone, setResetPhone] = useState(''); // เก็บเบอร์โทรศัพท์สำหรับ Reset รหัสผ่าน
  const [globalContact, setGlobalContact] = useState({ name: 'สถานีตำรวจ', phone: '191' });
  
  const navigateTo = {
    home: () => setCurrentScreen('Home'),
    sos: () => setCurrentScreen('SOS'),
    search: () => setCurrentScreen('Search'),
    profile: () => setCurrentScreen('Profile'),
    admin: () => setCurrentScreen('AdminHome'),
  };

  // --- Welcome Screens ---
  if (currentScreen === 'Welcome1') return <WelcomeScreen onNext={() => setCurrentScreen('Welcome2')} />;
  if (currentScreen === 'Welcome2') return <WelcomeScreen2 onNext={() => setCurrentScreen('Welcome3')} onBack={() => setCurrentScreen('Welcome1')} />;
  if (currentScreen === 'Welcome3') return <WelcomeScreen3 onNext={() => setCurrentScreen('Login')} onBack={() => setCurrentScreen('Welcome2')} />;

  // --- Auth Screens ---
  if (currentScreen === 'Login') {
    return (
      <Login 
        onLogin={(role) => role === 'admin' ? navigateTo.admin() : navigateTo.home()} 
        onRegister={() => setCurrentScreen('Register')} 
        onForgotPassword={() => setCurrentScreen('ForgotPassword')} 
      />
    );
  }
  
  if (currentScreen === 'Register') {
    return (
      <Register 
        onNext={(data) => {
          setTempUserData(data); 
          setCurrentScreen('OTP');
        }} 
        onBack={() => setCurrentScreen('Login')} 
      />
    );
  }

  if (currentScreen === 'OTP') {
    return (
      <OtpScreen 
        userData={tempUserData} 
        onVerify={() => {
          setTempUserData(null); 
          setCurrentScreen('Success');
        }} 
        onBack={() => setCurrentScreen('Register')} 
      />
    );
  }

  if (currentScreen === 'Success') return <Success onNext={() => setCurrentScreen('Login')} />;

  // --- Forgot Password Flow ---
  if (currentScreen === 'ForgotPassword') {
    return (
      <ForgotPassword 
        onNext={(phoneNumber) => { 
          setResetPhone(String(phoneNumber)); // เก็บเบอร์โทรศัพท์
          setCurrentScreen('ForgotOTP'); 
        }} 
        onBack={() => setCurrentScreen('Login')} 
      />
    );
  }

  if (currentScreen === 'ForgotOTP') {
    return (
      <OtpScreen 
        onVerify={() => setCurrentScreen('ResetPassword')} 
        onBack={() => setCurrentScreen('ForgotPassword')} 
      />
    );
  }

  if (currentScreen === 'ResetPassword') {
    return (
      <ResetPassword 
        phone={resetPhone} // ส่งเบอร์โทรศัพท์ไป Query ใน Firebase
        onNext={() => {
          setResetPhone(''); // ล้างค่าเบอร์หลังเสร็จ
          setCurrentScreen('Login');
        }} 
        onBack={() => setCurrentScreen('ForgotOTP')} 
      />
    );
  }

  // --- Admin Screens ---
  if (currentScreen === 'AdminHome') {
    return (
      <AdminHomeScreen 
        onLogout={() => setCurrentScreen('Login')}
        onGoProfile={navigateTo.profile}
      />
    );
  }

  // --- Main App Screens ---
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

  if (currentScreen === 'Detail') {
    return (
      <DetailScreen 
        data={selectedPlace} 
        onBack={() => setCurrentScreen('Search')} 
        onPressMap={() => setCurrentScreen('Map')}
      />
    );
  }

  if (currentScreen === 'Map') {
  return (
    <MapScreen 
      onBack={() => setCurrentScreen('Detail')} 
      // เปลี่ยนจาก .name เป็น .ชื่อ ตาม Firebase
      destinationName={selectedPlace?.ชื่อ || "จุดหมายปลายทาง"} 
      // เปลี่ยนจาก .latitude เป็น .พิกัด.latitude ตามโครงสร้าง GeoPoint
      destinationCoords={{
        latitude: selectedPlace?.พิกัด?.latitude,
        longitude: selectedPlace?.พิกัด?.longitude
      }}
    />
  );
}
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

  if (currentScreen === 'Profile') {
    return (
      <ProfileScreen 
        onGoHome={navigateTo.home}
        onGoSOS={navigateTo.sos}
        onGoSearch={navigateTo.search}
        onGoProfile={navigateTo.profile}
        onLogout={() => setCurrentScreen('Login')} 
      />
    );
  }

  // Default: Home Screen
  return (
    <HomeScreen 
      onGoHome={navigateTo.home}
      onGoSOS={navigateTo.sos}
      onGoSearch={navigateTo.search}
      onGoProfile={navigateTo.profile}
      onGoToSearch={navigateTo.search} 
      onGoToSOS={navigateTo.sos}      
    />
  );
}
