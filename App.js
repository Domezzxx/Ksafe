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

// 💡 1. Import หน้า MapScreen เพิ่มเข้ามา
import MapScreen from './MapScreen'; 

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome1');
  
  // 💡 2. กล่องความจำสำหรับเก็บข้อมูลสถานที่
  const [selectedPlace, setSelectedPlace] = useState(null);

  // --- ระบบจัดการหน้าจอ (Navigation Logic) ---

  if (currentScreen === 'Welcome1') return <WelcomeScreen onNext={() => setCurrentScreen('Welcome2')} />;
  
  if (currentScreen === 'Welcome2') return <WelcomeScreen2 onNext={() => setCurrentScreen('Welcome3')} onBack={() => setCurrentScreen('Welcome1')} />;
  
  if (currentScreen === 'Welcome3') return <WelcomeScreen3 onNext={() => setCurrentScreen('Login')} onBack={() => setCurrentScreen('Welcome2')} />;
  
  if (currentScreen === 'Login') return <Login onLogin={() => setCurrentScreen('Search')} onRegister={() => setCurrentScreen('Register')} />;
  
  if (currentScreen === 'Register') return <Register onNext={() => setCurrentScreen('OTP')} onBack={() => setCurrentScreen('Login')} />;

  if (currentScreen === 'OTP') return <OtpScreen onVerify={() => setCurrentScreen('Success')} onBack={() => setCurrentScreen('Register')} />;

  if (currentScreen === 'Success') return <Success onNext={() => setCurrentScreen('Login')} />;

  // 📌 หน้าค้นหาสถานที่
  if (currentScreen === 'Search') {
    return (
      <SearchScreen 
        onBack={() => setCurrentScreen('Home')} 
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
        // 💡 เมื่อกดที่อยู่ ให้ไปหน้า Map
        onPressMap={() => setCurrentScreen('Map')} 
      />
    );
  }

  // 📌 หน้าแผนที่และการนำทาง
  if (currentScreen === 'Map') {
    return (
      <MapScreen 
        onBack={() => setCurrentScreen('Detail')} 
        destinationName={selectedPlace?.name} 
        // 💡 3. เพิ่มการส่งพิกัดตรงนี้! ดึงจาก selectedPlace ที่เลือกมา
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
        onCancel={() => setCurrentScreen('Home')} 
      />
    );
  }

  // 📌 หน้าหลัก (Home)
  return (
    <HomeScreen 
      onGoToSearch={() => setCurrentScreen('Search')}
      onGoToSOS={() => setCurrentScreen('SOS')}
    />
  );
}