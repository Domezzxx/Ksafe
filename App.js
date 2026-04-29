import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// --- Import ทุกหน้าจอของคุณ ---
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
import IncidentSortingScreen from './IncidentSortingScreen';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('Welcome1');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [tempUserData, setTempUserData] = useState(null);
  const [resetPhone, setResetPhone] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('');

  // ✅ เก็บสถานะการกรองสี (Filter) สำหรับ Admin
  const [filterType, setFilterType] = useState('all');

  // ✅ เก็บเบอร์ฉุกเฉินที่ User เลือกไว้
  const [emergencyContact, setEmergencyContact] = useState({
    name: 'สถานีตำรวจ',
    phone: '191',
  });

  const navigateTo = {
    home: () => setCurrentScreen('Home'),
    sos: () => setCurrentScreen('SOS'),
    search: () => setCurrentScreen('Search'),
    profile: () => setCurrentScreen('Profile'),
    admin: () => setCurrentScreen('AdminHome'),
    manageContact: () => setCurrentScreen('ManageContact'),
    manageFacilities: () => setCurrentScreen('ManageFacilities'),
    manageUser: () => setCurrentScreen('ManageUser'),
    // ✅ ฟังก์ชันเปลี่ยนหน้า Sorting และจำค่าสีที่กดมา
    incidentSorting: (type) => {
      setFilterType(type || 'all');
      setCurrentScreen('IncidentSorting');
    },
  };

  // --- เช็คการแสดงผลหน้าจอ (Screen Switcher) ---

  // 1. Welcome Flow
  if (currentScreen === 'Welcome1') return <WelcomeScreen onNext={() => setCurrentScreen('Welcome2')} />;
  if (currentScreen === 'Welcome2') return <WelcomeScreen2 onNext={() => setCurrentScreen('Welcome3')} onBack={() => setCurrentScreen('Welcome1')} />;
  if (currentScreen === 'Welcome3') return <WelcomeScreen3 onNext={() => setCurrentScreen('Login')} onBack={() => setCurrentScreen('Welcome2')} />;

  // 2. Auth Flow
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
  if (currentScreen === 'Register') return <Register onBack={() => setCurrentScreen('Login')} onNext={(data) => { setTempUserData(data); setCurrentScreen('Otp'); }} />;
  if (currentScreen === 'Otp') return <OtpScreen userData={tempUserData} onBack={() => setCurrentScreen('Register')} onVerifySuccess={() => setCurrentScreen('Success')} />;
  if (currentScreen === 'Success') return <Success onNext={() => setCurrentScreen('Login')} />;

  // 3. Forgot Password Flow
  if (currentScreen === 'ForgotPassword') return <ForgotPassword onBack={() => setCurrentScreen('Login')} onNext={(phone) => { setResetPhone(phone); setCurrentScreen('ForgotOtp'); }} />;
  if (currentScreen === 'ForgotOtp') return <OtpScreen userData={{ phone: resetPhone }} onBack={() => setCurrentScreen('ForgotPassword')} onVerifySuccess={() => setCurrentScreen('ResetPassword')} />;
  if (currentScreen === 'ResetPassword') return <ResetPassword phoneNumber={resetPhone} onBack={() => setCurrentScreen('ForgotOtp')} onResetSuccess={() => { setResetPhone(''); setCurrentScreen('Login'); }} onNext={() => { setResetPhone(''); setCurrentScreen('Login'); }} />;

  // 4. Admin Screens
  if (currentScreen === 'IncidentSorting') {
    return (
      <IncidentSortingScreen
        filter={filterType}
        onBack={navigateTo.admin}
      />
    );
  }

  if (currentScreen === 'AdminHome') {
    return (
      <AdminHomeScreen
        onLogout={() => { setUserRole(''); setUserPhone(''); setCurrentScreen('Login'); }}
        onGoHome={navigateTo.admin}
        onGoSOS={navigateTo.manageContact}
        onGoSearch={navigateTo.manageFacilities}
        onGoProfile={navigateTo.manageUser}
        onGoToSorting={navigateTo.incidentSorting}
      />
    );
  }

  if (currentScreen === 'ManageContact') return <ManageContactScreen onGoHome={navigateTo.admin} onGoSOS={navigateTo.manageContact} onGoSearch={navigateTo.manageFacilities} onGoProfile={navigateTo.manageUser} />;
  if (currentScreen === 'ManageFacilities') return <ManageFacilitiesScreen onGoHome={navigateTo.admin} onGoSOS={navigateTo.manageContact} onGoSearch={navigateTo.manageFacilities} onGoProfile={navigateTo.manageUser} />;
  if (currentScreen === 'ManageUser') return <ManageUserScreen onGoHome={navigateTo.admin} onGoSOS={navigateTo.manageContact} onGoSearch={navigateTo.manageFacilities} onGoProfile={navigateTo.manageUser} />;

  // 5. User Screens
  if (currentScreen === 'Search') return <SearchScreen onBack={navigateTo.home} currentUserPhone={userPhone} onGoHome={navigateTo.home} onGoSOS={navigateTo.sos} onGoSearch={navigateTo.search} onGoProfile={navigateTo.profile} goToDetail={(p) => { setSelectedPlace(p); setCurrentScreen('Detail'); }} />;
  if (currentScreen === 'Detail') return <DetailScreen data={selectedPlace} onBack={() => setCurrentScreen('Search')} onPressMap={() => setCurrentScreen('Map')} />;
  if (currentScreen === 'Map') return <MapScreen onBack={() => setCurrentScreen('Detail')} destinationName={selectedPlace?.ชื่อ || "จุดหมาย"} destinationCoords={selectedPlace?.พิกัด || { latitude: selectedPlace?.latitude, longitude: selectedPlace?.longitude }} />;

  // ✅ รวม SOS Screen: ส่งทั้งเบอร์ที่เลือก (emergencyContact) และเบอร์ผู้ใช้ (userPhone)
  if (currentScreen === 'SOS') return (
    <SosScreen
      emergencyContact={emergencyContact}
      currentUserPhone={userPhone}
      onCancel={navigateTo.home}
      onGoHome={navigateTo.home}
      onGoSearch={navigateTo.search}
      onGoProfile={navigateTo.profile}
    />
  );

  // ✅ รวม Profile Screen: ส่ง onUpdateContact เพื่อให้เปลี่ยนเบอร์ฉุกเฉินได้
  if (currentScreen === 'Profile') return (
    <ProfileScreen
      currentUserPhone={userPhone}
      onUpdateContact={(contact) => setEmergencyContact(contact)}
      onGoHome={userRole === 'admin' ? navigateTo.admin : navigateTo.home}
      onGoSOS={userRole === 'admin' ? navigateTo.manageContact : navigateTo.sos}
      onGoSearch={userRole === 'admin' ? navigateTo.manageFacilities : navigateTo.search}
      onGoProfile={navigateTo.profile}
      onLogout={() => { setUserRole(''); setUserPhone(''); setCurrentScreen('Login'); }}
    />
  );

  // Default Screen
  return <HomeScreen currentUserPhone={userPhone} onGoHome={navigateTo.home} onGoSOS={navigateTo.sos} onGoSearch={navigateTo.search} onGoProfile={navigateTo.profile} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}