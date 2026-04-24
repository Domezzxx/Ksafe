import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { db } from './firebaseConfig'; 
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Search, ChevronLeft, Info } from 'lucide-react-native';

const categories = ['ทั้งหมด', 'โรงพยาบาล', 'สถานีตำรวจ', 'กู้ภัย', 'สถานีดับเพลิง'];

export default function SearchScreen({ onBack, goToDetail }) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'facilities'));
    // ใช้ onSnapshot เพื่อให้ข้อมูลเปลี่ยนตาม Admin ทันที (Real-time)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(dataList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredData = locations.filter(item => {
    const itemType = item.ประเภท || '';
    const itemName = item.ชื่อ || '';
    const matchCategory = selectedCategory === 'ทั้งหมด' || itemType === selectedCategory;
    const matchText = itemName.toLowerCase().includes(searchText.toLowerCase().trim());
    return matchCategory && matchText;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><ChevronLeft size={28} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>ค้นหาสถานที่</Text>
      </View>

      <View style={styles.searchSection}>
        <Search size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="ค้นหาสถานที่ใกล้คุณ..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.catWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[styles.catItem, selectedCategory === item && styles.catActive]}
            >
              <Text style={{ color: selectedCategory === item ? '#fff' : '#666' }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F48E54" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.ชื่อ}</Text>
                <Text style={styles.cardAddress} numberOfLines={1}>📍 {item.ที่อยู่}</Text>
                <View style={styles.tag}><Text style={styles.tagText}>{item.ประเภท}</Text></View>
              </View>
              <TouchableOpacity onPress={() => goToDetail(item)} style={styles.infoBtn}>
                <Info size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบข้อมูลสถานที่</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', margin: 20, paddingHorizontal: 15, borderRadius: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  catWrapper: { marginBottom: 15, paddingLeft: 20 },
  catItem: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 10, borderRadius: 20, backgroundColor: '#F0F0F0' },
  catActive: { backgroundColor: '#F48E54' },
  card: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardAddress: { color: '#888', fontSize: 13, marginTop: 4 },
  tag: { backgroundColor: '#FFF2EB', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginTop: 8 },
  tagText: { color: '#F48E54', fontSize: 11, fontWeight: 'bold' },
  infoBtn: { padding: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});