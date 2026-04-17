import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image
} from 'react-native';

const ForgotPassword = ({ onNext, onBack }) => {
  const [phone, setPhone] = useState('');

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

            {/* เพิ่ม Margin ดันปุ่มลงไปให้ห่างจาก Input เหมือนในรูป */}
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
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
  backButton: { marginBottom: 10, alignSelf: 'flex-start' },
  backButtonText: { fontSize: 35, fontWeight: 'bold', color: '#B0B0B0', marginTop: -10 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#F48E54', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 15 },
  primaryButton: { backgroundColor: '#F48E54', borderRadius: 25, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ForgotPassword;
