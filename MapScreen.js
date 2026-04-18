import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_APIKEY = 'AIzaSyCzLA0NWNQk5Iu9AzC0yW1bwQ0Y_KqngSQ'; 


const carIcon = require('./assets/car_icon.png'); 

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
  
  // สถานะการเดินทาง: 'navigating' (กำลังไป), 'approaching' (ใกล้ถึง), 'arrived' (ถึงแล้ว)
  const [arrivalStatus, setArrivalStatus] = useState('navigating'); 

  // ตัวแปรสำหรับหลอด Progress Bar และการขยับกล้อง
  const [currentDistInMeters, setCurrentDistInMeters] = useState(0);
  const initialDistRef = useRef(null); 
  const mapRef = useRef(null); 

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

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,   // อัปเดตทุกๆ 2 วินาทีให้ลื่นไหล
          distanceInterval: 2,  // ขยับแค่ 2 เมตรก็อัปเดตแล้ว
        },
        (newLocation) => {
          const currentPos = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          
          setOrigin(currentPos); 

          const distInMeters = calculateDistance(
            currentPos.latitude, currentPos.longitude,
            destination.latitude, destination.longitude
          );

          setCurrentDistInMeters(distInMeters);

          if (initialDistRef.current === null) {
            initialDistRef.current = distInMeters;
          }

          // อัปเดตสถานะการเดินทาง (50 เมตร ถึงที่หมาย / 300 เมตร ใกล้ถึง)
          if (distInMeters <= 50) { 
            setArrivalStatus('arrived'); 
          } else if (distInMeters <= 300) {
            setArrivalStatus('approaching'); 
          } else {
            setArrivalStatus('navigating'); 
          }

          // เลื่อนกล้องแผนที่ให้ตามหมุดรถอัตโนมัติ
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              ...currentPos,
              latitudeDelta: 0.01, // ปรับให้ซูมใกล้ๆ จะได้เห็นรถชัดๆ
              longitudeDelta: 0.01,
            }, 1000); 
          }
        }
      );
    })();

    return () => {
      if (locationSubscription) locationSubscription.remove();
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

  // คำนวณเปอร์เซ็นต์ของหลอด Progress Bar
  const progressPercent = initialDistRef.current
    ? Math.max(0, Math.min(100, ((initialDistRef.current - currentDistInMeters) / initialDistRef.current) * 100))
    : 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* 🚗 หมุดรูปรถ (anchor ช่วยให้รถอยู่ตรงกลางพิกัดเป๊ะๆ) */}
        <Marker coordinate={origin} title="คุณอยู่ที่นี่" anchor={{x: 0.5, y: 0.5}}>
          <Image source={carIcon} style={styles.carIcon} />
        </Marker>

        <Marker coordinate={destination} title={destName} />

        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={6}
          strokeColor="#F7934C"
          onReady={result => {
            setRouteDistance(result.distance);
            setRouteDuration(result.duration);
          }}
        />
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        
        {(arrivalStatus === 'navigating' || arrivalStatus === 'approaching') && (
          <View>
            <Text style={[styles.distanceTitle, arrivalStatus === 'approaching' && { color: '#F7934C' }]}>
              {arrivalStatus === 'approaching' 
                ? "ใกล้ถึงที่หมายแล้ว" 
                : (routeDistance ? `${routeDistance.toFixed(1)} กิโลเมตร (${Math.ceil(routeDuration)} นาที)` : "กำลังคำนวณเส้นทาง...")
              }
            </Text>
            <Text style={styles.subText}>เส้นทางที่เร็วที่สุดในขณะนี้เนื่องจากสภาพการจราจร</Text>

            {/* หลอด Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.progressIndicator, { left: `${progressPercent}%` }]} />
            </View>

            {/* แสดงที่อยู่และจุดไข่ปลาเชื่อม */}
            <View style={styles.locationsWrapper}>
              <View style={styles.connectingLine} />
              <View style={styles.locationRow}>
                <View style={styles.dotCurrent}><View style={styles.innerDot}/></View>
                <View style={styles.addressBox}><Text numberOfLines={1}>ตำแหน่งปัจจุบันของคุณ</Text></View>
              </View>
              <View style={styles.locationRow}>
                <View style={styles.dotDest}><View style={styles.innerDot}/></View>
                <View style={styles.addressBox}><Text numberOfLines={1}>{destName}</Text></View>
              </View>
            </View>
          </View>
        )}

        {/* สถานะ 3: ถึงที่หมายแล้ว */}
        {arrivalStatus === 'arrived' && (
          <View>
            <Text style={styles.arrivedTitle}>{destName}</Text>
            <Text style={styles.arrivedSubText}>คุณได้เดินทางมาถึงจุดหมายปลายทางแล้ว</Text>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => {
                alert('ยืนยันการเดินทางสำเร็จ!');
                if(onBack) onBack(); // เด้งกลับเมื่อยืนยัน
              }} 
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
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, elevation: 5 },
  backIcon: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  // สไตล์รูปรถ
  carIcon: { width: 45, height: 45, resizeMode: 'contain' },
  
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 15 },
  distanceTitle: { fontSize: 24, fontWeight: 'bold' },
  subText: { color: '#888', fontSize: 13, marginBottom: 15, marginTop: 5 },
  
  progressBarContainer: { height: 6, backgroundColor: '#FFE0CC', borderRadius: 3, marginBottom: 25, position: 'relative', justifyContent: 'center' },
  progressBarFill: { height: 6, backgroundColor: '#F7934C', borderRadius: 3 },
  progressIndicator: { position: 'absolute', width: 14, height: 14, backgroundColor: '#fff', borderRadius: 7, borderWidth: 3, borderColor: '#F7934C', marginLeft: -7 },

  locationsWrapper: { position: 'relative' },
  connectingLine: { position: 'absolute', left: 11, top: 25, bottom: 25, width: 2, backgroundColor: '#FFE0CC', zIndex: -1 },
  
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dotCurrent: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFE0CC', justifyContent: 'center', alignItems: 'center' },
  dotDest: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFE0CC', justifyContent: 'center', alignItems: 'center' },
  innerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F7934C' }, 
  
  addressBox: { flex: 1, marginLeft: 15, padding: 15, borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 12 },
  
  arrivedTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  arrivedSubText: { color: '#666', fontSize: 14, marginBottom: 25 },
  confirmButton: { backgroundColor: '#F7934C', paddingVertical: 15, borderRadius: 30, alignItems: 'center', elevation: 2 },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
