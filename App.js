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
import ManageContactScreen from './ManageContactScreen';
import ManageFacilitiesScreen from './ManageFacilitiesScreen'; 
import ManageUserScreen from './ManageUserScreen'; 

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
    manageFacilities: () => setCurrentScreen('ManageFacilities'),
    manageUser: () => setCurrentScreen('ManageUser'), 
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
          if (role === 'admin') navigateTo.admin();
          else navigateTo.home();
        }} 
        onRegister={() => setCurrentScreen('Register')} 
        onForgotPassword={() => setCurrentScreen('ForgotPassword')} 
      />
    );
  }
  
  if (currentScreen === 'Register') {
    return <Register onBack={() => setCurrentScreen('Login')} onNext={(data) => { setTempUserData(data); setCurrentScreen('Otp'); }} />;
  }

  if (currentScreen === 'Otp') {
    return <OtpScreen userData={tempUserData} onBack={() => setCurrentScreen('Login')} onVerifySuccess={() => setCurrentScreen('Success')} />;
  }

  if (currentScreen === 'Success') return <Success onNext={() => setCurrentScreen('Login')} />;

  // 💡 --- ลืมรหัสผ่าน (แก้ไขเฉพาะส่วนนี้) ---
  if (currentScreen === 'ForgotPassword') {
    return (
      <ForgotPassword 
        onBack={() => setCurrentScreen('Login')} 
        onNext={(phoneNumber) => { 
          setResetPhone(phoneNumber); 
          setCurrentScreen('ForgotOtp'); // 💡 แก้ไขให้วิ่งไปหน้า ForgotOtp
        }} 
      />
    );
  }

  // 💡 เพิ่มสถานะหน้า ForgotOtp ขึ้นมาคั่น
  if (currentScreen === 'ForgotOtp') {
    return (
      <OtpScreen 
        userData={{ phone: resetPhone }} 
        onBack={() => setCurrentScreen('ForgotPassword')} 
        onVerifySuccess={() => setCurrentScreen('ResetPassword')} // 💡 ยืนยัน OTP เสร็จค่อยไปตั้งรหัสผ่านใหม่
      />
    );
  }

  if (currentScreen === 'ResetPassword') {
    return (
      <ResetPassword 
        phoneNumber={resetPhone} 
        onBack={() => setCurrentScreen('ForgotOtp')} // 💡 เวลากดกลับให้ไปหน้า ForgotOtp
        onResetSuccess={() => { setResetPhone(''); setCurrentScreen('Login'); }} 
        onNext={() => { setResetPhone(''); setCurrentScreen('Login'); }}
      />
    );
  }
  // ----------------------------------------

  // --- Admin Screens ---
  if (currentScreen === 'AdminHome') {
    return <AdminHomeScreen onLogout={() => setCurrentScreen('Login')} onGoHome={navigateTo.admin} onGoSOS={navigateTo.manageContact} onGoSearch={navigateTo.manageFacilities} onGoProfile={navigateTo.profile} onManageFacilities={navigateTo.manageFacilities} />;
  }

  if (currentScreen === 'ManageContact') {
    return <ManageContactScreen onGoHome={navigateTo.admin} onGoSOS={navigateTo.manageContact} onGoSearch={navigateTo.manageFacilities} onGoProfile={navigateTo.manageUser} />;
  }

  if (currentScreen === 'ManageFacilities') {
    return <ManageFacilitiesScreen onGoHome={navigateTo.admin} onGoSOS={navigateTo.manageContact} onGoSearch={navigateTo.manageFacilities} onGoProfile={navigateTo.manageUser} />;
  }

  if (currentScreen === 'ManageUser') {
    return <ManageUserScreen onGoHome={navigateTo.admin} onGoSOS={navigateTo.manageContact} onGoSearch={navigateTo.manageContact} onGoProfile={navigateTo.manageUser} />;
  }

  // --- Main App Screens ---
  if (currentScreen === 'Search') {
    return <SearchScreen 
    onBack={navigateTo.home} currentUserPhone={userPhone}
      onGoHome={navigateTo.home}
      onGoSOS={navigateTo.sos}
      onGoSearch={navigateTo.search}
      onGoProfile={navigateTo.profile} 
    goToDetail={(placeData) => { setSelectedPlace(placeData); setCurrentScreen('Detail'); }} />;
  }

  if (currentScreen === 'Detail') {
    return <DetailScreen data={selectedPlace} onBack={() => setCurrentScreen('Search')} onPressMap={() => setCurrentScreen('Map')} />;
  }

  if (currentScreen === 'Map') {
    return (
      <MapScreen 
        onBack={() => setCurrentScreen('Detail')} 
        destinationName={selectedPlace?.ชื่อ || selectedPlace?.name || "จุดหมายปลายทาง"} 
        destinationCoords={selectedPlace?.พิกัด || { latitude: selectedPlace?.latitude, longitude: selectedPlace?.longitude }}
      />
    );
  }

  if (currentScreen === 'SOS') {
    return <SosScreen onCancel={navigateTo.home} onGoHome={navigateTo.home} onGoSearch={navigateTo.search} onGoProfile={navigateTo.profile} />;
  }

  if (currentScreen === 'Profile') {
    return (
      <ProfileScreen 
        onGoHome={userRole === 'admin' ? navigateTo.admin : navigateTo.home}
        onGoSOS={userRole === 'admin' ? navigateTo.manageContact : navigateTo.sos}
        onGoSearch={userRole === 'admin' ? navigateTo.manageContact : navigateTo.search}
        onGoProfile={navigateTo.profile}
        onLogout={() => { setUserRole(''); setUserPhone(''); setCurrentScreen('Login'); }} 
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
} // <--- ปีกกาปิดฟังก์ชัน App ต้องอยู่บรรทัดสุดท้าย
