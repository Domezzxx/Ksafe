import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Image, StyleSheet, ScrollView, ActivityIndicator,
  Alert, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
// ✅ นำเข้า GeoPoint จาก firestore
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, GeoPoint } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { ChevronLeft, Edit3, Trash2, Plus, ChevronDown, MapPin } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 14.9744,
  longitude: 102.0978,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const categories = ['โรงพยาบาล', 'สถานีตำรวจ', 'กู้ภัย', 'สถานีดับเพลิง'];

export default function ManageFacilitiesScreen({ onGoHome, onGoSOS, onGoSearch, onGoProfile }) {
  const [facilities, setFacilities] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [showDropdown, setShowDropdown] = useState(false);

  const [isManageMode, setIsManageMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('โรงพยาบาล');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState(INITIAL_REGION);

  useEffect(() => {
    const q = query(collection(db, "facilities"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setFacilities(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!name || !phone || !address) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ชื่อ: name,
        เบอร์โทร: phone,
        ที่อยู่: address,
        ประเภท: type,
        // ✅ แก้ไขให้บันทึกเป็น GeoPoint
        พิกัด: new GeoPoint(region.latitude, region.longitude),
      };

      if (editId) {
        await updateDoc(doc(db, "facilities", editId), payload);
        Alert.alert("สำเร็จ", "อัปเดตข้อมูลแล้ว");
      } else {
        await addDoc(collection(db, "facilities"), payload);
        Alert.alert("สำเร็จ", "เพิ่มสถานที่ใหม่แล้ว");
      }
      resetForm();
    } catch (error) {
      Alert.alert("ผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(''); setPhone(''); setAddress(''); setEditId(null); setType('โรงพยาบาล');
    setRegion(INITIAL_REGION);
    setIsManageMode(false);
  };

  const openEdit = (item) => {
    setName(item.ชื่อ);
    setPhone(item.เบอร์โทร);
    setAddress(item.ที่อยู่);
    setType(item.ประเภท || 'โรงพยาบาล');
    setEditId(item.id);
    
    if (item.พิกัด) {
      // ✅ ตรวจสอบว่าเป็น GeoPoint หรือ Array แบบเก่า
      let lat = INITIAL_REGION.latitude;
      let lng = INITIAL_REGION.longitude;

      if (item.พิกัด.latitude !== undefined) {
        lat = item.พิกัด.latitude;
        lng = item.พิกัด.longitude;
      } else if (Array.isArray(item.พิกัด)) {
        lat = item.พิกัด[0];
        lng = item.พิกัด[1];
      }

      setRegion({
        ...INITIAL_REGION,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });
    }
    setIsManageMode(true);
  };

  const filteredData = facilities.filter(item => {
    const matchCat = selectedCategory === 'ทั้งหมด' || item.ประเภท === selectedCategory;
    const matchText = (item.ชื่อ || "").toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchText;
  });

  const renderHeader = () => (
    <View style={{ backgroundColor: '#FFF' }}>
      <View style={styles.header}>
        <Text style={styles.brandText}>Ksafe</Text>
        <Text style={styles.titleText}>จัดการสถานที่</Text>
      </View>
      <View style={styles.searchBar}>
        <TextInput 
          placeholder="ค้นหาในรายการ..." 
          style={styles.searchInput} 
          value={searchText} 
          onChangeText={setSearchText} 
        />
      </View>
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowDropdown(!showDropdown)}>
          <Text>{selectedCategory}</Text>
          <ChevronDown size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsManageMode(true)}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.addBtnText}>เพิ่ม</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isManageMode) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          {showDropdown && (
            <View style={styles.dropdownOverlay}>
              <TouchableOpacity style={{flex:1}} onPress={()=>setShowDropdown(false)} />
              <View style={styles.dropdownMenu}>
                <TouchableOpacity onPress={()=>{setSelectedCategory('ทั้งหมด'); setShowDropdown(false);}} style={styles.dropdownItem}><Text>ทั้งหมด</Text></TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity key={cat} onPress={()=>{setSelectedCategory(cat); setShowDropdown(false);}} style={styles.dropdownItem}><Text>{cat}</Text></TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
              <View style={styles.facilityCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.facilityName}>{item.ชื่อ}</Text>
                  <Text style={styles.subText}>📍 {item.ที่อยู่}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}><Edit3 size={18} color="#F48E54" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    Alert.alert("ลบข้อมูล", "ยืนยันการลบ?", [
                      {text: "ยกเลิก"},
                      {text: "ลบ", style:"destructive", onPress: async () => await deleteDoc(doc(db, "facilities", item.id))}
                    ])
                  }} style={[styles.editBtn, {backgroundColor: '#FFEBEB'}]}><Trash2 size={18} color="#FF4444" /></TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </SafeAreaView>
        <View style={styles.footer}>
            <TouchableOpacity onPress={onGoHome}><Image source={require('./assets/home (2).png')} style={[styles.fIcon, {tintColor: '#ccc'}]} /></TouchableOpacity>
            <TouchableOpacity onPress={onGoSOS}><Image source={require('./assets/emergency (1).png')} style={[styles.fIcon, {tintColor: '#ccc'}]} /></TouchableOpacity>
            <TouchableOpacity onPress={onGoSearch}><Image source={require('./assets/map (1).png')} style={[styles.fIcon, {tintColor: '#F48E54'}]} /></TouchableOpacity>
            <TouchableOpacity onPress={onGoProfile}><Image source={require('./assets/user.png')} style={[styles.fIcon, {tintColor: '#ccc'}]} /></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={resetForm}><ChevronLeft size={28} color="#333" /></TouchableOpacity>
          <Text style={styles.formTitle}>{editId ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}</Text>
        </View>
        <ScrollView style={styles.formContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>ปักหมุดบนแผนที่ (ลากหมุดเพื่อเลื่อน)</Text>
          <View style={styles.mapContainer}>
            <MapView 
              style={styles.map} 
              region={region}
              onPress={(e) => setRegion({...region, ...e.nativeEvent.coordinate})}
            >
              <Marker 
                coordinate={region} 
                draggable 
                onDragEnd={(e) => setRegion({...region, ...e.nativeEvent.coordinate})}
              />
            </MapView>
          </View>
          
          <Text style={styles.label}>ชื่อสถานที่</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="ชื่อหน่วยงาน" />

          <Text style={styles.label}>เบอร์โทรติดต่อ</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.label}>ที่อยู่โดยละเอียด</Text>
          <TextInput style={[styles.input, {height: 80}]} value={address} onChangeText={setAddress} multiline placeholder="เลขที่, ถนน, ตำบล..." />

          <Text style={styles.label}>ประเภทบริการ</Text>
          <View style={styles.typeRow}>
            {categories.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setType(cat)} style={[styles.typeTab, type === cat && styles.typeTabActive]}>
                <Text style={{color: type === cat ? '#F48E54' : '#666'}}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>}
          </TouchableOpacity>
          <View style={{height: 50}} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 20 },
  brandText: { fontSize: 22, fontWeight: 'bold' },
  titleText: { fontSize: 18, color: '#666' },
  searchBar: { paddingHorizontal: 20, marginBottom: 10 },
  searchInput: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10, zIndex: 10 },
  dropdownBtn: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', padding: 10, borderRadius: 12 },
  dropdownOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  dropdownMenu: { position: 'absolute', top: 190, left: 20, width: 200, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EEE', elevation: 5 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  addBtn: { backgroundColor: '#F48E54', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 12 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },
  facilityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 10, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  facilityName: { fontWeight: 'bold', fontSize: 16 },
  subText: { color: '#888', fontSize: 13, marginTop: 4 },
  editBtn: { padding: 10, backgroundColor: '#FFF2EB', borderRadius: 10 },
  formHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  formContent: { paddingHorizontal: 20 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 12, backgroundColor: '#FAFAFA' },
  mapContainer: { height: 250, borderRadius: 15, overflow: 'hidden', marginTop: 5 },
  map: { flex: 1 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeTab: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  typeTabActive: { borderColor: '#F48E54', backgroundColor: '#FFF2EB' },
  saveBtn: { backgroundColor: '#F48E54', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  footer: { height: 70, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE' },
  fIcon: { width: 24, height: 24 }
});
