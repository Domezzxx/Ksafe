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

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // ตรวจสอบรหัสผ่าน (รองรับทั้ง Password ตัวใหญ่และตัวเล็กตามที่คุณเขียนไว้)
      if (userData.Password === password || userData.password === password) {
        // --- จุดที่แก้ไข: ส่งเบอร์โทรกลับไปพร้อมกับ Role ---
        onLogin(userData.role || 'user', phoneNumber);
      } else {
        Alert.alert('ผิดพลาด', 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error("Login Error: ", error);
      Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.headerText}>ยินดีต้อนรับ</Text>
          <Text style={styles.subText}>กรุณาเข้าสู่ระบบเพื่อใช้งาน</Text>

          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={styles.input}
            placeholder="0XX-XXX-XXXX"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <Text style={styles.label}>รหัสผ่าน</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
            >
              <Feather
                name={isPasswordVisible ? 'eye' : 'eye-off'}
                size={20}
                color="#A0A0A0"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.noAccountText}>ยังไม่มีบัญชี? </Text>
            <TouchableOpacity onPress={onRegister}>
              <Text style={styles.registerText}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 150, height: 150 },
  loginCard: {
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
  forgotPasswordText: { color: '#F48E54', textAlign: 'right', marginBottom: 20, fontWeight: '500' },
  loginButton: {
    backgroundColor: '#F48E54',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center' },
  noAccountText: { color: '#A0A0A0', fontSize: 14 },
  registerText: { color: '#F48E54', fontSize: 14, fontWeight: 'bold' }
});

export default Login;