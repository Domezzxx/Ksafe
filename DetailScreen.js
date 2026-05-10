import React from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ScrollView, StyleSheet, Dimensions, StatusBar, Linking, Platform
} from 'react-native';

const { width } = Dimensions.get('window');

// 💡 1. Image Map จับคู่ชื่อสถานที่ (ตรวจสอบชื่อให้ตรงกับ Firebase)
const locationImages = {
  "โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี": require('./assets/sut.jpg'),
  "PCU-SUT (ศูนย์แพทย์ชุมชน)": require('./assets/pcu.png'),
  "PCU-SUT (ศูนย์บริการสุขภาพ มทส.)": require('./assets/pcu.png'), // เพิ่มเผื่อชื่อใน Log
  "โรงพยาบาลราชสีมา ฮอสพิทอล": require('./assets/ratchasimahospital.png'),
  "โรงพยาบาลกรุงเทพนครราชสีมา": require('./assets/kungthep.png'),
  "โรงพยาบาลริมลิฟวิ่ง": require('./assets/rim.png'),
  "โรงพยาบาลค่ายสุรนารี": require('./assets/suranareecamp.jpg'),
  "สถานีตำรวจภูธรโพธิ์กลาง": require('./assets/poograng.png'),
  "สถานีตำรวจภูธรเมืองนครราชสีมา": require('./assets/police.png'),
  "ศูนย์กู้ภัยฮุก 31": require('./assets/hook31.png'),
  "ชมรมจิตอาสาแสดทอง": require('./assets/sadthong.png'),
  "การไฟฟ้าส่วนภูมิภาคเขต 3": require('./assets/pea_korat.png'),
  "สำนักงานกรมทางหลวงที่ 10": require('./assets/highway10.png'),
  "สถานีดับเพลิงสุรนารายณ์": require('./assets/fire_suranarai.png'),
  "ดับเพลิงจอมสุรางค์": require('./assets/fire_chomsurang.png'),
  "ศูนย์ป้องกันและบรรเทาสาธารณภัย เขต 5": require('./assets/disaster_prevent5.png'),
};

const defaultImage = require('./assets/sut.jpg'); 

export default function DetailScreen({ data, onBack, onPressMap }){
  
  // ดึงรูปภาพตามชื่อ หรือใช้รูปสำรอง
  const imageUrl = locationImages[data?.ชื่อ] || defaultImage;

  // รวมชื่อฟิลด์เบอร์โทรจาก Firebase (ป้องกัน Error จาก Log ที่คุณส่งมา)
  const phoneNumber = data?.เบอร์โทร || data?.เบอร์โทรติดต่อ || "";

  const handleCall = (number) => {
    if (number) {
      Linking.openURL(`tel:${number}`);
    } else {
      alert("ไม่พบเบอร์โทรศัพท์ในระบบ");
    }
  };

  const handleOpenInternalMap = () => {
    if (data?.พิกัด) {
      onPressMap({
        ชื่อ: data.ชื่อ, // ส่งค่าให้ตรงกับที่ MapScreen รอรับ
        พิกัด: data.พิกัด,
      });
    } else {
      alert("ไม่พบข้อมูลพิกัดในระบบ");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ปุ่มย้อนกลับ */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <View style={styles.arrowIcon} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* รูปภาพด้านบน */}
        <View style={styles.imageWrapper}>
          <Image
            source={imageUrl}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          {/* สถานะและระยะทาง */}
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>เปิดอยู่</Text>
            <Text style={styles.distanceText}> | 2 กม.</Text>
          </View>

          {/* ชื่อสถานที่ */}
          <Text style={styles.title}>{data?.ชื่อ || "ไม่ระบุชื่อ"}</Text>

          {/* ที่อยู่และการนำทาง */}
          <Text style={styles.sectionTitle}>ที่อยู่</Text>
          <TouchableOpacity onPress={handleOpenInternalMap} activeOpacity={0.7}>
            <Text style={styles.linkText}>📍 กดเพื่อนำทาง</Text>
            <Text style={styles.addressText}>{data?.ที่อยู่ || "ไม่ระบุที่อยู่"}</Text>
          </TouchableOpacity>

          {/* เบอร์โทรศัพท์ */}
          <Text style={styles.sectionTitle}>เบอร์โทรศัพท์</Text>
          <TouchableOpacity onPress={() => handleCall(phoneNumber)} activeOpacity={0.7}>
            <Text style={styles.phoneLinkText}>
              📞 {phoneNumber ? phoneNumber : "ไม่ระบุเบอร์โทร"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageWrapper: { width: width, height: 250 },
  headerImage: { width: '100%', height: '100%' },
  backButton: { 
    position: 'absolute', top: 50, left: 15, zIndex: 10, 
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, 
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3
  },
  backIcon: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  arrowIcon: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#000',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  contentContainer: { paddingHorizontal: 20, paddingTop: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  statusText: { color: '#28a745', fontWeight: '600', fontSize: 16 },
  distanceText: { color: '#666', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 10 },
  linkText: { color: '#0c4edd', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  addressText: { color: '#666', fontSize: 15, lineHeight: 22 },
  phoneLinkText: { color: '#ff7a00', fontSize: 20, fontWeight: 'bold', textDecorationLine: 'underline', marginTop: 5 },
});
