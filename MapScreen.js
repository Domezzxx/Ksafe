import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
// ⚠️ อย่าลืมใส่ API Key ของคุณ
const GOOGLE_MAPS_APIKEY = 'AIzaSyCzLA0NWNQk5Iu9AzC0yW1bwQ0Y_KqngSQ'; 

// 🧮 ฟังก์ชันคำนวณระยะห่างระหว่างพิกัด 2 จุด (หน่วยเป็นเมตร) เส้นตรง
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // รัศมีโลก (เมตร)
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function MapScreen({ onBack, destinationName, destinationCoords }) {
  const [origin, setOrigin] = useState(null); 
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  
  // 💡 สถานะการเดินทาง: 'navigating' (กำลังไป), 'approaching' (ใกล้ถึง), 'arrived' (ถึงแล้ว)
  const [arrivalStatus, setArrivalStatus] = useState('navigating'); 

  // จุดหมายปลายทาง (รับค่ามาจาก App.js)
  const destination = destinationCoords || { latitude: 14.8824, longitude: 102.0135 };
  const destName = destinationName || "จุดหมายปลายทาง";

  useEffect(() => {
    let locationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("ไม่อนุญาตให้เข้าถึง GPS");
        return;
      }

      // 🛰️ ใช้ watchPositionAsync เพื่อติดตามตำแหน่งตลอดเวลาที่เคลื่อนที่
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,   // อัปเดตทุกๆ 3 วินาที
          distanceInterval: 5,  // หรือเมื่อขยับไป 5 เมตร
        },
        (newLocation) => {
          const currentPos = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          
          setOrigin(currentPos); // เลื่อนหมุดปัจจุบัน

          // 📏 คำนวณระยะห่างว่าใกล้ถึงหรือยัง
          const distInMeters = calculateDistance(
            currentPos.latitude, currentPos.longitude,
            destination.latitude, destination.longitude
          );

          // 💡 ตั้งเงื่อนไขเปลี่ยน UI ตามระยะทาง (ปรับตัวเลขเมตรได้ตามต้องการ)
          if (distInMeters <= 50) { 
            setArrivalStatus('arrived'); // ห่างไม่เกิน 50 เมตร = ถึงแล้ว
          } else if (distInMeters <= 300) {
            setArrivalStatus('approaching'); // ห่างไม่เกิน 300 เมตร = ใกล้ถึง
          } else {
            setArrivalStatus('navigating'); // ยังอยู่อีกไกล
          }
        }
      );
    })();

    return () => {
      // คืนค่าหน่วยความจำเมื่อปิดหน้าจอแผนที่
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  if (!origin) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F7934C" />
        <Text style={{ marginTop: 10 }}>กำลังค้นหาพิกัด GPS ของคุณ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true} // โชว์จุดสีฟ้าของ User ของ Google Maps ด้วย
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* หมุดจำลองตำแหน่ง (อาจจะใช้รูปรถแทนได้ในอนาคต) */}
        <Marker coordinate={origin} title="คุณอยู่ที่นี่" pinColor="blue" />
        <Marker coordinate={destination} title={destName} />

        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={5}
          strokeColor="#F7934C"
          onReady={result => {
            // อัปเดตระยะทางจาก Google Maps (เส้นทางถนนจริง)
            setRouteDistance(result.distance);
            setRouteDuration(result.duration);
          }}
        />
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* 🛑 ส่วน UI ด้านล่างที่จะเปลี่ยนตามสถานะ */}
      <View style={styles.bottomSheet}>
        
        {/* สถานะ 1: กำลังเดินทาง */}
        {arrivalStatus === 'navigating' && (
          <View>
            <Text style={styles.distanceTitle}>
              {routeDistance ? `${routeDistance.toFixed(1)} กิโลเมตร (${Math.ceil(routeDuration)} นาที)` : "กำลังคำนวณเส้นทาง..."}
            </Text>
            <Text style={styles.subText}>เส้นทางที่เร็วที่สุดในขณะนี้เนื่องจากสภาพการจราจร</Text>
            <View style={styles.locationRow}>
              <View style={styles.dotCurrent}><View style={styles.innerDot}/></View>
              <View style={styles.addressBox}><Text>ตำแหน่งปัจจุบัน</Text></View>
            </View>
            <View style={styles.locationRow}>
              <View style={styles.dotDest}><View style={styles.innerDot}/></View>
              <View style={styles.addressBox}><Text>{destName}</Text></View>
            </View>
          </View>
        )}

        {/* สถานะ 2: ใกล้ถึงที่หมาย */}
        {arrivalStatus === 'approaching' && (
          <View>
            <Text style={[styles.distanceTitle, { color: '#F7934C' }]}>ใกล้ถึงที่หมายแล้ว</Text>
            <Text style={styles.subText}>เส้นทางที่เร็วที่สุดในขณะนี้เนื่องจากสภาพการจราจร</Text>
            <View style={styles.locationRow}>
              <View style={styles.dotCurrent}><View style={styles.innerDot}/></View>
              <View style={styles.addressBox}><Text>ตำแหน่งปัจจุบัน</Text></View>
            </View>
            <View style={styles.locationRow}>
              <View style={styles.dotDest}><View style={styles.innerDot}/></View>
              <View style={styles.addressBox}><Text>{destName}</Text></View>
            </View>
          </View>
        )}

        {/* สถานะ 3: ถึงที่หมายแล้ว (แสดงปุ่มยืนยัน) */}
        {arrivalStatus === 'arrived' && (
          <View>
            <Text style={styles.arrivedTitle}>{destName}</Text>
            <Text style={styles.arrivedSubText}>คุณได้เดินทางมาถึงจุดหมายปลายทางแล้ว</Text>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => alert('ยืนยันการเดินทางสำเร็จ!')} // 💡 ใส่ฟังก์ชันเมื่อกดยืนยันตรงนี้
            >
              <Text style={styles.confirmButtonText}>ยืนยัน</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 5 },
  backIcon: { fontSize: 24 },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 15 },
  distanceTitle: { fontSize: 22, fontWeight: 'bold' },
  subText: { color: '#888', fontSize: 12, marginBottom: 20, marginTop: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dotCurrent: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center' },
  dotDest: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F7934C', justifyContent: 'center', alignItems: 'center' },
  innerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  addressBox: { flex: 1, marginLeft: 15, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 15 },
  
  // สไตล์สำหรับหน้า "ถึงที่หมายแล้ว"
  arrivedTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  arrivedSubText: { color: '#666', fontSize: 14, marginBottom: 20 },
  confirmButton: { backgroundColor: '#F7934C', paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});