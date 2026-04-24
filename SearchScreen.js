import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image, // เพิ่มการ import Image เพื่อใช้ใน Footer
  SafeAreaView
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
    // ดึงข้อมูลจากคอลเลกชัน facilities
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

  // 💡 Filter ข้อมูลโดยอ้างอิงฟิลด์ "ประเภท" และ "ชื่อ" ภาษาไทย
  const filteredData = locations.filter(item => {
    const matchCategory =
      selectedCategory === 'ทั้งหมด' || item.ประเภท === selectedCategory;

    const matchText = (item.ชื่อ || '')
      .toLowerCase()
      .includes(searchText.toLowerCase().trim());

    return matchCategory && matchText;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        
        {/* ส่วนหัว และ ช่องค้นหา */}
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, paddingVertical: 5 }}>
          <Text style={{ fontSize: 18, color: '#ff7a00', fontWeight: '600' }}></Text>
        </TouchableOpacity>

        <TextInput
          placeholder="ค้นหาสถานที่..."
          value={searchText}
          onChangeText={setSearchText}
          style={{
            borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
            padding: 15, marginVertical: 15, fontSize: 16
          }}
        />

        {/* 📂 หมวดหมู่ */}
        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 15, paddingVertical: 8, margin: 4, borderRadius: 20,
                  backgroundColor: selectedCategory === cat ? '#ff7a00' : '#f0f0f0'
                }}
              >
                <Text style={{ 
                  color: selectedCategory === cat ? '#fff' : '#555',
                  fontWeight: selectedCategory === cat ? 'bold' : 'normal'
                }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 📋 รายการสถานที่ */}
        {loading ? (
          <ActivityIndicator size="large" color="#ff7a00" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={{
                backgroundColor: '#f8f8f8', padding: 18, borderRadius: 16, marginBottom: 12,
                borderWidth: 1, borderColor: '#eee'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 17, fontWeight: 'bold', flex: 1, color: '#333' }}>
                    {item.ชื่อ}
                  </Text>
                  <Text style={{ color: '#ff7a00', fontSize: 13, fontWeight: '600' }}>2 กม.</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: '#777', fontSize: 14, flex: 1, marginRight: 10 }} numberOfLines={2}>
                    {item.ที่อยู่}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => goToDetail(item)}
                    style={{
                      width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff',
                      borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 16, color: '#ff7a00', fontWeight: 'bold' }}>i</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{ marginTop: 40, alignItems: 'center' }}>
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
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 85,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 20
  },
  footerButton: { padding: 10, flex: 1, alignItems: 'center' },
  footerIcon: { width: 26, height: 26 }
});
