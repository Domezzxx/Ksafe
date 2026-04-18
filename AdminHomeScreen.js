import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Home, AlertCircle, Map as MapIcon, User, Plus, Minus, ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AdminHomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* --- Status Bar Mockup --- */}


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ksafe</Text>
          <Text style={styles.headerSubtitle}>แดชบอร์ด</Text>
        </View>

        {/* --- Stats Cards (ส่วนที่เน้นในรูป) --- */}
        <View style={styles.statsRow}>
          {/* Card ใหญ่ฝั่งซ้าย */}
          <View style={[styles.card, styles.cardMain]}>
            <Text style={styles.cardLabel}>ผู้ใช้ใหม่รายเดือน</Text>
            <Text style={styles.cardValueLarge}>1,284</Text>
          </View>
          
          {/* ฝั่งขวา 2 อันซ้อนกัน */}
          <View style={styles.statsColumn}>
            <View style={[styles.card, styles.cardRed]}>
              <Text style={styles.cardValueSmall}>1,284</Text>
            </View>
            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardLabelSmall}>76 × 34</Text>
              <Text style={styles.cardValueSmall}>1,284</Text>
            </View>
          </View>
        </View>

        {/* --- Heatmap Section --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>พื้นที่ที่เกิดเหตุบ่อยที่สุด</Text>
        </View>
        
        <View style={styles.mapWrapper}>
          <View style={styles.mapCanvas}>
            {/* Heatmap Dots (จำลองตำแหน่งตามรูป) */}
            <View style={[styles.heatDot, { top: '40%', left: '30%', backgroundColor: 'rgba(255, 60, 60, 0.7)', width: 45, height: 45 }]} />
            <View style={[styles.heatDot, { top: '65%', left: '60%', backgroundColor: 'rgba(255, 140, 0, 0.6)', width: 35, height: 35 }]} />
            <View style={[styles.heatDot, { top: '80%', left: '40%', backgroundColor: 'rgba(255, 215, 0, 0.6)', width: 25, height: 25 }]} />
            
            {/* Map Zoom Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.zoomBtn}><Plus size={18} color="#555" /></TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.zoomBtn}><Minus size={18} color="#555" /></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- Summary Reports --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>สรุปรายงานการโทรประจำเดือน</Text>
        </View>
        
        <ReportItem icon="🚔" title="กรมทางหลวงชนบท" count="3 คน" />
        <ReportItem icon="📞" title="สายด่วนตำรวจ" count="120 คน" />
        <ReportItem icon="⚡" title="การไฟฟ้า" count="70 คน" />
        <ReportItem icon="🚑" title="สายด่วน" count="90 คน" />

      </ScrollView>

      {/* --- Bottom Navigation --- */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Home color="#FF8A5B" size={26} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <AlertCircle color="#D1D5DB" size={26} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MapIcon color="#D1D5DB" size={26} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <User color="#D1D5DB" size={26} />
        </TouchableOpacity>
        {/* แถบ Home Indicator ของ iOS */}
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
};

const ReportItem = ({ icon, title, count }) => (
  <TouchableOpacity style={styles.reportRow}>
    <View style={styles.reportLeftSide}>
      <View style={styles.reportIconBg}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={styles.reportTitleText}>{title}</Text>
    </View>
    <Text style={styles.reportCountText}>{count}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  statusBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 25, 
    height: 40, 
    alignItems: 'center' 
  },
  timeText: { fontWeight: 'bold', fontSize: 14 },
  statusText: { fontSize: 12, color: '#000' },
  header: { paddingHorizontal: 25, marginTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 18, color: '#6B7280', marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statsColumn: { flex: 1, gap: 12 },
  card: { borderRadius: 18, padding: 16, justifyContent: 'center' },
  cardMain: { backgroundColor: '#FF8A5B', flex: 1.3, height: 135 },
  cardRed: { backgroundColor: '#FF5C5C', height: 62 },
  cardBlue: { backgroundColor: '#3B82F6', height: 62 },
  cardLabel: { color: '#FFF', fontSize: 13, opacity: 0.9, marginBottom: 8 },
  cardValueLarge: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  cardValueSmall: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  cardLabelSmall: { color: '#FFF', fontSize: 11, textAlign: 'center', opacity: 0.8 },
  sectionHeader: { paddingHorizontal: 25, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#4B5563' },
  mapWrapper: { marginHorizontal: 20, height: 210, borderRadius: 24, overflow: 'hidden', backgroundColor: '#D1FAE5' },
  mapCanvas: { flex: 1, position: 'relative' },
  heatDot: { position: 'absolute', borderRadius: 100 },
  mapControls: { 
    position: 'absolute', right: 12, top: 12, 
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  zoomBtn: { padding: 10, alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#E5E7EB' },
  reportRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 12,
    padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
    elevation: 2
  },
  reportLeftSide: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  reportIconBg: { 
    width: 40, height: 40, borderRadius: 12, 
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' 
  },
  reportTitleText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  reportCountText: { fontSize: 14, fontWeight: 'bold', color: '#6B7280' },
  tabBar: { 
    position: 'absolute', bottom: 0, width: '100%', height: 85, 
    flexDirection: 'row', justifyContent: 'space-around', paddingTop: 15,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  homeIndicator: {
    position: 'absolute', bottom: 8, width: 120, height: 5,
    backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center'
  }
});

export default AdminHomeScreen;
