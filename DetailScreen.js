import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ScrollView, StyleSheet, Dimensions, StatusBar, Linking, Platform
} from 'react-native';
import * as Location from 'expo-location'; // ✅ เพิ่ม import

const { width } = Dimensions.get('window');

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/800x450.png?text=No+Image+Available';

export default function DetailScreen({ data, onBack, onPressMap }){

  const [userLocation, setUserLocation] = useState(null); // ✅ เพิ่ม state

  // ✅ ดึง GPS โทรศัพท์
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation(loc.coords);
    })();
  }, []);

  // ✅ สูตร Haversine
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} ม.`;
    return `${km.toFixed(1)} กม.`;
  };

  // ✅ คำนวณระยะทาง
  const geo = data?.พิกัด;
  const distanceLabel = (userLocation && geo?.latitude && geo?.longitude)
    ? formatDistance(getDistance(userLocation.latitude, userLocation.longitude, geo.latitude, geo.longitude))
    : '-- กม.';

  const getImageUrl = () => {
    if (data?.รูปภาพ && typeof data.รูปภาพ === 'string') {
      return { uri: data.รูปภาพ };
    }
    if (data?.imageUrl && typeof data.imageUrl === 'string') {
      return { uri: data.imageUrl };
    }
    return { uri: DEFAULT_PLACEHOLDER };
  };

  const imageUrl = getImageUrl();

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
        ชื่อ: data.ชื่อ,
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
        <Text style={styles.backIcon}>←</Text>
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
            <Text style={styles.distanceText}> | {distanceLabel}</Text>{/* ✅ แสดงระยะทางจริง */}
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
  imageWrapper: { width: width, height: 250, backgroundColor: '#f0f0f0' },
  headerImage: { width: '100%', height: '100%' },
  backButton: { 
    position: 'absolute', top: 50, left: 15, zIndex: 10, 
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, 
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3
  },
  backIcon: { fontSize: 24, fontWeight: 'bold', color: '#000' },
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
