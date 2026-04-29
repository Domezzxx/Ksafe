import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, StatusBar
} from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { db } from './firebaseConfig';
import { collection, onSnapshot, query, getCountFromServer } from 'firebase/firestore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ── รายการบริการ (Hardcode จาก assets) ──
const SERVICE_LIST = [
  { key: 'jrajon',   label: 'กรมทางหลวงชนบท', image: require('./assets/jrajon.png'),   accent: '#3B82F6' },
  { key: 'police',   label: 'สายด่วนตำรวจ',   image: require('./assets/rp.png'),       accent: '#6366F1' },
  { key: 'fire',     label: 'เพลิงไหม้',       image: require('./assets/fire.png'),    accent: '#EF4444' },
  { key: 'electric', label: 'การไฟฟ้า',        image: require('./assets/phifa.png'),   accent: '#F59E0B' },
  { key: 'rescue',   label: 'สายด่วนกู้ภัย',   image: require('./assets/rs.png'),       accent: '#10B981' },
];

const FOOTER_TAB_HEIGHT = 56;

// ── ฟังก์ชันคำนวณระยะทาง ──
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

// ── ฟังก์ชันคำนวณ severity แบบเดียวกับ IncidentSortingScreen ──
const computeSeverity = (rawData) => {
  const radiusKm = 1.0;
  return rawData.map((item, _, arr) => {
    if (!item.hasCoords) return { ...item, severity: 'low', nearbyCount: 0 };

    let nearbyCount = 0;
    for (let i = 0; i < arr.length; i++) {
      const other = arr[i];
      if (!other.hasCoords) continue;
      if (Math.abs(item.lat - other.lat) > 0.015 || Math.abs(item.lng - other.lng) > 0.015) continue;
      const dist = getDistanceFromLatLonInKm(item.lat, item.lng, other.lat, other.lng);
      if (dist <= radiusKm) nearbyCount++;
    }

    let severity = 'low';
    if (nearbyCount >= 20) severity = 'high';
    else if (nearbyCount >= 5) severity = 'medium';

    return { ...item, severity, nearbyCount };
  });
};

