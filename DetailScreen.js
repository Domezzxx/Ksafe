import React from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ScrollView, StyleSheet, Dimensions, StatusBar, Linking, Platform
} from 'react-native';

const { width } = Dimensions.get('window');

// 💡 1. สร้าง Image Map เพื่อจับคู่ชื่อสถานที่กับไฟล์รูปใน Assets
// ตรวจสอบชื่อสถานที่ให้ตรงกับใน Firebase เป๊ะๆ นะครับ
const locationImages = {
  // หมวดโรงพยาบาล
  "โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี": require('./assets/sut.jpg'),
  "PCU-SUT (ศูนย์แพทย์ชุมชน)": require('./assets/pcu.png'),
  "โรงพยาบาลราชสีมา ฮอสพิทอล": require('./assets/ratchasimahospital.png'),
  "โรงพยาบาลกรุงเทพนครราชสีมา": require('./assets/kungthep.png'),
  "โรงพยาบาลริมลิฟวิ่ง": require('./assets/rim.png'),
  "โรงพยาบาลค่ายสุรนารี": require('./assets/suranareecamp.jpg'),

  // หมวดสถานีตำรวจ
  "สถานีตำรวจภูธรโพธิ์กลาง": require('./assets/poograng.png'),
  "สถานีตำรวจภูธรเมืองนครราชสีมา": require('./assets/police.png'),

  // หมวดกู้ภัย/ดับเพลิง
  "ศูนย์กู้ภัยฮุก 31": require('./assets/hook31.png'),
  "ชมรมจิตอาสาแสดทอง": require('./assets/sadthong.png'),
  "การไฟฟ้าส่วนภูมิภาคเขต 3": require('./assets/pea_korat.png'),
  "สำนักงานกรมทางหลวงที่ 10": require('./assets/highway10.png'),
  "สถานีดับเพลิงสุรนารายณ์": require('./assets/fire_suranarai.png'),
  "ดับเพลิงจอมสุรางค์": require('./assets/fire_chomsurang.png'),
  "ศูนย์ป้องกันและบรรเทาสาธารณภัย เขต 5": require('./assets/disaster_prevent5.png'),
};

// รูปสำรองกรณีหาชื่อสถานที่ใน Map ไม่เจอ
const defaultImage = require('./assets/sut.jpg'); 

export default function DetailScreen({ data, onBack, onPressMap }){
  
  // 💡 2. ดึงรูปภาพโดยใช้ชื่อสถานที่จาก Firebase เป็น Key
  // ถ้าหาไม่เจอ ให้ใช้รูปสำรอง (defaultImage)
  const imageUrl = locationImages[data?.ชื่อ] || defaultImage;

  // ฟังก์ชันโทรออก (เหมือนเดิม)
  const handleCall = (number) => {
    if (number) {
      Linking.openURL(`tel:${number}`);
    } else {
      alert("ไม่พบเบอร์โทรศัพท์");
    }
  };

const handleOpenInternalMap = () => {
    if (data?.พิกัด) {
      onPressMap({
        name: data.ชื่อ,
        coordinates: {
          latitude: data.พิกัด.latitude,
          longitude: data.พิกัด.longitude,
        }
      });
    } else {
      alert("ไม่พบข้อมูลพิกัดในระบบ");
    }
  };
  const days = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ปุ่มย้อนกลับ */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* รูปภาพด้านบน */}
        <View style={styles.imageWrapper}>
          <Image
            source={imageUrl} // 💡 3. เปลี่ยนมาใช้ตัวแปรimageUrl ที่เราดึงมา
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          {/* ... โค้ดส่วนเนื้อหาด้านล่างเหมือนเดิม ... */}
          {/* สถานะและระยะทาง */}
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>เปิดอยู่</Text>
            <Text style={styles.distanceText}> | 2 กม.</Text>
          </View>

          {/* ชื่อสถานที่ */}
          <Text style={styles.title}>{data?.ชื่อ || "ไม่ระบุชื่อ"}</Text>

          {/* ... เนื้อหาอื่นๆ ... */}
          <Text style={styles.sectionTitle}>ที่อยู่</Text>
          
      <TouchableOpacity onPress={handleOpenInternalMap}> {/* <--- เรียกใช้ฟังก์ชันใหม่ */}
            <Text style={[styles.linkText, { marginBottom: 5 }]}>📍 กดเพื่อนำทาง</Text>
            <Text style={styles.addressText}>{data?.ที่อยู่ || "ไม่ระบุที่อยู่"}</Text>
          </TouchableOpacity>

          {/* เบอร์โทรศัพท์ */}
          <Text style={styles.sectionTitle}>เบอร์โทรศัพท์</Text>
          <TouchableOpacity onPress={() => handleCall(data?.เบอร์โทร)}>
            <Text style={styles.phoneLinkText}>📞 {data?.เบอร์โทร || "ไม่ระบุเบอร์โทร"}</Text>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ... โค้ด Stylesheet เหมือนเดิม ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageWrapper: { width: width, height: 250 },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  contentContainer: { paddingHorizontal: 20, paddingTop: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  statusText: { color: '#28a745', fontWeight: '600', fontSize: 16 },
  distanceText: { color: '#666', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 10 },
  linkText: { color: '#0c4edd', fontSize: 16, fontWeight: 'bold' },
  addressText: { color: '#666', fontSize: 15, lineHeight: 22 },
  phoneLinkText: { color: '#ff7a00', fontSize: 20, fontWeight: 'bold', textDecorationLine: 'underline' },
});
