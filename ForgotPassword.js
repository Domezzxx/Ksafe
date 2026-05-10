import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image, Alert
} from 'react-native';

const ForgotPassword = ({ onNext, onBack }) => {
  const [phone, setPhone] = useState('');

  // 💡 สร้างฟังก์ชันจัดการการกดปุ่มเพื่อส่งเฉพาะค่า String ออกไป
  const handleNext = () => {
    if (phone.trim().length < 10) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }
    if (onNext) onNext(phone.trim()); // ✅ ส่งเฉพาะ string ของเบอร์โทร
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
            
            <Text style={styles.headerText}>ลืมรหัสผ่าน</Text>

            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXXXXXXX"
              placeholderTextColor="#C0C0C0"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View style={{ marginTop: 20 }}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.buttonText}>ถัดไป</Text>
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
  arrowIcon: { width: 12, height: 12, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: '#B0B0B0', transform: [{ rotate: '45deg' }], marginLeft: 4 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#F48E54', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 15 },
  primaryButton: { backgroundColor: '#F48E54', borderRadius: 25, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ForgotPassword;