// ── ✅ แปลง createdAt ให้เป็น Date รองรับทุก format ──
const parseDate = (createdAt) => {
  if (!createdAt) return null;
  // Firestore Timestamp (มี .toDate())
  if (typeof createdAt.toDate === 'function') return createdAt.toDate();
  // Unix timestamp (number) — วินาที หรือ มิลลิวินาที
  if (typeof createdAt === 'number') {
    return new Date(createdAt > 1e10 ? createdAt : createdAt * 1000);
  }
  // ISO string หรือ string อื่น ๆ
  if (typeof createdAt === 'string') {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp object ที่ยังไม่ถูก deserialize (มี seconds field)
  if (createdAt.seconds !== undefined) {
    return new Date(createdAt.seconds * 1000);
  }
  return null;
};

// ── ✅ คำนวณ startOfToday เวลาท้องถิ่น ──
const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const AdminHomeScreen = ({ onLogout, onGoHome, onGoSOS, onGoSearch, onGoProfile, onGoToSorting }) => {
  const insets = useSafeAreaInsets();
  const FOOTER_HEIGHT = FOOTER_TAB_HEIGHT + insets.bottom;

  const [incidents, setIncidents] = useState([]);
  const [incidentLoading, setIncidentLoading] = useState(true);   // ✅ แยก loading ออกจาก statsLoading
  const [statsLoading, setStatsLoading] = useState(true);
  const [todayIncidents, setTodayIncidents] = useState(0);         // ✅ state แยกสำหรับยอดเหตุฉุกเฉินวันนี้
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFacilities: 0,
  });

  // ── ✅ Realtime listener: incidents + นับเฉพาะวันนี้ (รีเซตเองทุก 00:00 อัตโนมัติ) ──
  useEffect(() => {
    const q = query(collection(db, 'incident_reports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const startOfToday = getStartOfToday(); // คำนวณใหม่ทุกครั้งที่ snapshot มา

      const rawData = snapshot.docs.map(doc => {
        const data = doc.data();
        let lat = data.latitude !== undefined ? parseFloat(data.latitude) : NaN;
        let lng = data.longitude !== undefined ? parseFloat(data.longitude) : NaN;
        if (data.location && typeof data.location.latitude === 'number') {
          lat = data.location.latitude;
          lng = data.location.longitude;
        }
        return {
          id: doc.id,
          ...data,
          lat,
          lng,
          hasCoords: !isNaN(lat) && !isNaN(lng),
        };
      });

      const processed = computeSeverity(rawData);

      // ✅ นับเฉพาะ incident ที่ createdAt >= 00:00:00 วันนี้
      const todayCount = processed.filter(item => {
        const d = parseDate(item.timestamp);
        return d !== null && d >= startOfToday;
      }).length;

      setIncidents(processed);
      setTodayIncidents(todayCount);   // ✅ update ทันทีไม่ต้องรอ statsLoading
      setIncidentLoading(false);
    }, (error) => {
      console.error('Firebase incident_reports error:', error);
      setIncidentLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── ✅ ดึงจำนวน users และ facilities ครั้งเดียว ──
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersSnap, facilitiesSnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'facilities')),
        ]);
        setStats({
          totalUsers: usersSnap.data().count,
          totalFacilities: facilitiesSnap.data().count,
        });
      } catch (e) {
        console.error('Count error:', e);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const getStyle = (sev) => {
    switch (sev) {
      case 'high':   return { color: 'rgba(239,68,68,0.35)',   solid: '#EF4444', label: 'เสี่ยงสูง' };
      case 'medium': return { color: 'rgba(245,158,11,0.35)',  solid: '#F59E0B', label: 'ปานกลาง' };
      default:       return { color: 'rgba(250,204,21,0.35)',  solid: '#FACC15', label: 'เฝ้าระวัง' };
    }
  };

  const serviceCounts = incidents.reduce((acc, item) => {
    const name = item.service_name;
    if (!name) return acc;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...SERVICE_LIST.map(s => serviceCounts[s.label] || 0), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT + 16 }}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>ADMIN</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Ksafe Admin</Text>
              <Text style={styles.headerSubtitle}>แดชบอร์ดภาพรวมระบบ</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.75}>
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stat Cards ── */}
        <View style={styles.cardRow}>
          {/* ✅ Card เหตุฉุกเฉิน — ใช้ incidentLoading แยกต่างหาก แสดงตัวเลขทันที */}
          <TouchableOpacity
            style={[styles.cardBig, { backgroundColor: '#FF5A3C' }]}
            activeOpacity={0.9}
            onPress={() => onGoToSorting && onGoToSorting('all')}
          >
            <View style={[styles.deco, { width: 100, height: 100, top: -30, right: -30, backgroundColor: 'rgba(255,255,255,0.12)' }]} />
            <View style={[styles.deco, { width: 60, height: 60, bottom: 10, left: -15, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            <Text style={styles.cardIcon}>🚨</Text>
            {incidentLoading ? (
              <ActivityIndicator color="#FFF" style={{ marginVertical: 6 }} />
            ) : (
              <Text style={styles.cardNum}>{todayIncidents}</Text>
            )}
            <Text style={styles.cardLabel}>เหตุฉุกเฉินวันนี้</Text>
            <View style={styles.cardPill}>
              <Text style={styles.cardPillText}>ดูรายละเอียด →</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardColRight}>
            <View style={[styles.cardSmall, { backgroundColor: '#1E1B4B' }]}>
              <View style={[styles.deco, { width: 60, height: 60, top: -15, right: -15, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
              <Text style={styles.cardIcon}>👤</Text>
              <Text style={styles.cardNum}>{statsLoading ? '–' : stats.totalUsers}</Text>
              <Text style={styles.cardLabel}>ผู้ใช้ทั้งหมด</Text>
            </View>
            <View style={[styles.cardSmall, { backgroundColor: '#065F46' }]}>
              <View style={[styles.deco, { width: 60, height: 60, top: -15, right: -15, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
              <Text style={styles.cardIcon}>🏥</Text>
              <Text style={styles.cardNum}>{statsLoading ? '–' : stats.totalFacilities}</Text>
              <Text style={styles.cardLabel}>สถานที่ในระบบ</Text>
            </View>
          </View>
        </View>

        {/* ── Map Section ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>พื้นที่เกิดเหตุบ่อยที่สุด</Text>
        </View>

        <View style={styles.mapWrapper}>
          {incidentLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#FF5A3C" />
              <Text style={styles.loaderText}>กำลังโหลดพิกัด...</Text>
            </View>
          ) : (
            <>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{ latitude: 14.9071, longitude: 102.0040, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
              >
                {incidents.map((item) => {
                  if (!item.hasCoords) return null;
                  const config = getStyle(item.severity);
                  return (
                    <React.Fragment key={item.id}>
                      <Circle
                        center={{ latitude: item.lat, longitude: item.lng }}
                        radius={400}
                        fillColor={config.color}
                        strokeColor="transparent"
                      />
                      <Marker
                        coordinate={{ latitude: item.lat, longitude: item.lng }}
                        onCalloutPress={() => onGoToSorting && onGoToSorting(item.severity)}
                      >
                        <View style={[styles.markerOuter, { borderColor: config.solid }]}>
                          <View style={[styles.markerInner, { backgroundColor: config.solid }]} />
                        </View>
                        <Callout tooltip>
                          <View style={styles.calloutBox}>
                            <View style={[styles.calloutBadge, { backgroundColor: config.solid }]}>
                              <Text style={styles.calloutBadgeText}>{config.label}</Text>
                            </View>
                            <Text style={styles.calloutSub} numberOfLines={1}>
                              {item.service_name || 'แจ้งเหตุ SOS'}
                            </Text>
                            <Text style={styles.calloutNearby}>
                              พบ {item.nearbyCount} ครั้งในพื้นที่
                            </Text>
                            <View style={[styles.goBtn, { backgroundColor: config.solid }]}>
                              <Text style={styles.goBtnText}>ดูรายการ →</Text>
                            </View>
                          </View>
                        </Callout>
                      </Marker>
                    </React.Fragment>
                  );
                })}
              </MapView>

              {/* Legend + ปุ่มดูทั้งหมด */}
              <View style={styles.mapOverlay}>
                <View style={styles.legendRow}>
                  {[
                    { sev: 'high',   label: 'เสี่ยงสูง',  color: '#EF4444' },
                    { sev: 'medium', label: 'ปานกลาง',    color: '#F59E0B' },
                    { sev: 'low',    label: 'เฝ้าระวัง',  color: '#FACC15' },
                  ].map(({ sev, label, color }) => (
                    <TouchableOpacity
                      key={sev}
                      style={styles.legendItem}
                      onPress={() => onGoToSorting && onGoToSorting(sev)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.legendDot, { backgroundColor: color }]} />
                      <Text style={styles.legendText}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => onGoToSorting && onGoToSorting('all')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewAllText}>ดูทั้งหมด →</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── Service Summary ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>สรุปรายงานการโทรประจำเดือน</Text>
        </View>

        <View style={styles.serviceListWrapper}>
          {SERVICE_LIST.map((service, index) => (
            <ServiceRow
              key={service.key}
              name={service.label}
              count={serviceCounts[service.label] || 0}
              image={service.image}
              accent={service.accent}
              maxCount={maxCount}
              isLast={index === SERVICE_LIST.length - 1}
            />
          ))}
        </View>

      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { height: FOOTER_HEIGHT, paddingBottom: insets.bottom }]}>
        <FooterTab icon={require('./assets/home (2).png')} active onPress={onGoHome} />
        <FooterTab icon={require('./assets/emergency (1).png')} onPress={onGoSOS} />
        <FooterTab icon={require('./assets/map (1).png')} onPress={onGoSearch} />
        <FooterTab icon={require('./assets/user.png')} onPress={onGoProfile} />
      </View>
    </SafeAreaView>
  );
};

// ── Sub Components ──

const ServiceRow = ({ name, count, image, accent, maxCount, isLast }) => {
  const pct = maxCount > 0 ? count / maxCount : 0;
  return (
    <View style={[styles.serviceRow, isLast && { marginBottom: 0 }]}>
      <View style={[styles.serviceIconWrapper, { backgroundColor: accent + '18' }]}>
        <Image source={image} style={styles.serviceIcon} resizeMode="contain" />
      </View>
      <View style={styles.serviceInfo}>
        <View style={styles.serviceTopRow}>
          <Text style={styles.serviceName} numberOfLines={1}>{name}</Text>
          <Text style={[styles.serviceCount, { color: accent }]}>{count} คน</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: accent }]} />
        </View>
      </View>
    </View>
  );
};

const FooterTab = ({ icon, active, onPress }) => (
  <TouchableOpacity style={styles.fBtn} onPress={onPress} activeOpacity={0.7}>
    {active && <View style={styles.fActiveDot} />}
    <Image source={icon} style={[styles.fIcon, { tintColor: active ? '#FF5A3C' : '#C4C4C4' }]} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBadge: {
    backgroundColor: '#FF5A3C', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  headerBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  logoutBtn: {
    paddingVertical: 7, paddingHorizontal: 14,
    backgroundColor: '#FFF',
    borderRadius: 20, borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  cardRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 12, marginBottom: 28 },
  cardBig: {
    flex: 1.05, borderRadius: 24, padding: 20, overflow: 'hidden',
    shadowColor: '#FF5A3C', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  cardColRight: { flex: 1, gap: 12 },
  cardSmall: {
    flex: 1, borderRadius: 24, padding: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  deco: { position: 'absolute', borderRadius: 999 },
  cardIcon: { fontSize: 20, marginBottom: 10 },
  cardNum: { fontSize: 30, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
  cardLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
  cardPill: {
    marginTop: 12, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  cardPillText: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionAccent: { width: 4, height: 18, backgroundColor: '#FF5A3C', borderRadius: 2, marginRight: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  mapWrapper: {
    marginHorizontal: 18, height: 300,
    borderRadius: 22, overflow: 'hidden',
    backgroundColor: '#E5E7EB', marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  map: { ...StyleSheet.absoluteFillObject },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#9CA3AF', fontSize: 13 },
  markerOuter: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF',
  },
  markerInner: { width: 8, height: 8, borderRadius: 4 },
  calloutBox: {
    width: 160, backgroundColor: '#FFF',
    borderRadius: 16, padding: 14,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  calloutBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  calloutBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  calloutSub: { fontSize: 11, color: '#6B7280', marginBottom: 4, textAlign: 'center' },
  calloutNearby: { fontSize: 10, color: '#9CA3AF', marginBottom: 10 },
  goBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  goBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  mapOverlay: {
    position: 'absolute',
    bottom: 12, left: 12, right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6,
    gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, fontWeight: '600', color: '#374151' },
  viewAllBtn: {
    backgroundColor: '#FF5A3C',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#FF5A3C', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  viewAllText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  serviceListWrapper: {
    marginHorizontal: 18, marginBottom: 10,
    backgroundColor: '#FFF', borderRadius: 22, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    paddingVertical: 8,
  },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6',
  },
  serviceIconWrapper: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  serviceIcon: { width: 32, height: 32 },
  serviceInfo: { flex: 1 },
  serviceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  serviceName: { fontSize: 14, fontWeight: '600', color: '#1F2937', flex: 1 },
  serviceCount: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  barTrack: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  footer: {
    position: 'absolute', bottom: 0,
    flexDirection: 'row', width: '100%',
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 10,
  },
  fBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fActiveDot: {
    position: 'absolute', top: 8,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#FF5A3C',
  },
  fIcon: { width: 22, height: 22 },
});

export default AdminHomeScreen;
