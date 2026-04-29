import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView,
  ScrollView, Dimensions, Image, Linking, Alert
} from 'react-native';
import * as Location from 'expo-location';
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2;

const callNumber = async (phone, serviceTitle, reporterId) => {
  if (!phone) {
    Alert.alert("แจ้งเตือน", "ยังไม่มีเบอร์ติดต่อสำหรับบริการนี้ในระบบ");
    return;
  }
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    let locationData = { latitude: null, longitude: null };
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      locationData.latitude = location.coords.latitude;
      locationData.longitude = location.coords.longitude;
    }
    await addDoc(collection(db, "incident_reports"), {
      service_name: serviceTitle,
      phone_called: phone,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      reporter_id: reporterId || "ไม่ระบุตัวตน",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving location: ", error);
  } finally {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโทรออกได้ในขณะนี้");
    });
  }
};

// --- Render icon จาก URL หรือ local assets ---
const ServiceIcon = ({ imageUrl, style }) => {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={style} />;
  }
  return <Image source={require('./assets/police.png')} style={style} />;
};

const ServiceCard = ({ item, reporterId }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={() => callNumber(item.phone, item.title, reporterId)}>
    <ServiceIcon imageUrl={item.image} style={styles.cardIcon} />
    <Text style={styles.serviceCardTitle}>{item.title}</Text>
    <Text style={styles.serviceCardSubtitle}>{item.subtitle || item.category}</Text>
  </TouchableOpacity>
);

const ContactItem = ({ item, reporterId }) => (
  <TouchableOpacity style={styles.contactItem} onPress={() => callNumber(item.phone, item.title, reporterId)}>
    <View style={styles.contactLeft}>
      <ServiceIcon imageUrl={item.image} style={styles.contactIcon} />
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactTitle}>{item.title}</Text>
        <Text style={styles.contactSubtitle}>{item.subtitle || item.category}</Text>
      </View>
    </View>
    <Image source={require('./assets/telephone.png')} style={styles.phoneIcon} />
  </TouchableOpacity>
);

// --- Tab Pages ---
// เหตุด่วน: สถานีตำรวจ โรงพยาบาล กู้ภัย เพลิงไหม้
const EMERGENCY_CATEGORIES = ['สถานีตำรวจ', 'โรงพยาบาล', 'กู้ภัย', 'เพลิงไหม้'];
// การแพทย์: โรงพยาบาล กู้ภัย
const MEDICAL_CATEGORIES = ['โรงพยาบาล', 'กู้ภัย'];
// ความปลอดภัย: ความปลอดภัย
const SAFETY_CATEGORIES = ['ความปลอดภัย'];
// สาธารณูปโภค: สาธารณูปโภค
const UTILITY_CATEGORIES = ['สาธารณูปโภค'];

const TabPage = ({ items, reporterId }) => {
  const cardItems = items.slice(0, 4);
  const listItems = items;
  return (
    <View style={styles.pageContent}>
      <View style={styles.grid}>
        {cardItems.map((item) => (
          <ServiceCard key={item.id} item={item} reporterId={reporterId} />
        ))}
      </View>
      <Text style={styles.sectionTitle}>เบอร์ติดต่ออื่นๆ</Text>
      {listItems.map((item) => (
        <ContactItem key={item.id + '_list'} item={item} reporterId={reporterId} />
      ))}
    </View>
  );
};

export default function DashboardScreen({ onGoHome, onGoSOS, onGoSearch, onGoProfile, currentUserPhone }) {
  const [activeTab, setActiveTab] = useState(0);
  const [allServices, setAllServices] = useState([]);
  const tabs = ['เหตุด่วน', 'การแพทย์', 'ความปลอดภัย', 'สาธารณูปโภค'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "emergency_services"));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setAllServices(items);
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };
    fetchData();
  }, []);

  const filterByCategories = (categories) =>
    allServices.filter((item) => categories.includes(item.category));

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <TabPage items={filterByCategories(EMERGENCY_CATEGORIES)} reporterId={currentUserPhone} />;
      case 1: return <TabPage items={filterByCategories(MEDICAL_CATEGORIES)} reporterId={currentUserPhone} />;
      case 2: return <TabPage items={filterByCategories(SAFETY_CATEGORIES)} reporterId={currentUserPhone} />;
      case 3: return <TabPage items={filterByCategories(UTILITY_CATEGORIES)} reporterId={currentUserPhone} />;
      default: return <TabPage items={filterByCategories(EMERGENCY_CATEGORIES)} reporterId={currentUserPhone} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ksafe</Text>
        </View>

        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab, index) => (
              <TouchableOpacity key={index} onPress={() => setActiveTab(index)} style={styles.tabItem}>
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {renderContent()}
        <View style={{ height: 100 }} />
      </ScrollView>

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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 25, paddingBottom: 10 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#666' },
  tabsWrapper: { paddingHorizontal: 15, marginBottom: 10 },
  tabItem: { paddingHorizontal: 10, paddingVertical: 5 },
  tabText: { fontSize: 16, color: '#CCC', fontWeight: 'bold' },
  activeTabText: { color: '#666' },
  pageContent: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: {
    width: cardWidth, backgroundColor: '#F5F5F5', borderRadius: 25,
    padding: 20, marginBottom: 15, minHeight: 180
  },
  cardIcon: { width: 40, height: 40, marginBottom: 15, resizeMode: 'contain' },
  serviceCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#444', marginBottom: 5 },
  serviceCardSubtitle: { fontSize: 12, color: '#999', lineHeight: 18 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#666', marginVertical: 20 },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F5F5', padding: 15, borderRadius: 20, marginBottom: 10
  },
  contactLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  contactIcon: { width: 35, height: 35, marginRight: 15, resizeMode: 'contain' },
  contactTextContainer: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  contactSubtitle: { fontSize: 11, color: '#999' },
  phoneIcon: { width: 20, height: 20, tintColor: '#666' },
  footer: {
    position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', width: '100%', height: 80, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 15
  },
  footerButton: { padding: 10, flex: 1, alignItems: 'center' },
  footerIcon: { width: 25, height: 25 }
});
