import React from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';

export default function HomeScreen({ goToSearch }) { 
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header ส่วนหัว */}
        <View style={styles.header}>
          <Text style={styles.greeting}>สวัสดี</Text>
          <Text style={styles.title}>ค้นหาความช่วยเหลือใกล้ตัวคุณ</Text>
        </View>

        {/* ปุ่มไปหน้า Search */}
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={goToSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.searchPlaceholder}>🔍 ค้นหาโรงพยาบาล หรือสถานีตำรวจ...</Text>
        </TouchableOpacity>

        {/* ส่วนเนื้อหาบริการยอดนิยม */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>บริการยอดนิยม</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.itemBox} onPress={goToSearch}>
              <Text style={styles.icon}>🏥</Text>
              <Text style={styles.itemText}>โรงพยาบาล</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.itemBox} onPress={goToSearch}>
              <Text style={styles.icon}>🚓</Text>
              <Text style={styles.itemText}>สถานีตำรวจ</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 18,
    color: '#666',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  searchButton: {
    backgroundColor: '#F5F5F5',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 30,
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemBox: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    // Shadow สำหรับ iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Shadow สำหรับ Android
    elevation: 4,
  },
  icon: {
    fontSize: 32,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333'
  }
});