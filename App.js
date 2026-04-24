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
  const [resetPhone, setResetPhone] = useState('');
  const [userRole, setUserRole] = useState('');

  // เก็บเบอร์โทรของ user ที่ล็อกอิน
  const [userPhone, setUserPhone] = useState('');

  const navigateTo = {
    home: () => setCurrentScreen('Home'),
    sos: () => setCurrentScreen('SOS'),
    search: () => setCurrentScreen('Search'),
    profile: () => setCurrentScreen('Profile'),
    admin: () => setCurrentScreen('AdminHome'),
  };

  // --- Welcome Screens ---
  if (currentScreen === 'Welcome1') return <WelcomeScreen onNext={() => setCurrentScreen('Welcome2')} />;
  if (currentScreen === 'Welcome2') return <WelcomeScreen2 onNext={() => setCurrentScreen('Welcome3')} />;
  if (currentScreen === 'Welcome3') return <WelcomeScreen3 onNext={() => setCurrentScreen('Login')} />;

  if (currentScreen === 'Login') {
    return (
      <Login
        onLogin={(role, phone) => {
          setUserRole(role);
          setUserPhone(phone);
          setCurrentScreen('Home');
        }}
        onRegister={() => setCurrentScreen('Register')}
        onForgotPassword={() => setCurrentScreen('ForgotPassword')}
      />
    );
  }

  // Register → ส่ง data (name, phone, password, uid) ต่อไปให้ OTP
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

  // OTP → รับ userData (เพื่อแสดงเบอร์โทร) + ปุ่มย้อนกลับไปหน้า Login
  if (currentScreen === 'Otp') {
    return (
      <OtpScreen
        userData={tempUserData}
        onBack={() => setCurrentScreen('Login')}
        onVerifySuccess={() => setCurrentScreen('Success')}
      />
    );
  }

  // Success → ใช้ prop "onNext" ให้ตรงกับ Success.js
  if (currentScreen === 'Success') return <Success onNext={() => setCurrentScreen('Login')} />;

  if (currentScreen === 'ForgotPassword') return <ForgotPassword onBack={() => setCurrentScreen('Login')} onSendOtp={(phone) => { setResetPhone(phone); setCurrentScreen('ResetPassword'); }} />;
  if (currentScreen === 'ResetPassword') return <ResetPassword phoneNumber={resetPhone} onBack={() => setCurrentScreen('ForgotPassword')} onResetSuccess={() => setCurrentScreen('Login')} />;

  // ✅ Search → เพิ่ม onBack ให้กลับไปหน้า Home ได้
  if (currentScreen === 'Search') {
    return (
      <SearchScreen
        onBack={() => setCurrentScreen('Home')}
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
        destinationName={selectedPlace?.name}
        destinationCoords={{
          latitude: selectedPlace?.latitude,
          longitude: selectedPlace?.longitude
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

  // Default: HomeScreen
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
