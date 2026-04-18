import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image,
  Alert, ActivityIndicator
} from 'react-native';

import { db } from './firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

const ResetPassword = ({ onNext, onBack, phone }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // 💡 ป้องกัน Error "Unsupported field value: a custom Class object"
    if (typeof phone !== 'string' || !phone) {
      Alert.alert('ผิดพลาด', 'ข้อมูลเบอร์โทรศัพท์ไม่ถูกต้อง กรุณาเริ่มทำรายการใหม่');
      if (onBack) onBack();
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      // 💡 Query โดยใช้เบอร์โทรศัพท์ที่ได้รับมาจากหน้าก่อนหน้า
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone_number", "==", phone.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('ผิดพลาด', 'ไม่พบข้อมูลผู้ใช้ในระบบ');
        setLoading(false);
        return;
      }

      // อัปเดตรหัสผ่านใหม่ลงในฟิลด์ "Password" (P ตัวใหญ่ตามโครงสร้างของคุณ)
      const userDoc = querySnapshot.docs[0];
      const userDocRef = doc(db, "users", userDoc.id);

      await updateDoc(userDocRef, {
        Password: newPassword 
      });

      Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => onNext && onNext() }
      ]);

    } catch (error) {
      console.error("Reset Password Error: ", error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
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
            
            <Text style={styles.headerText}>ตั้งรหัสผ่านใหม่</Text>

            <Text style={styles.label}>รหัสผ่านใหม่</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXXXXXXX"
              placeholderTextColor="#C0C0C0"
              secureTextEntry={true}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>ยืนยันรหัสผ่านใหม่</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXXXXXXX"
              placeholderTextColor="#C0C0C0"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={{ marginTop: 20 }}>
              <TouchableOpacity 
                style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]} 
                onPress={handleResetPassword}
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
  backButton: { marginBottom: 10, alignSelf: 'flex-start' },
  backButtonText: { fontSize: 35, fontWeight: 'bold', color: '#B0B0B0', marginTop: -10 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#F48E54', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 15 },
  primaryButton: { backgroundColor: '#F48E54', borderRadius: 25, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ResetPassword;
