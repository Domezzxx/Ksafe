import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import WelcomeScreen2 from './WelcomeScreen2';
import WelcomeScreen3 from './WelcomeScreen3'; 
import Login from './login'; // ✅ ใช้ตัวพิมพ์เล็กตามไฟล์จริง
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
import ManageContactScreen from './ManageContactScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome1');
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [tempUserData, setTempUserData] = useState(null);
  const [resetPhone, setResetPhone] = useState(''); 
  const [userPhone, setUserPhone] = useState(''); 
  const [userRole, setUserRole] = useState('');   

  const navigateTo = {
    home: () => setCurrentScreen('Home'),
    sos: () => setCurrentScreen('SOS'),
    search: () => setCurrentScreen('Search'),
    profile: () => setCurrentScreen('Profile'),
    admin: () => setCurrentScreen('AdminHome'),
    manageContact: () => setCurrentScreen('ManageContact'), 
  };

  // --- Welcome Screens ---
  if (currentScreen === 'Welcome1') return <WelcomeScreen onNext={() => setCurrentScreen('Welcome2')} />;
  if (currentScreen === 'Welcome2') return <WelcomeScreen2 onNext={() => setCurrentScreen('Welcome3')} onBack={() => setCurrentScreen('Welcome1')} />;
  if (currentScreen === 'Welcome3') return <WelcomeScreen3 onNext={() => setCurrentScreen('Login')} onBack={() => setCurrentScreen('Welcome2')} />;

  // --- Auth Screens ---
  if (currentScreen === 'Login') {
    return (
      <Login 
        onLogin={(role, phone) => {
          setUserRole(role);
          setUserPhone(phone);
          if (role === 'admin') {
            navigateTo.admin();
          } else {
            navigateTo.home();
          }
        }} 
        onRegister={() => setCurrentScreen('Register')} 
        onForgotPassword={() => setCurrentScreen('ForgotPassword')} 
      />
    );
  }
  
  if (currentScreen === 'Register') {
    return (
      <Register
        onBack={() => setCurrentScreen('Login')}
        onNext={(data) => {
          setTempUserData(data);
          setCurrentScreen('Otp');
        }}
      />
    );
  }

  if (currentScreen === 'Otp') {
    return (
      <OtpScreen
        userData={tempUserData}
        onBack={() => setCurrentScreen('Login')}
        onVerifySuccess={() => setCurrentScreen('Success')}
      />
    );
  }

  if (currentScreen === 'Success') return <Success onNext={() => setCurrentScreen('Login')} />;

  // --- Forgot Password Flow (แก้ไขส่วนที่ซ้ำซ้อนให้สมบูรณ์) ---
  // ตัวอย่างการเรียกใช้ใน App.js ให้สัมพันธ์กับไฟล์ ForgotPassword.js ของคุณ
if (currentScreen === 'ForgotPassword') {
  return (
    <ForgotPassword 
      onBack={() => setCurrentScreen('Login')} 
      onNext={(phoneNumber) => { // ✅ รับค่า string ที่ handleNext ส่งออกมา
        setResetPhone(phoneNumber); // เก็บลง state ของ App.js
        setCurrentScreen('ResetPassword'); // หรือ 'ForgotOTP' ตาม Flow ของคุณ
      }} 
    />
  );
}

  if (currentScreen === 'ResetPassword') {
    return (
      <ResetPassword 
        phoneNumber={resetPhone} // ✅ ส่งค่า resetPhone ไปที่ prop phoneNumber
        onBack={() => setCurrentScreen('ForgotPassword')} 
        onResetSuccess={() => {
          setResetPhone('');
          setCurrentScreen('Login');
        }} 
        onNext={() => { // รองรับกรณี ResetPassword เรียกใช้ onNext()
          setResetPhone('');
          setCurrentScreen('Login');
        }}
      />
    );
  }

  // --- Admin Screens ---
  if (currentScreen === 'AdminHome') {
    return (
      <AdminHomeScreen 
        onLogout={() => setCurrentScreen('Login')}
        onGoHome={navigateTo.admin}
        onGoSOS={navigateTo.manageContact} 
        onGoSearch={navigateTo.manageContact} 
        onGoProfile={navigateTo.profile}
      />
    );
  }

  if (currentScreen === 'ManageContact') {
    return (
      <ManageContactScreen 
        onGoHome={navigateTo.admin}
        onGoSOS={navigateTo.manageContact}
        onGoSearch={navigateTo.manageContact}
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
        destinationName={selectedPlace?.ชื่อ || selectedPlace?.name || "จุดหมายปลายทาง"} 
        destinationCoords={{
          latitude: selectedPlace?.พิกัด?.latitude || selectedPlace?.latitude,
          longitude: selectedPlace?.พิกัด?.longitude || selectedPlace?.longitude
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
        onGoHome={userRole === 'admin' ? navigateTo.admin : navigateTo.home}
        onGoSOS={userRole === 'admin' ? navigateTo.manageContact : navigateTo.sos}
        onGoSearch={userRole === 'admin' ? navigateTo.manageContact : navigateTo.search}
        onGoProfile={navigateTo.profile}
        onLogout={() => {
            setUserRole('');
            setUserPhone('');
            setCurrentScreen('Login');
        }} 
      />
    );
  }

  // Default: Home Screen (User)
  return (
    <HomeScreen
      currentUserPhone={userPhone}
      onGoHome={navigateTo.home}
      onGoSOS={navigateTo.sos}
      onGoSearch={navigateTo.search}
      onGoProfile={navigateTo.profile}
    />
  );
}
