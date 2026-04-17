import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons'; // 💡 ใช้สำหรับไอคอนเครื่องหมายถูก

const Success = ({ onNext }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        
        {/* ไอคอนเครื่องหมายถูกในวงกลม */}
        <View style={styles.iconContainer}>
          <Feather name="check" size={40} color="#F48E54" />
        </View>

        {/* ข้อความแสดงสำเร็จ */}
        <Text style={styles.headerText}>เสร็จสิ้น !</Text>
        <Text style={styles.subText}>
          ยินดีด้วย! คุณยืนยันตัวตน{'\n'}สำเร็จแล้ว
        </Text>

        {/* ปุ่มดำเนินการต่อ */}
        <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.buttonText}>ดำเนินการต่อ</Text>
        </TouchableOpacity>

      </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30, 
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40, 
    borderWidth: 2, 
    borderColor: '#F48E54', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center', 
    lineHeight: 24, 
    marginBottom: 30, 
  },
  primaryButton: {
    backgroundColor: '#F48E54',
    borderRadius: 25,
    paddingVertical: 15,
    width: '100%', 
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Success;