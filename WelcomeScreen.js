import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

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


      <TouchableOpacity style={styles.arrowButton} onPress={onNext}>
        <Text style={{ fontSize: 35, fontWeight: 'bold', marginTop: -12 }}>→</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1, // กินพื้นที่ที่เหลือทั้งหมด
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff7843',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    // lineHeight: 24, 
  },
  arrowButton: {
    position: 'absolute',
    bottom: 25,
    right: 30,
    width: 60,
    height: 50,
    borderRadius: 40,
    backgroundColor: '#f3ece5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 20,
    height: 25,
    tintColor: '#000000',
  },
});

export default WelcomeScreen;
