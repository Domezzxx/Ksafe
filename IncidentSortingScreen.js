import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { db } from './firebaseConfig'; 
import { collection, onSnapshot, query } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// ⚠️ ใช้ Key เดียวกันกับที่คุณใช้ในหน้า MapScreen
const GOOGLE_MAPS_APIKEY = 'AIzaSyCzLA0NWNQk5Iu9AzC0yW1bwQ0Y_KqngSQ'; 

export default function IncidentSortingScreen({ filter, onBack }) {
  const [activeFilter, setActiveFilter] = useState(filter || 'all');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'incident_reports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const item = doc.data();
        let sev = item.severity || (item.count >= 10 ? 'high' : item.count >= 5 ? 'medium' : 'low');
        return { id: doc.id, ...item, severity: sev };
      });
      setIncidents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredData = incidents.filter(item => 
    activeFilter === 'all' ? true : item.severity === activeFilter
  );

  const getStyle = (sev) => {
    switch (sev) {
      case 'high': return { color: 'rgba(239, 68, 68, 0.4)', solid: '#EF4444', label: 'เสี่ยงสูง' };
      case 'medium': return { color: 'rgba(245, 158, 11, 0.4)', solid: '#F59E0B', label: 'ปานกลาง' };
      default: return { color: 'rgba(250, 204, 21, 0.4)', solid: '#FACC15', label: 'เฝ้าระวัง' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><ArrowLeft color="#111" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>สรุปพิกัดแยกประเภท</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_GOOGLE} 
          style={styles.map}
          // ใส่ API Key กำกับไว้ (เผื่อกรณีระบบตรวจไม่เจอจากไฟล์ Android/iOS)
          apikey={GOOGLE_MAPS_APIKEY} 
          initialRegion={{
            latitude: 14.9071,
            longitude: 102.0040,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {filteredData.map((item) => {
            const config = getStyle(item.severity);
            const lat = parseFloat(item.latitude);
            const lng = parseFloat(item.longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <React.Fragment key={item.id}>
                <Circle 
                  center={{ latitude: lat, longitude: lng }} 
                  radius={400} 
                  fillColor={config.color} 
                  strokeColor="transparent" 
                />
                <Marker coordinate={{ latitude: lat, longitude: lng }}>
                   <View style={[styles.markerDot, { backgroundColor: config.solid }]} />
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>
      </View>

      {/* ส่วน Tabs กรองสี */}
      <View style={styles.tabContainer}>
        {['all', 'high', 'medium', 'low'].map((type) => (
          <TouchableOpacity 
            key={type} 
            onPress={() => setActiveFilter(type)}
            style={[styles.tab, activeFilter === type && { borderColor: getStyle(type).solid, backgroundColor: getStyle(type).solid + '15' }]}
          >
            <View style={[styles.dot, { backgroundColor: getStyle(type).solid }]} />
            <Text style={[styles.tabText, activeFilter === type && { color: getStyle(type).solid, fontWeight: 'bold' }]}>
              {type === 'all' ? 'ทั้งหมด' : getStyle(type).label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator size="large" color="#F7934C" /> : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.sideLine, { backgroundColor: getStyle(item.severity).solid }]} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardId}>ID-{item.id.substring(0, 5)} <Text style={styles.cardTitle}>{item.service_name}</Text></Text>
                <Text style={styles.subText}>📍 {item.latitude}, {item.longitude}</Text>
              </View>
              <ChevronRight size={18} color="#D1D5DB" />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  mapWrapper: { marginHorizontal: 20, height: 250, borderRadius: 25, overflow: 'hidden', backgroundColor: '#EEE', marginTop: 10, elevation: 4 },
  map: { ...StyleSheet.absoluteFillObject },
  markerDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: '#FFF' },
  tabContainer: { flexDirection: 'row', padding: 15, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#FFF' },
  tabText: { fontSize: 11, marginLeft: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 1 },
  sideLine: { width: 4, height: 35, borderRadius: 10 },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardId: { fontSize: 11, color: '#F7934C', fontWeight: 'bold' },
  cardTitle: { color: '#333', fontWeight: 'bold' },
  subText: { fontSize: 11, color: '#999' }
});