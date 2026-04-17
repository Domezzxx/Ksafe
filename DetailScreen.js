import React from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ScrollView, StyleSheet, Dimensions, SafeAreaView, StatusBar
} from 'react-native';

const { width } = Dimensions.get('window');

// 1. นำเข้ารูปภาพจากโฟลเดอร์ assets (สมมติว่าชื่อไฟล์คือ hospital.jpg)
// หมายเหตุ: เช็คชื่อไฟล์และนามสกุลให้ตรงเป๊ะๆ นะครับ
const hospitalImage = require('./assets/sut.jpg');

export default function DetailScreen({ data, onBack , onPressMap}) {
   // ดึงข้อมูลจาก data ที่ส่งมาจากหน้า Search
  const name = data?.name || "ไม่ระบุชื่อ";
  const address = data?.address || "ไม่ระบุที่อยู่";
  const status = data?.status || "เปิดอยู่";
  const distance = data?.distance || "0 กม.";

  const days = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          {/* 2. เปลี่ยน source มาใช้ตัวแปรที่เรา require ไว้ด้านบน */}
          <Image
            source={hospitalImage}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>{status}</Text>
            <Text style={styles.distanceText}> | {distance}</Text>
          </View>

          <Text style={styles.title}>{name}</Text>

          <Text style={styles.sectionTitle}>เวลาทำการ</Text>
          {days.map((day) => (
            <View key={day} style={styles.timeRow}>
              <Text style={styles.dayLabel}>{day}</Text>
              <Text style={styles.timeLabel}>00:00 - 23.59 น.</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>ที่อยู่</Text>
          <TouchableOpacity onPress={onPressMap}>
            <Text style={styles.linkText}>{address}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>เบอร์โทรศัพท์</Text>
          <TouchableOpacity>
          <Text style={styles.linkText}>{data?.phone || "044 xxx xxx"}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageWrapper: { width: width, height: 300 },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, padding: 10 },
  backIcon: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: -10
  },
  contentContainer: { paddingHorizontal: 20, paddingTop: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  statusText: { color: '#28a745', fontWeight: '600', fontSize: 16 },
  distanceText: { color: '#666', fontSize: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', lineHeight: 28, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 10 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dayLabel: { fontSize: 15, color: '#444', width: 100 },
  timeLabel: { fontSize: 15, color: '#444', flex: 1 },
  linkText: { color: '#0c4edd', fontSize: 15, lineHeight: 22 },
});
