import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const hospitalImage = require('./assets/sut.jpg'); 

export default function DetailScreen({ data, onBack, onPressMap }) {
  // ดึงข้อมูลจาก data ที่ส่งมาจากหน้า Search
  const name = data?.name || "ไม่ระบุชื่อ";
  const address = data?.address || "ไม่ระบุที่อยู่";
  const status = data?.status || "เปิดอยู่";
  const distance = data?.distance || "0 กม.";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={hospitalImage} style={styles.headerImage} resizeMode="cover" />
        <View style={styles.contentContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>{status}</Text>
            <Text style={styles.distanceText}> | {distance}</Text>
          </View>
          <Text style={styles.title}>{name}</Text>
          
          <Text style={styles.sectionTitle}>ที่อยู่</Text>
          <TouchableOpacity onPress={onPressMap}>
            <Text style={styles.linkText}>{address}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>เบอร์โทรศัพท์</Text>
          <Text style={styles.linkText}>{data?.phone || "044 xxx xxx"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerImage: { width: width, height: 300 },
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, padding: 10 },
  backIcon: { fontSize: 28, color: '#999' },
  contentContainer: { padding: 20 },
  statusRow: { flexDirection: 'row', marginBottom: 5 },
  statusText: { color: '#28a745', fontWeight: 'bold' },
  distanceText: { color: '#666' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  linkText: { color: '#3897f0', fontSize: 15, lineHeight: 22 }
});