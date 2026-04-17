import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';

const categories = [
  'ทั้งหมด',
  'โรงพยาบาล',
  'สถานีตำรวจ',
  'กู้ภัย',
  'สถานีดับเพลิง'
];

export const HOSPITAL_DATA = [
  {
    id: '1',
    name: 'รพ.มทส. (อาคารรัตนเวชพัฒน์)',
    type: 'โรงพยาบาล', // 💡 แนะนำให้เพิ่ม type เข้าไปด้วยเพื่อให้กด Filter หมวดหมู่ได้
    address: '111 หมู่ที่ 6 ถนน มหาวิทยาลัย...',
    latitude: 14.86407184979161,
    longitude: 102.03567048715242, 
    phone: '044 376 555',
    distance: 'ห่างไป 2 กม.',
  },
  {
    id: '2',
    name: 'สถานีดับเพลิงสุรนารายณ์',
    type: 'สถานีดับเพลิง', // 💡 เพิ่ม type
    address: '80 ถนนสุรนารายณ์ ต.ในเมือง...',
    latitude: 14.981622812371958, 
    longitude: 102.1090519035791,
    phone: '044 255 026',
    distance: 'ห่างไป 5 กม.',
  },
  {
    id: '3',
    name: 'สถานีตำรวจบางนา',
    type: 'สถานีตำรวจ',
    address: 'ถนนบางนา กรุงเทพฯ',
    distance: '1.2 กิโลเมตร'
  },
  {
    id: '4',
    name: 'สถานีตำรวจปทุมวัน',
    type: 'สถานีตำรวจ',
    address: 'ถนนพระราม 1 กรุงเทพฯ',
    distance: '3 กิโลเมตร'
  },
  {
    id: '5',
    name: 'มูลนิธิกู้ภัยร่วมกตัญญู',
    type: 'กู้ภัย',
    address: 'สมุทรปราการ',
    distance: '4 กิโลเมตร'
  },
  {
    id: '6',
    name: 'สถานีดับเพลิงบางรัก',
    type: 'สถานีดับเพลิง',
    address: 'ถนนเจริญกรุง กรุงเทพฯ',
    distance: '2.5 กิโลเมตร'
  }
];

export default function SearchScreen({ onBack, goToDetail }) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  // 💡 แก้ไขจาก data เป็น HOSPITAL_DATA
  const filteredData = HOSPITAL_DATA.filter(item => {
    const matchCategory =
      selectedCategory === 'ทั้งหมด' || item.type === selectedCategory;

    const matchText = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase().trim());

    return matchCategory && matchText;
  });

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>

      {/* 🔙 กลับ */}
      <TouchableOpacity onPress={onBack} style={{ marginTop: 40, paddingVertical: 5 }}>
        <Text style={{ fontSize: 18 }}>← กลับ</Text>
      </TouchableOpacity>

      {/* 🔍 ค้นหา */}
      <TextInput
        placeholder="ค้นหาสถานที่..."
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 12,
          padding: 12,
          marginVertical: 15
        }}
      />

      {/* 📂 หมวดหมู่ */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              margin: 5,
              borderRadius: 20,
              backgroundColor:
                selectedCategory === cat ? '#ff7a00' : '#eee'
            }}
          >
            <Text
              style={{
                // 💡 แก้ไขลบลูกน้ำ (,) ที่เกินมาออกให้แล้ว
                color: selectedCategory === cat ? '#fff' : '#333'
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📋 รายการ */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: '#f2f2f2',
              padding: 15,
              borderRadius: 16,
              marginBottom: 12,
              marginTop: 1
            }}
          >
            {/* 🔹 แถวบน */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  flex: 1,
                  paddingRight: 10
                }}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <Text style={{ color: '#666', fontSize: 13 }}>
                {item.distance}
              </Text>
            </View>

            {/* 🔹 แถวล่าง */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 6
            }}>
              <Text
                style={{
                  color: '#888',
                  fontSize: 13,
                  flex: 1,
                  paddingRight: 10
                }}
                numberOfLines={2}
              >
                {item.address}
              </Text>

              <TouchableOpacity
                onPress={() => goToDetail(item)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#999',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 14 }}>i</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}