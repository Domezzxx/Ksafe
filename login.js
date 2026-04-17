import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const Login = ({ onLogin, onRegister }) => {
  // สร้างกล่องความจำสำหรับเก็บเบอร์โทร รหัสผ่าน และสถานะการโชว์รหัสผ่าน
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* 💡 KeyboardAvoidingView ช่วยดันหน้าจอขึ้นเวลาคีย์บอร์ดโผล่ จะได้ไม่บังปุ่ม */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* กล่องสีขาวตรงกลาง */}
        <View style={styles.card}>
          <Text style={styles.headerText}>เข้าสู่ระบบ ที่นี่</Text>
          <Text style={styles.subText}>ยินดีต้อนรับ</Text>

          {/* ช่องใส่เบอร์โทรศัพท์ */}
          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad" // ดึงแป้นพิมพ์ตัวเลขขึ้นมา
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          {/* ช่องใส่รหัสผ่าน */}
          <Text style={styles.label}>รหัสผ่าน</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!isPasswordVisible} // ซ่อน/โชว์ รหัสผ่าน
              value={password}
              onChangeText={setPassword}
            />
            {/* ปุ่มรูปตา */}
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Feather
                name={isPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {/* ปุ่มลืมรหัสผ่าน */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน ?</Text>
          </TouchableOpacity>

          {/* ปุ่มเข้าสู่ระบบ */}
          <TouchableOpacity style={styles.primaryButton} onPress={onLogin}>
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>

          {/* ปุ่มสมัครสมาชิก */}
          <TouchableOpacity style={styles.secondaryButton} onPress={onRegister}>
            <Text style={styles.buttonText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F48E54',
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

    // 💡 เพิ่ม 3 บรรทัดนี้เข้าไปครับ
    width: '100%',         // ให้กว้างเต็มพื้นที่ที่กำหนด
    maxWidth: 400,         // ล็อคความกว้างสูงสุดไม่ให้เกิน 400px
    alignSelf: 'center',   // จัดกล่องให้อยู่กึ่งกลางหน้าจอเสมอ

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F48E54',
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 15,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#F48E54',
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

export default Login;