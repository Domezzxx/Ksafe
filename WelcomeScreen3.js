import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ✅ เพิ่ม import นี้

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
        <TouchableOpacity style={styles.arrowButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={28} color="#ff7843" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.arrowButton} onPress={onNext}>
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
    backgroundColor: '#fff0eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff7843',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default WelcomeScreen3;
