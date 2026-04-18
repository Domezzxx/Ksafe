import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image,
  Alert, ActivityIndicator // 💡 เพิ่ม Alert และ ActivityIndicator
} from 'react-native';

// 💡 เพิ่มการนำเข้า Firebase
import { db } from './firebaseConfig';
import { 
    doc, runTransaction, Timestamp, collection, getDocs, query, orderBy, limit 
} from 'firebase/firestore';

export default function OtpScreen({ onVerify, onBack, userData }) { // 💡 รับ userData เพิ่ม
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false); // 💡 สถานะโหลด
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // 💡 ฟังก์ชันจัดการการยืนยันและบันทึกข้อมูล
  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกรหัส OTP ให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      // 1. หาเลข ID ล่าสุดจากตาราง users
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("user_id", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      
      let lastId = 0;
      if (!querySnapshot.empty) {
        lastId = querySnapshot.docs[0].data().user_id;
      }
      
      const newId = lastId + 1;
      const userIdString = String(newId);

      // 2. ใช้ Transaction บันทึกข้อมูลที่ส่งมาจากหน้า Register
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", userIdString);
        
        transaction.set(userRef, {
          user_id: newId, 
          first_name: userData?.name || "Unknown",
          last_name: "",         
          phone_number: userData?.phone || "",
          Password: userData?.password || "",
          role: 'user',
          birth_date: Timestamp.fromDate(new Date(1990, 11, 31)), 
          blood_type: "",        
          chronic_diseases: "",  
          gender: "",            
          height: "",            
          weight: "",            
          is_organ_donor: false,
          is_verified: true, // ยืนยันผ่าน OTP แล้ว
          created_at: Timestamp.now()
        });
      });

      Alert.alert('สำเร็จ', 'ยืนยันรหัสและสร้างบัญชีเรียบร้อยแล้ว');
      if (onVerify) onVerify(); 

    } catch (error) {
      console.error("OTP Verification Error: ", error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Image 
        source={require('./assets/bg.png')} 
        style={styles.headerImage}
        resizeMode="cover"
      />

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
              เราได้ส่งรหัส OTP ไปยังโทรศัพท์ของ{'\n'}
              {userData?.phone || 'คุณ'} เรียบร้อยแล้ว
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
              style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>ยืนยัน</Text>
              )}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
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
    width: 60,
    height: 60,
    borderWidth: 1,
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 24,
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
