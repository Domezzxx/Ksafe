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

// ✅ เปลี่ยนมาใช้ Firebase Auth แทนการ query Firestore เอง
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

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
      // 1. สร้าง fake email ให้ตรงกับที่ Register.js ใช้ตอนสมัคร
      const fakeEmail = `${phoneNumber}@ksafe.app`;

      // 2. ให้ Firebase Auth ตรวจสอบเบอร์+รหัสผ่าน
      //    ถ้าถูกต้อง Firebase จะจำไว้ว่าใครล็อกอินอยู่ (auth.currentUser)
      const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;

      // 3. ไปดึง role จาก Firestore (เพื่อเช็คว่าเป็น user หรือ admin)
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      let role = 'user';
      if (docSnap.exists()) {
        role = docSnap.data().role || 'user';
      }

      // 4. ส่ง role และเบอร์กลับไปให้ App.js
      onLogin(role, phoneNumber);

    } catch (error) {
      console.error("Login Error:", error);

      // แสดง error ให้เข้าใจง่าย
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password'
      ) {
        Alert.alert('ผิดพลาด', 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('ผิดพลาด', 'รูปแบบเบอร์โทรไม่ถูกต้อง');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('แจ้งเตือน', 'ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่');
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่');
      }
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
