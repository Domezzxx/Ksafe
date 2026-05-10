import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Image, StyleSheet, ScrollView, ActivityIndicator,
  Alert, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, GeoPoint } from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { Edit3, Trash2, Plus, ChevronDown, Camera, MapPin } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState(INITIAL_REGION);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const isSelectingRef = useRef(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "facilities"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setFacilities(data);
    });
    return () => unsubscribe();
  }, []);

  const GOOGLE_API_KEY = 'AIzaSyCzLA0NWNQk5Iu9AzC0yW1bwQ0Y_KqngSQ';

  // 🔍 ค้นหาที่อยู่ (Debounce 600ms เพื่อประหยัด API)
  const searchLocation = (queryText) => {
    setName(queryText);
    if (isSelectingRef.current || queryText.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        setLoadingLocation(true);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(queryText)}&key=${GOOGLE_API_KEY}&components=country:th&language=th`,
          { headers: { 'User-Agent': 'KsafeApp/1.0' } }
        );
        const data = await response.json();
        setSearchSuggestions(data.predictions || []);
      } catch (error) {
        setSearchSuggestions([]);
      } finally {
        setLoadingLocation(false);
      }
    }, 600);
  };

  // 📍 เลือกสถานที่ และดึงข้อมูลพิกัด + เบอร์โทร
  const selectLocationFromSearch = async (location) => {
    setLoadingLocation(true);
    isSelectingRef.current = true;
    setSearchSuggestions([]); 

    try {
      // ใช้ Place Details API เพื่อดึงข้อมูลเชิงลึก (เบอร์โทร + พิกัด)
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${location.place_id}&fields=geometry,formatted_address,formatted_phone_number&key=${GOOGLE_API_KEY}&language=th`,
        { headers: { 'User-Agent': 'KsafeApp/1.0' } }
      );
      const data = await detailsResponse.json();
      
      if (data.result) {
        const result = data.result;
        const { lat, lng } = result.geometry.location;
        const fullAddress = result.formatted_address;
        const phoneNumber = result.formatted_phone_number || '';

        // 1. เลื่อนแผนที่ไปยังพิกัดใหม่
        setRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        
        // 2. เซตชื่อสถานที่
        setName(location.structured_formatting?.main_text || fullAddress.split(',')[0]);

        // 3. เซตที่อยู่
        setAddress(location.structured_formatting?.secondary_text || fullAddress);

        // 4. เซตเบอร์โทรศัพท์ (ทำความสะอาด format ให้เหลือแต่ตัวเลข)
        if (phoneNumber) {
          setPhone(phoneNumber.replace(/\s+/g, '').replace(/-/g, ''));
        } else {
          setPhone(''); 
        }
      }
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถดึงข้อมูลสถานที่ได้');
    } finally {
      setTimeout(() => { isSelectingRef.current = false; }, 1000);
      setLoadingLocation(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.2,
      base64: true,
    });
    if (!result.canceled) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

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
        พิกัด: new GeoPoint(region.latitude, region.longitude),
        รูปภาพ: image,
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
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert("ยืนยันการลบ", `คุณต้องการลบ "${name}" ใช่หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบข้อมูล",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteDoc(doc(db, "facilities", editId));
            Alert.alert("สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว");
            resetForm();
          } catch (error) {
            Alert.alert("ผิดพลาด", "ไม่สามารถลบข้อมูลได้");
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const resetForm = () => {
    setName(''); setPhone(''); setAddress(''); setEditId(null); setType('โรงพยาบาล');
    setImage(null); setRegion(INITIAL_REGION); setIsManageMode(false);
    setSearchSuggestions([]);
  };

  const openEdit = (item) => {
    setName(item.ชื่อ);
    setPhone(item.เบอร์โทร);
    setAddress(item.ที่อยู่);
    setType(item.ประเภท || 'โรงพยาบาล');
    setImage(item.รูปภาพ || null);
    setEditId(item.id);
    if (item.พิกัด) {
      setRegion({ ...INITIAL_REGION, latitude: item.พิกัด.latitude, longitude: item.พิกัด.longitude });
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
        <TextInput placeholder="ค้นหาหน่วยงาน..." style={styles.searchInput} value={searchText} onChangeText={setSearchText} />
      </View>
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowDropdown(!showDropdown)}>
          <Text>{selectedCategory}</Text>
          <ChevronDown size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsManageMode(true)}>
          <Plus size={20} color="#FFF" /><Text style={styles.addBtnText}>เพิ่ม</Text>
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
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDropdown(false)} />
              <View style={styles.dropdownMenu}>
                <TouchableOpacity onPress={() => { setSelectedCategory('ทั้งหมด'); setShowDropdown(false); }} style={styles.dropdownItem}><Text>ทั้งหมด</Text></TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => { setSelectedCategory(cat); setShowDropdown(false); }} style={styles.dropdownItem}><Text>{cat}</Text></TouchableOpacity>
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
                {item.รูปภาพ ? (
                  <Image source={{ uri: item.รูปภาพ }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' }]}>
                    <Camera size={20} color="#CCC" />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.facilityName} numberOfLines={1}>{item.ชื่อ}</Text>
                  <Text style={styles.subText} numberOfLines={1}>📍 {item.ที่อยู่}</Text>
                </View>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
                  <Edit3 size={18} color="#F48E54" />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </SafeAreaView>
        <View style={styles.footer}>
          <TouchableOpacity onPress={onGoHome}><Image source={require('./assets/home (2).png')} style={[styles.fIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
          <TouchableOpacity onPress={onGoSOS}><Image source={require('./assets/phone-call.png')} style={[styles.fIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
          <TouchableOpacity onPress={onGoSearch}><Image source={require('./assets/map (1).png')} style={[styles.fIcon, { tintColor: '#F48E54' }]} /></TouchableOpacity>
          <TouchableOpacity onPress={onGoProfile}><Image source={require('./assets/user.png')} style={[styles.fIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={resetForm} style={styles.backButton}>
             <View style={styles.arrowIcon} />
          </TouchableOpacity>
          <Text style={styles.formTitle}>{editId ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}</Text>
        </View>
        <ScrollView style={styles.formContent} keyboardShouldPersistTaps="always">

          <Text style={styles.label}>รูปภาพสถานที่</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={40} color="#CCC" />
                <Text style={{ color: '#999' }}>คลิกเพื่อเลือกรูปภาพ</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>ชื่อสถานที่ 🔍 ค้นหาอัตโนมัติ</Text>
          <View style={styles.searchContainer}>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={searchLocation} 
              placeholder="ระบุชื่อสถานที่" 
            />
            {loadingLocation && <ActivityIndicator color="#F48E54" style={{ position: 'absolute', right: 15, top: 12 }} />}
          </View>

          {searchSuggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              {searchSuggestions.map((location, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectLocationFromSearch(location)}
                >
                  <MapPin size={18} color="#F48E54" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionTitle}>{location.structured_formatting?.main_text}</Text>
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>{location.structured_formatting?.secondary_text}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>ปักหมุดบนแผนที่</Text>
          <View style={styles.mapContainer}>
            <MapView 
              style={styles.map} 
              region={region} 
              onPress={(e) => setRegion({ ...region, ...e.nativeEvent.coordinate })}
            >
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} draggable />
            </MapView>
          </View>

          <Text style={styles.label}>เบอร์โทรติดต่อ</Text>
          <TextInput 
            style={styles.input} 
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad" 
            placeholder="0xx-xxx-xxxx" 
          />

          <Text style={styles.label}>ที่อยู่</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            value={address} 
            onChangeText={setAddress} 
            multiline 
            placeholder="รายละเอียดที่อยู่..." 
          />

          <Text style={styles.label}>ประเภทบริการ</Text>
          <View style={styles.typeRow}>
            {categories.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setType(cat)} style={[styles.typeTab, type === cat && styles.typeTabActive]}>
                <Text style={{ color: type === cat ? '#F48E54' : '#666', fontWeight: type === cat ? 'bold' : 'normal' }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>}
          </TouchableOpacity>

          {editId && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading}>
              <Trash2 size={20} color="#FF4444" />
              <Text style={styles.deleteBtnText}>ลบสถานที่นี้</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ height: 50 }} />
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
  facilityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', marginHorizontal: 20, marginBottom: 10, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  cardImage: { width: 60, height: 60, borderRadius: 10 },
  facilityName: { fontWeight: 'bold', fontSize: 16 },
  subText: { color: '#888', fontSize: 13, marginTop: 4 },
  editBtn: { padding: 12, backgroundColor: '#FFF2EB', borderRadius: 12 },
  formHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  backButton: { padding: 4, width: 40 },
  arrowIcon: { width: 12, height: 12, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: '#333', transform: [{ rotate: '45deg' }], marginLeft: 4 },
  formContent: { paddingHorizontal: 20 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 12, backgroundColor: '#FAFAFA' },
  searchContainer: { position: 'relative' },
  suggestionsList: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EEE', marginTop: 5, elevation: 3 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  suggestionTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  suggestionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  imagePicker: { width: '100%', height: 180, backgroundColor: '#F9F9F9', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  mapContainer: { height: 200, borderRadius: 15, overflow: 'hidden', marginTop: 5 },
  map: { flex: 1 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeTab: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  typeTabActive: { borderColor: '#F48E54', backgroundColor: '#FFF2EB' },
  saveBtn: { backgroundColor: '#F48E54', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 15, marginTop: 15, backgroundColor: '#FFF5F5' },
  deleteBtnText: { color: '#FF4444', fontWeight: 'bold', marginLeft: 8 },
  footer: { position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 15 },
  fIcon: { width: 24, height: 24 }
});
