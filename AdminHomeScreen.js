import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image
} from 'react-native';
import { Plus, Minus, LayoutDashboard, PhoneCall, MapPinned, UserCog } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AdminHomeScreen = ({ onGoHome, onGoSOS, onGoSearch, onGoProfile }) => {

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ksafe Admin</Text>
          <Text style={styles.headerSubtitle}>ระบบจัดการแดชบอร์ด</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.card, styles.cardMain]}>
            <Text style={styles.cardLabel}>ผู้ใช้ใหม่รายเดือน</Text>
            <Text style={styles.cardValueLarge}>1,284</Text>
          </View>

          <View style={styles.statsColumn}>
            <View style={[styles.card, styles.cardRed]}>
              <Text style={styles.cardValueSmall}>1,284</Text>
            </View>
            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardLabelSmall}>สรุปเหตุการณ์</Text>
              <Text style={styles.cardValueSmall}>1,284</Text>
            </View>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>พื้นที่เฝ้าระวังพิเศษ</Text>
        </View>

        <View style={styles.mapWrapper}>
          <View style={styles.mapCanvas}>
            <View style={[styles.heatDot, { top: '40%', left: '30%', backgroundColor: 'rgba(255, 60, 60, 0.7)', width: 45, height: 45 }]} />
            <View style={[styles.heatDot, { top: '65%', left: '60%', backgroundColor: 'rgba(255, 140, 0, 0.6)', width: 35, height: 35 }]} />
            
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.zoomBtn}><Plus size={18} color="#555" /></TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.zoomBtn}><Minus size={18} color="#555" /></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reports */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>สรุปรายงานสายด่วน</Text>
        </View>
        <ReportItem icon="🚔" title="กรมทางหลวง" count="3 ครั้ง" />
        <ReportItem icon="📞" title="สายด่วนตำรวจ" count="120 ครั้ง" />

      </ScrollView>

      {/* 🛠️ FOOTER ใหม่สำหรับ ADMIN (แยกจาก USER) */}
      <View style={styles.footer}>
              <TouchableOpacity style={styles.footerButton} onPress={onGoHome}>
                <Image source={require('./assets/home (2).png')} style={[styles.footerIcon, { tintColor: '#F87C47' }]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={onGoSOS}>
                <Image source={require('./assets/emergency (1).png')} style={[styles.footerIcon, { tintColor: '#929292' }]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={onGoSearch}>
                <Image source={require('./assets/map (1).png')} style={[styles.footerIcon, { tintColor: '#929292' }]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={onGoProfile}>
                <Image source={require('./assets/user.png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} />
              </TouchableOpacity>
            </View>
          
    </SafeAreaView>
  );
};

const ReportItem = ({ icon, title, count }) => (
  <View style={styles.reportRow}>
    <View style={styles.reportLeftSide}>
      <View style={styles.reportIconBg}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
      <Text style={styles.reportTitleText}>{title}</Text>
    </View>
    <Text style={styles.reportCountText}>{count}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 25, marginTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 18, color: '#6B7280' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statsColumn: { flex: 1, gap: 12 },
  card: { borderRadius: 18, padding: 16, justifyContent: 'center' },
  cardMain: { backgroundColor: '#F48E54', flex: 1.3, height: 135 },
  cardRed: { backgroundColor: '#EF4444', height: 62 },
  cardBlue: { backgroundColor: '#3B82F6', height: 62 },
  cardLabel: { color: '#FFF', fontSize: 13, marginBottom: 8 },
  cardValueLarge: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  cardValueSmall: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  cardLabelSmall: { color: '#FFF', fontSize: 11, textAlign: 'center' },
  sectionHeader: { paddingHorizontal: 25, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#4B5563' },
  mapWrapper: { marginHorizontal: 20, height: 180, borderRadius: 24, overflow: 'hidden', backgroundColor: '#E5E7EB' },
  mapCanvas: { flex: 1, position: 'relative' },
  heatDot: { position: 'absolute', borderRadius: 100 },
  mapControls: { position: 'absolute', right: 12, top: 12, backgroundColor: '#FFF', borderRadius: 10 },
  zoomBtn: { padding: 10, alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#E5E7EB' },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 16 },
  reportLeftSide: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  reportIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  reportTitleText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  reportCountText: { fontSize: 14, fontWeight: 'bold', color: '#6B7280' },
  
  // 🚀 ADMIN FOOTER STYLES
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 15
  },
  footerButton: { padding: 10, flex: 1, alignItems: 'center' },
  footerIcon: { width: 25, height: 25 }
});

export default AdminHomeScreen;
