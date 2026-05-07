import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ✅ เพิ่ม import นี้

const WelcomeScreen = ({ onNext }) => {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.centerContent}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.titleText}>ยินดีต้อนรับเข้าสู่ Ksafe</Text>
        <Text style={styles.descriptionText}>
          แอพพลิเคชั่นรวมความช่วยเหลือฉุกเฉินไว้ในที่เดียว
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.arrowButton} onPress={onNext}>
          {/* ✅ เปลี่ยนจากรูปภาพเป็นไอคอน */}
          <Ionicons name="arrow-forward" size={28} color="#ff7843" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: { width: 200, height: 200, marginBottom: 20, maxWidth: '100%' },
  welcomeText: { fontSize: 32, fontWeight: 'bold', color: '#ff7843', marginBottom: 20 },
  titleText: { fontSize: 22, fontWeight: '600', color: '#333333', textAlign: 'center', marginBottom: 10 },
  descriptionText: { fontSize: 15, color: '#666666', textAlign: 'center', lineHeight: 24 },
  
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  arrowButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff0eb', // ✅ ปรับสีพื้นหลังให้เข้ากับธีมส้ม
    justifyContent: 'center',
    alignItems: 'center',
    // เพิ่มเงาให้ดูดีขึ้น
    shadowColor: '#ff7843',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default WelcomeScreen;
