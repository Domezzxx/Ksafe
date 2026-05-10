import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image,
  Alert, ActivityIndicator // ✅ เพิ่ม Alert และ ActivityIndicator
} from 'react-native';

// ✅ เพิ่ม import Firebase
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// ✅ รับ prop phoneNumber เพิ่มเข้ามา (ส่งมาจาก App.js อยู่แล้ว)
const ResetPassword = ({ onNext, onBack, onResetSuccess, phoneNumber }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!newPassword || !confirmPassword) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกรหัสผ่านให้ครบ');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      // 2. ค้นหา user จาก phone_number ใน Firestore
      const q = query(
        collection(db, 'users'),
        where('phone_number', '==', phoneNumber)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('ผิดพลาด', 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ');
        setLoading(false);
        return;
      }

      // 3. อัปเดตรหัสผ่านใหม่ลง Firestore
      const userDocId = snapshot.docs[0].id;
      await updateDoc(doc(db, 'users', userDocId), {
        password: newPassword, // ✅ บันทึกรหัสใหม่จริงๆ
      });

      Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => {
            if (onResetSuccess) onResetSuccess(); // กลับไปหน้า Login
          },
        },
      ]);
    } catch (error) {
      console.error('ResetPassword Error:', error);
      Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
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
              <View style={styles.arrowIcon} />
            </TouchableOpacity>

            <Text style={styles.headerText}>ตั้งรหัสผ่านใหม่</Text>

            <Text style={styles.label}>รหัสผ่านใหม่</Text>
            <TextInput
              style={styles.input}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              placeholderTextColor="#C0C0C0"
              secureTextEntry={true}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>ยืนยันรหัสผ่านใหม่</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              placeholderTextColor="#C0C0C0"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={{ marginTop: 20 }}>
              {/* ✅ เปลี่ยนจาก onPress={onNext} เป็น onPress={handleReset} */}
              <TouchableOpacity
                style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>ยืนยัน</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  headerImage: { position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: '50%', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  keyboardView: { flex: 1, justifyContent: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, width: '100%', maxWidth: 400, alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  backButton: { marginBottom: 10, alignSelf: 'flex-start', padding: 4, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 35, fontWeight: 'bold', color: '#B0B0B0', marginTop: -10 },
  arrowIcon: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#B0B0B0',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#F48E54', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 15 },
  primaryButton: { backgroundColor: '#F48E54', borderRadius: 25, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ResetPassword;
