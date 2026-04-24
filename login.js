import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// 💡 นำเข้า Firestore
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const Login = ({ onLogin, onRegister, onForgotPassword }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกเบอร์โทรศัพท์และรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone_number", "==", phoneNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('ผิดพลาด', 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ');
        setLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();

      if (userData.Password === password || userData.password === password) {
        // 💡 อัปเดตฟังก์ชันตามที่คุณคัดมา: ส่งทั้ง Role และ phoneNumber กลับไปที่ App.js
        onLogin(userData.role || 'user', phoneNumber);
      } else {
        Alert.alert('ผิดพลาด', 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
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
            <Text style={styles.headerText}>เข้าสู่ระบบ ที่นี่</Text>
            <Text style={styles.subText}>ยินดีต้อนรับ</Text>

            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
            />

            <Text style={styles.label}>รหัสผ่าน</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                placeholder="กรุณากรอกรหัสผ่าน"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* โครงสร้างปุ่มลืมรหัสผ่านยังคงอยู่ตามไฟล์เดิมของคุณ */}
            <TouchableOpacity style={styles.forgotPasswordContainer} onPress={onForgotPassword}>
              <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน ?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onRegister}>
              <Text style={styles.buttonText}>สร้างบัญชีใหม่</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

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
    height: '40%',
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
    elevation: 5
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#F48E54', marginBottom: 5 },
  subText: { fontSize: 16, color: '#A0A0A0', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 15,
    marginBottom: 10
  },
  passwordInput: { flex: 1, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  eyeIcon: { padding: 10 },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#F48E54',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#B0B0B0',
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

export default Login;
