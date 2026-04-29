import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';

// ตรวจสอบชื่อไฟล์ config ของคุณ
import { db } from './firebaseConfig'; 
import { collection, onSnapshot, query } from 'firebase/firestore';

// อัปเดตหมวดหมู่ให้ตรงกับข้อมูลในระบบ
const categories = ['ทั้งหมด', 'โรงพยาบาล', 'สถานีตำรวจ', 'กู้ภัย', 'สถานีดับเพลิง'];

export default function SearchScreen({ onBack, onGoHome, onGoSOS, onGoSearch, onGoProfile, goToDetail }) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'facilities'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const dataList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLocations(dataList);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredData = locations.filter(item => {
    const matchCategory =
      selectedCategory === 'ทั้งหมด' || item.ประเภท === selectedCategory;

    const matchText = (item.ชื่อ || '')
      .toLowerCase()
      .includes(searchText.toLowerCase().trim());

    return matchCategory && matchText;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
             {/* ใส่ Text หรือ Icon ย้อนกลับได้ที่นี่ */}
          </TouchableOpacity>
<View style={styles.header}>
                  <Text style={styles.brandText}>Ksafe</Text>
                  <Text style={styles.titleText}>ค้นหาสถานที่</Text>
                </View>
          <TextInput
            placeholder="ค้นหาสถานที่..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
            style={styles.searchInput}
          />

          {/* 📂 หมวดหมู่ */}
          <View style={styles.categoryWrapper}>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: selectedCategory === cat ? '#ff7a00' : '#f0f0f0' }
                  ]}
                >
                  <Text style={[
                    styles.categoryText,
                    { 
                      color: selectedCategory === cat ? '#fff' : '#555',
                      fontWeight: selectedCategory === cat ? 'bold' : 'normal'
                    }
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 📋 รายการสถานที่ */}
        {loading ? (
          <ActivityIndicator size="large" color="#ff7a00" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.ชื่อ}
                  </Text>
                  <Text style={styles.distanceText}>2 กม.</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={styles.cardAddress} numberOfLines={2}>
                    {item.ที่อยู่}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => goToDetail(item)}
                    style={styles.infoButton}
                  >
                    <Text style={styles.infoButtonText}>i</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ color: '#999', fontSize: 16 }}>ไม่พบข้อมูลที่ค้นหา</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* 🧭 Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={onGoHome}>
          <Image source={require('./assets/home (2).png')} style={[styles.footerIcon, { tintColor: '#929292' }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={onGoSOS}>
          <Image source={require('./assets/emergency (1).png')} style={[styles.footerIcon, { tintColor: '#929292' }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={onGoSearch}>
          <Image source={require('./assets/map (1).png')} style={[styles.footerIcon, { tintColor: '#F87C47' }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={onGoProfile}>
          <Image source={require('./assets/user.png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10, // เพิ่มระยะห่างจากขอบบน
  },
  backButton: {
    paddingVertical: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: '#fcfcfc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryWrapper: {
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110, // เว้นระยะให้ไม่โดน Footer บัง
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // เพิ่มเงาให้ดูสวยงามและมีมิติ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  distanceText: {
    color: '#ff7a00',
    fontSize: 13,
    fontWeight: '600',
  },
  cardAddress: {
    color: '#777',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 16,
    color: '#ff7a00',
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 90, // ปรับความสูง Footer ให้พอดี
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 25, // ดันไอคอนขึ้นเพื่อหลบขอบล่างของ iPhone
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  header: { padding: 10 },
  brandText: { fontSize: 22, fontWeight: 'bold' },
  titleText: { fontSize: 15, color: '#666' },
  
});
