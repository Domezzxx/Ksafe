import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';

export default function OtpScreen({ onVerify, onBack }) {
  // สร้าง State สำหรับเก็บค่า OTP ทั้ง 4 ช่อง
  const [otp, setOtp] = useState(['', '', '', '']);
  
  // ใช้ useRef เพื่ออ้างอิงถึงกล่อง TextInput แต่ละอัน (เอาไว้สั่งให้โฟกัสอัตโนมัติ)
  const inputs = useRef([]);

  // ฟังก์ชันจัดการเมื่อพิมพ์ตัวเลข
  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // ถ้าพิมพ์ตัวเลขลงไป แล้วยังไม่ใช่กล่องสุดท้าย ให้เด้งไปกล่องถัดไป
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  // ฟังก์ชันจัดการเมื่อกดปุ่มลบ (Backspace)
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // ถ้ากล่องปัจจุบันว่างเปล่าและกดลบ ให้เด้งกลับไปกล่องก่อนหน้า
      inputs.current[index - 1].focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.centerContent}
      >
        <View style={styles.card}>
          
          {/* ปุ่มย้อนกลับ */}
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* ข้อความส่วนหัว */}
          <Text style={styles.title}>ยืนยันรหัส OTP</Text>
          <Text style={styles.subtitle}>
            เราได้ส่งรหัส OTP ไปยังโทรศัพท์ของ{'\n'}คุณเรียบร้อยแล้ว
          </Text>

          {/* ส่งรหัสอีกครั้ง */}
          <TouchableOpacity style={styles.resendContainer}>
            <Text style={styles.resendText}>ส่งรหัสอีกครั้ง</Text>
          </TouchableOpacity>

          {/* กล่องกรอก OTP 4 ช่อง */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => inputs.current[index] = ref} // เก็บ ref ของกล่องนี้ไว้
                style={[
                  styles.otpBox, 
                  { borderColor: digit !== '' ? '#FF7843' : '#ddd' } // ถ้ามีตัวเลขให้ขอบสีส้ม
                ]}
                keyboardType="number-pad"
                maxLength={1} // พิมพ์ได้ช่องละ 1 ตัว
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {/* ✅ ปุ่มยืนยัน */}
          <TouchableOpacity style={styles.verifyButton} onPress={onVerify}>
            <Text style={styles.verifyButtonText}>ยืนยัน</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F48E54', // สีพื้นหลัง (ปรับตามต้องการได้)
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400, // ล็อคขนาดไม่ให้ยืดเต็มจอ
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  bbackButton: {
    marginBottom: 10,
    alignSelf: 'flex-start', 
  },
  backButtonText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#B0B0B0', 
    marginTop: -10
  },
  backIcon: {
    fontSize: 28,
    color: '#B0B0B0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7843', // สีส้มตามดีไซน์
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
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
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#fff',
  },
  verifyButton: {
    backgroundColor: '#FF7843',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});