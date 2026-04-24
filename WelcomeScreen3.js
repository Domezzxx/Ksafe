import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const WelcomeScreen3 = ({ onNext, onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.centerContent}>
        <Image
          source={require('./assets/logo3.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.titleText}>ข้อมูลติดต่อฉุกเฉิน</Text>
        <Text style={styles.descriptionText}>
          เพิ่มข้อมูลติดต่อฉุกเฉินไว้ในแอพของเรา หากเกิดอะไรขึ้นมาผู้ช่วยเหลือของคุณก็ยังมีข้อมูลติดต่อกับคนที่ใกล้ชิดของคุณได้
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        {/* ปุ่มกลับ */}
        <TouchableOpacity style={styles.arrowButton} onPress={onBack}>
          {/* 💡 รูปภาพลูกศรชี้ซ้าย */}
          <Image 
            source={require('./assets/j.jpg')} 
            style={styles.iconImage} 
          />
        </TouchableOpacity>

        {/* ปุ่มถัดไป */}
        <TouchableOpacity style={styles.arrowButton} onPress={onNext}>
          {/* 💡 รูปภาพลูกศรชี้ขวา */}
          <Image 
            source={require('./assets/t.jpg')} 
            style={styles.iconImage} 
          />
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
  logo: { width: 220, height: 220, marginBottom: 30, maxWidth: '100%' },
  titleText: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  descriptionText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 24 },
  
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  arrowButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3ece5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  }
});

export default WelcomeScreen3;
