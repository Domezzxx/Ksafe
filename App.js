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

  // เพิ่ม state เก็บเบอร์โทร
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
          setUserPhone(phone); // เก็บเบอร์โทร
          setCurrentScreen('Home');
        }}
        onRegister={() => setCurrentScreen('Register')}
        onForgotPassword={() => setCurrentScreen('ForgotPassword')}
      />
    );
  }

  if (currentScreen === 'Register') return <Register onBack={() => setCurrentScreen('Login')} onRegisterSuccess={() => setCurrentScreen('Otp')} />;
  if (currentScreen === 'Otp') return <OtpScreen onVerifySuccess={() => setCurrentScreen('Success')} />;
  if (currentScreen === 'Success') return <Success onContinue={() => setCurrentScreen('Login')} />;
  if (currentScreen === 'ForgotPassword') return <ForgotPassword onBack={() => setCurrentScreen('Login')} onSendOtp={(phone) => { setResetPhone(phone); setCurrentScreen('ResetPassword'); }} />;
  if (currentScreen === 'ResetPassword') return <ResetPassword phoneNumber={resetPhone} onBack={() => setCurrentScreen('ForgotPassword')} onResetSuccess={() => setCurrentScreen('Login')} />;

  if (currentScreen === 'Search') {
    return (
      <SearchScreen
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

  // ส่ง currentUserPhone ไปที่ HomeScreen
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