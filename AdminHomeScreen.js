import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
  Alert,
  StatusBar
} from 'react-native';
import { Plus, Minus, LogOut, TrendingUp, Activity, Users } from 'lucide-react-native';

const AdminHomeScreen = ({ onGoHome, onGoSOS, onGoSearch, onGoProfile, onLogout }) => {

  const handleLogout = () => {
    Alert.alert(
      "ยืนยันการออกจากระบบ",
      "คุณต้องการออกจากระบบ Admin ใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        { 
          text: "ออกจากระบบ", 
          onPress: onLogout, 
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Ksafe Admin</Text>
              <Text style={styles.headerSubtitle}>ระบบจัดการแดชบอร์ด</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.card, styles.cardMain]}>
            <View style={styles.cardHeaderIcon}>
              <Users size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.cardLabel}>ผู้ใช้ใหม่รายเดือน</Text>
            <Text style={styles.cardValueLarge}>1,284</Text>
            <View style={styles.trendBadge}>
              <TrendingUp size={12} color="#FFF" />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>

          <View style={styles.statsColumn}>
            <View style={[styles.card, styles.cardRed]}>
              <Text style={styles.cardLabelSmall}>เหตุการณ์ด่วน</Text>
              <Text style={styles.cardValueSmall}>42</Text>
            </View>
            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardLabelSmall}>สรุปเหตุการณ์</Text>
              <Text style={styles.cardValueSmall}>856</Text>
            </View>
          </View>
        </View>

        {/* Map Visualization */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Activity size={18} color="#4B5563" />
            <Text style={styles.sectionTitle}>พื้นที่เฝ้าระวังพิเศษ</Text>
          </View>
        </View>

        <View style={styles.mapWrapper}>
          <View style={styles.mapCanvas}>
            {/* Simulated Heatmap Dots */}
            <View style={[styles.heatDot, { top: '35%', left: '25%', backgroundColor: 'rgba(239, 68, 68, 0.6)', width: 60, height: 60 }]} />
            <View style={[styles.heatDot, { top: '60%', left: '55%', backgroundColor: 'rgba(249, 115, 22, 0.5)', width: 45, height: 45 }]} />
            
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.zoomBtn}><Plus size={18} color="#4B5563" /></TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.zoomBtn}><Minus size={18} color="#4B5563" /></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reports Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>สรุปรายงานสายด่วน</Text>
        </View>
        
        <ReportItem icon="🚔" title="กรมทางหลวง" count="3 ครั้ง" subtitle="อุบัติเหตุบนท้องถนน" />
        <ReportItem icon="📞" title="สายด่วนตำรวจ" count="120 ครั้ง" subtitle="รับแจ้งเหตุด่วนเหตุร้าย" />

      </ScrollView>

      {/* Navigation Footer */}
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

const ReportItem = ({ icon, title, count, subtitle }) => (
  <View style={styles.reportRow}>
    <View style={styles.reportLeftSide}>
      <View style={styles.reportIconBg}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.reportTitleText}>{title}</Text>
        <Text style={styles.reportSubtitleText}>{subtitle}</Text>
      </View>
    </View>
    <View style={styles.countBadge}>
      <Text style={styles.reportCountText}>{count}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 25, paddingTop: 15, marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 2 },
  logoutBtn: { 
    width: 45, 
    height: 45, 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statsColumn: { flex: 1, gap: 12 },
  card: { borderRadius: 24, padding: 16, justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  cardMain: { backgroundColor: '#F87C47', flex: 1.3, height: 160, position: 'relative', overflow: 'hidden' },
  cardRed: { backgroundColor: '#EF4444', height: 74 },
  cardBlue: { backgroundColor: '#3B82F6', height: 74 },
  cardHeaderIcon: { marginBottom: 10 },
  cardLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' },
  cardLabelSmall: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 2 },
  cardValueLarge: { color: '#FFF', fontSize: 38, fontWeight: '800' },
  cardValueSmall: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  trendText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  sectionHeader: { paddingHorizontal: 25, marginTop: 30, marginBottom: 15 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#374151' },
  mapWrapper: { marginHorizontal: 20, height: 200, borderRadius: 28, overflow: 'hidden', backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#FFF' },
  mapCanvas: { flex: 1, backgroundColor: '#D1D5DB' },
  heatDot: { position: 'absolute', borderRadius: 100 },
  mapControls: { position: 'absolute', right: 15, top: 15, backgroundColor: '#FFF', borderRadius: 12, elevation: 3 },
  zoomBtn: { padding: 12, alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 20, elevation: 1 },
  reportLeftSide: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  reportIconBg: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  reportTitleText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  reportSubtitleText: { fontSize: 12, color: '#9CA3AF' },
  countBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  reportCountText: { fontSize: 13, fontWeight: '800', color: '#4B5563' },
  footer: { position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: 90, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: 25, elevation: 20 },
  footerButton: { padding: 10, flex: 1, alignItems: 'center' },
  footerIcon: { width: 26, height: 26 }
});

export default AdminHomeScreen;
