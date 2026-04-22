import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';

// ตรวจสอบชื่อไฟล์ config ของคุณ
import { db } from './firebaseConfig'; 
import { collection, onSnapshot, query } from 'firebase/firestore';

const categories = ['ทั้งหมด', 'โรงพยาบาล', 'สถานีตำรวจ', 'กู้ภัย', 'สถานีดับเพลิง'];

export default function SearchScreen({ onBack, goToDetail }) {
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
      console.log("Data from Firebase:", dataList); // เพิ่ม log เพื่อเช็คข้อมูลใน console
      setLocations(dataList);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 💡 แก้ไข Filter ให้ตรงกับฟิลด์ "ประเภท" และ "ชื่อ" ใน Firebase
  const filteredData = locations.filter(item => {
    const matchCategory =
      selectedCategory === 'ทั้งหมด' || item.ประเภท === selectedCategory;

    const matchText = (item.ชื่อ || '')
      .toLowerCase()
      .includes(searchText.toLowerCase().trim());

    return matchCategory && matchText;
  });

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      
      {/* ส่วนหัว และ ช่องค้นหา */}
      <TouchableOpacity onPress={onBack} style={{ marginTop: 40, paddingVertical: 5 }}>
        <Text style={{ fontSize: 18 }}>← กลับ</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="ค้นหาสถานที่..."
        value={searchText}
        onChangeText={setSearchText}
        style={{
          borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
          padding: 12, marginVertical: 15
        }}
      />

      {/* 📂 หมวดหมู่ */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, margin: 5, borderRadius: 20,
              backgroundColor: selectedCategory === cat ? '#ff7a00' : '#eee'
            }}
          >
            <Text style={{ color: selectedCategory === cat ? '#fff' : '#333' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📋 รายการสถานที่ */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff7a00" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: '#f2f2f2', padding: 15, borderRadius: 16, marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {/* 💡 เปลี่ยนจาก item.name เป็น item.ชื่อ */}
                <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1 }}>
                  {item.ชื่อ}
                </Text>
                <Text style={{ color: '#666', fontSize: 13 }}>2 กิโลเมตร</Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                {/* 💡 เปลี่ยนจาก item.address เป็น item.ที่อยู่ */}
                <Text style={{ color: '#888', fontSize: 13, flex: 1 }} numberOfLines={2}>
                  {item.ที่อยู่}
                </Text>
                
                <TouchableOpacity
                  onPress={() => goToDetail(item)}
                  style={{
                    width: 28, height: 28, borderRadius: 14, borderWidth: 1,
                    borderColor: '#999', justifyContent: 'center', alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 14 }}>i</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>ไม่พบข้อมูล</Text>
          }
        />
      )}
    </View>
  );
}
