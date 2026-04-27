import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from 'react-native-maps';

// เชื่อมต่อ Firebase (ตรวจสอบชื่อไฟล์ config ของคุณด้วย)
import { db } from './firebaseConfig'; 
import { collection, onSnapshot, query } from 'firebase/firestore';

const AdminHomeScreen = ({ onLogout, onGoHome, onGoSOS, onGoSearch, onGoProfile, onGoToSorting }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูล Real-time จากคอลเลกชัน incident_reports
    const q = query(collection(db, 'incident_reports')); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const item = doc.data();
        // ถ้าใน Firebase ไม่มี severity ให้คำนวณจาก count (ตามภาพที่คุณเคยส่งมา)
        let sev = item.severity;
        if (!sev) {
          sev = item.count >= 10 ? 'high' : item.count >= 5 ? 'medium' : 'low';
        }
        return { id: doc.id, ...item, severity: sev };
      });
      setIncidents(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStyle = (sev) => {
    switch (sev) {
      case 'high': return { color: 'rgba(239, 68, 68, 0.4)', solid: '#EF4444', label: 'เสี่ยงสูง' };
      case 'medium': return { color: 'rgba(245, 158, 11, 0.4)', solid: '#F59E0B', label: 'ปานกลาง' };
      default: return { color: 'rgba(250, 204, 21, 0.4)', solid: '#FACC15', label: 'เฝ้าระวัง' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Ksafe Admin</Text>
            <Text style={styles.headerSubtitle}>แดชบอร์ดพิกัดความเสี่ยง</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapWrapper}>
          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#F87C47" />
              <Text style={{ marginTop: 10, color: '#999' }}>กำลังโหลดพิกัด...</Text>
            </View>
          ) : (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: 14.9071,
                longitude: 102.0040,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {incidents.map((item) => {
                const config = getStyle(item.severity);
                // ตรวจสอบพิกัดว่าเป็นตัวเลขหรือไม่
                const lat = parseFloat(item.latitude);
                const lng = parseFloat(item.longitude);

                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <React.Fragment key={item.id}>
                    <Circle center={{ latitude: lat, longitude: lng }} radius={400} fillColor={config.color} strokeColor="transparent" />
                    <Marker coordinate={{ latitude: lat, longitude: lng }}>
                      <View style={[styles.markerDot, { backgroundColor: config.solid }]} />
                      <Callout tooltip onPress={() => onGoToSorting(item.severity)}>
                        <View style={styles.calloutBox}>
                          <Text style={styles.calloutTitle}>{config.label}</Text>
                          <Text style={styles.calloutText}>{item.service_name || 'แจ้งเหตุ SOS'}</Text>
                          <View style={[styles.goBtn, { backgroundColor: config.solid }]}>
                            <Text style={styles.goBtnText}>ดูหน้ารายการ</Text>
                          </View>
                        </View>
                      </Callout>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapView>
          )}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>สรุปรายงานประจำวัน</Text></View>
        <View style={{ paddingHorizontal: 20 }}>
          <ReportRow icon="🚨" title="เหตุเสี่ยงสูง" count={incidents.filter(i => i.severity === 'high').length} />
          <ReportRow icon="⚠️" title="เหตุเฝ้าระวัง" count={incidents.filter(i => i.severity !== 'high').length} />
        </View>
      </ScrollView>

      {/* Admin Footer Navigation */}
      <View style={styles.footer}>
        <FooterTab icon={require('./assets/home (2).png')} active onPress={onGoHome} />
        <FooterTab icon={require('./assets/emergency (1).png')} onPress={onGoSOS} />
        <FooterTab icon={require('./assets/map (1).png')} onPress={onGoSearch} />
        <FooterTab icon={require('./assets/user.png')} onPress={onGoProfile} />
      </View>
    </SafeAreaView>
  );
};

// --- Sub Components ---
const ReportRow = ({ icon, title, count }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={styles.iconBg}><Text>{icon}</Text></View>
      <Text style={styles.rowTitle}>{title}</Text>
    </View>
    <Text style={styles.rowCount}>{count} รายการ</Text>
  </View>
);

const FooterTab = ({ icon, active, onPress }) => (
  <TouchableOpacity style={styles.fBtn} onPress={onPress}>
    <Image source={icon} style={[styles.fIcon, { tintColor: active ? '#F87C47' : '#D1D5DB' }]} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, color: '#666' },
  logoutBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  logoutText: { fontSize: 12, color: '#EF4444', fontWeight: 'bold' },
  mapWrapper: { marginHorizontal: 20, height: 380, borderRadius: 25, overflow: 'hidden', elevation: 4, backgroundColor: '#EEE' },
  map: { ...StyleSheet.absoluteFillObject },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  markerDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: '#FFF' },
  calloutBox: { width: 150, backgroundColor: '#FFF', borderRadius: 15, padding: 12, alignItems: 'center' },
  calloutTitle: { fontWeight: 'bold', fontSize: 13 },
  calloutText: { fontSize: 11, color: '#666', marginVertical: 4 },
  goBtn: { marginTop: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  goBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  sectionHeader: { padding: 25, paddingBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#444' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowCount: { fontSize: 12, color: '#F87C47', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 85, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#F0F0F0', paddingBottom: 20 },
  fBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fIcon: { width: 22, height: 22 }
});

export default AdminHomeScreen;
