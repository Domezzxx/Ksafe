import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  ActivityIndicator, TouchableOpacity, FlatList, ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { ArrowLeft, ChevronRight, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react-native';
import { db } from './firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_APIKEY = 'AIzaSyCzLA0NWNQk5Iu9AzC0yW1bwQ0Y_KqngSQ';

// ✅ โครงสร้างฟังก์ชันคำนวณเดิมของคุณ
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function IncidentSortingScreen({ filter, onBack }) {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState(filter || 'all');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ State สำหรับปฏิทินที่เด้งตรงปุ่ม
  const [selectedDate, setSelectedDate] = useState(null); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); // เดือนที่กำลังพรีวิวในปฏิทิน

  useEffect(() => {
    const q = query(collection(db, 'incident_reports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map(doc => {
        const data = doc.data();

        let lat = data.latitude !== undefined ? parseFloat(data.latitude) : NaN;
        let lng = data.longitude !== undefined ? parseFloat(data.longitude) : NaN;

        if (data.location && typeof data.location.latitude === 'number') {
          lat = data.location.latitude;
          lng = data.location.longitude;
        }

        // เก็บ JS Date ไว้สำหรับ Filter
        const dateObj = data.timestamp?.toDate ? data.timestamp.toDate() : null;

        return { id: doc.id, ...data, lat, lng, dateObj };
      });

      const radiusKm = 1.0;

      // ✅ โครงสร้างการประมวลผลข้อมูลเดิม (nearbyCount & severity)
      const processedData = rawData.map((item, _, arr) => {
        let nearbyCount = 0;
        const hasCoords = !isNaN(item.lat) && !isNaN(item.lng);

        if (hasCoords) {
          for (let i = 0; i < arr.length; i++) {
            const otherItem = arr[i];
            if (isNaN(otherItem.lat) || isNaN(otherItem.lng)) continue;
            if (
              Math.abs(item.lat - otherItem.lat) > 0.015 ||
              Math.abs(item.lng - otherItem.lng) > 0.015
            ) continue;
            const distance = getDistanceFromLatLonInKm(item.lat, item.lng, otherItem.lat, otherItem.lng);
            if (distance <= radiusKm) nearbyCount++;
          }
        }

        let sev = 'low';
        if (nearbyCount >= 20) sev = 'high';
        else if (nearbyCount >= 5) sev = 'medium';

        return { ...item, severity: sev, nearbyCount, hasCoords };
      });

      setIncidents(processedData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Logic กรองข้อมูล (คงเดิม + เพิ่มการกรองวันที่)
  const filteredData = useMemo(() => {
    return incidents.filter(item => {
      const matchType = activeFilter === 'all' || item.severity === activeFilter;
      const matchDate = selectedDate 
        ? item.dateObj?.toDateString() === selectedDate.toDateString() 
        : true;
      return matchType && matchDate;
    });
  }, [incidents, activeFilter, selectedDate]);

  // ✅ ฟังก์ชันวาดปฏิทินขนาดเล็ก
  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<View key={`e-${i}`} style={styles.dayBox} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const curr = new Date(year, month, d);
      const isSelected = selectedDate?.toDateString() === curr.toDateString();
      days.push(
        <TouchableOpacity key={d} style={[styles.dayBox, isSelected && styles.selectedDay]} 
          onPress={() => { setSelectedDate(curr); setShowCalendar(false); }}>
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{d}</Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  const getStyle = (sev) => {
    switch (sev) {
      case 'high':   return { color: 'rgba(239, 68, 68, 0.4)',  solid: '#EF4444', label: 'เสี่ยงสูง' };
      case 'medium': return { color: 'rgba(245, 158, 11, 0.4)', solid: '#F59E0B', label: 'ปานกลาง' };
      default:       return { color: 'rgba(250, 204, 21, 0.4)', solid: '#FACC15', label: 'เฝ้าระวัง' };
    }
  };

  const mapHeight = height * 0.28;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={10}><ArrowLeft color="#111" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>สรุปพิกัดแยกประเภท</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map Section */}
      <View style={[styles.mapWrapper, { height: mapHeight }]}>
        <MapView provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFillObject} apikey={GOOGLE_MAPS_APIKEY}
          initialRegion={{ latitude: 14.9071, longitude: 102.0040, latitudeDelta: 0.1, longitudeDelta: 0.1 }}>
          {filteredData.filter(item => item.hasCoords).map((item) => {
            const config = getStyle(item.severity);
            return (
              <React.Fragment key={`map-${item.id}`}>
                <Circle center={{ latitude: item.lat, longitude: item.lng }} radius={400} fillColor={config.color} strokeColor="transparent" />
                <Marker coordinate={{ latitude: item.lat, longitude: item.lng }}>
                  <View style={[styles.markerDot, { backgroundColor: config.solid }]} />
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>

        {/* ✅ Calendar Button & Mini Modal (เด้งตรงไอคอน) */}
        <View style={styles.calendarContainer}>
          <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowCalendar(!showCalendar)}>
            <CalendarIcon color="#FFF" size={18} />
          </TouchableOpacity>
          {selectedDate && (
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</Text>
              <TouchableOpacity onPress={() => setSelectedDate(null)}><X color="#FFF" size={12} style={{marginLeft: 5}}/></TouchableOpacity>
            </View>
          )}

          {showCalendar && (
            <View style={styles.miniCalendar}>
              <View style={styles.calHeader}>
                <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}><ChevronLeft size={18}/></TouchableOpacity>
                <Text style={styles.calTitle}>{viewDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}><ChevronRightIcon size={18}/></TouchableOpacity>
              </View>
              <View style={styles.daysGrid}>{renderCalendarDays()}</View>
            </View>
          )}
        </View>
      </View>

      {/* Filter Tabs (เดิม) */}
      <View style={styles.tabContainer}>
        {['all', 'high', 'medium', 'low'].map((type) => (
          <TouchableOpacity key={type} onPress={() => setActiveFilter(type)} 
            style={[styles.tab, activeFilter === type && { borderColor: getStyle(type).solid, backgroundColor: getStyle(type).solid + '15' }]}>
            <View style={[styles.dot, { backgroundColor: getStyle(type).solid }]} />
            <Text style={[styles.tabText, activeFilter === type && { color: getStyle(type).solid, fontWeight: 'bold' }]}>
              {type === 'all' ? 'ทั้งหมด' : getStyle(type).label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List (เดิม) */}
      {loading ? (
        <ActivityIndicator size="large" color="#F7934C" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.sideLine, { backgroundColor: getStyle(item.severity).solid }]} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardId}>ID-{item.id.substring(0, 5)} <Text style={styles.cardTitle}>{item.service_name}</Text></Text>
                <Text style={styles.subText}>📍 {item.hasCoords ? `${item.lat}, ${item.lng} (พบ ${item.nearbyCount} ครั้ง)` : 'ไม่ระบุพิกัด'}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  
  // ✅ ปฏิทินลอยตัว
  calendarContainer: { position: 'absolute', top: 15, left: 15, zIndex: 1000, flexDirection: 'row', alignItems: 'flex-start' },
  calendarBtn: { backgroundColor: '#F7934C', padding: 10, borderRadius: 12, elevation: 5 },
  datePill: { backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginLeft: 8 },
  datePillText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  miniCalendar: { position: 'absolute', top: 50, left: 0, width: 220, backgroundColor: '#FFF', borderRadius: 15, padding: 10, elevation: 10, borderWidth: 1, borderColor: '#EEE' },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  calTitle: { fontSize: 12, fontWeight: 'bold' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayBox: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  dayText: { fontSize: 11 },
  selectedDay: { backgroundColor: '#F7934C' },
  selectedDayText: { color: '#FFF', fontWeight: 'bold' },

  mapWrapper: { marginHorizontal: 20, borderRadius: 25, overflow: 'visible', backgroundColor: '#EEE', marginTop: 10, elevation: 4 },
  markerDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: '#FFF' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 12, gap: 8, flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#FFF' },
  tabText: { fontSize: 12, marginLeft: 6, color: '#555' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 12 },
  sideLine: { width: 4, height: 35, borderRadius: 10 },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardId: { fontSize: 11, color: '#F7934C', fontWeight: 'bold' },
  cardTitle: { color: '#333', fontWeight: 'bold' },
  subText: { fontSize: 11, color: '#999', marginTop: 2 },
});
