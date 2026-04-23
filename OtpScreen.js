import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image
} from 'react-native';

export default function OtpScreen({ onVerify, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const inputs = useRef([]);
  
  // --- ส่วนที่เพิ่มใหม่สำหรับโหมดจำลอง In-app Notification ---
  const [showNotif, setShowNotif] = useState(false);
  const [mockOtpCode, setMockOtpCode] = useState('');

  // สุ่มรหัส OTP 6 หลักทันทีที่เปิดหน้านี้ขึ้นมา
  useEffect(() => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtpCode(randomOtp);
  }, []);
  // ----------------------------------------------------

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Image 
        source={require('./assets/bg.png')} 
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* 🔔 ไอคอนแจ้งเตือนมุมขวาบน */}
      <TouchableOpacity style={styles.notifButton} onPress={() => setShowNotif(!showNotif)}>
        <Text style={styles.notifIconText}>🔔</Text>
        <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>1</Text>
        </View>
      </TouchableOpacity>

      {/* 📩 กล่องข้อความแจ้งเตือน (จะโชว์เมื่อกดกระดิ่ง) */}
      {showNotif && (
        <View style={styles.notifPopup}>
            <Text style={styles.notifTitle}>ระบบ Ksafe</Text>
            <Text style={styles.notifMessage}>
                รหัส OTP ของคุณคือ: <Text style={styles.notifHighlight}>{mockOtpCode}</Text>
            </Text>
        </View>
      )}

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <View style={styles.card}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>ยืนยันรหัส OTP</Text>
            <Text style={styles.subText}>
              เราได้ส่งรหัส OTP ไปยังโทรศัพท์ของ{'\n'}คุณเรียบร้อยแล้ว
            </Text>

            <TouchableOpacity style={styles.resendContainer}>
              <Text style={styles.resendText}>ส่งรหัสอีกครั้ง</Text>
            </TouchableOpacity>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => inputs.current[index] = ref}
                  style={[
                    styles.otpBox, 
                    { borderColor: digit !== '' ? '#F48E54' : '#DDDDDD' }
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={onVerify} // กดแล้วเปลี่ยนหน้าทันทีตามที่เขียนไว้ใน App.js
            >
              <Text style={styles.buttonText}>ยืนยัน</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '50%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  
  // --- สไตล์สำหรับ Notification ---
  notifButton: {
    position: 'absolute',
    top: 50, // ปรับระยะห่างจากขอบจอด้านบน
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  notifIconText: {
    fontSize: 24,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notifPopup: {
    position: 'absolute',
    top: 105,
    right: 20,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F48E54',
  },
  notifTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
    marginBottom: 5,
  },
  notifMessage: {
    color: '#666',
    fontSize: 13,
  },
  notifHighlight: {
    fontWeight: 'bold',
    color: '#F48E54',
    fontSize: 16,
  },
  // ------------------------------

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15, 
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20, 
    width: '100%',         
    maxWidth: 400,         
    alignSelf: 'center',   
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    marginBottom: 10,
    alignSelf: 'flex-start', 
  },
  backButtonText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#B0B0B0', 
    marginTop: -10
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F48E54',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#A0A0A0',
    lineHeight: 24,
    marginBottom: 25,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpBox: {
    width: 45, 
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#F48E54',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
