import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; 
import { Edit2, Plus, Search, Trash2, ChevronDown } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const categories = ['สถานีตำรวจ', 'โรงพยาบาล', 'กู้ภัย', 'เพลิงไหม้', 'สาธารณูปโภค', 'ความปลอดภัย'];

export default function ManageContactScreen({
  onGoHome,
  onGoSOS,
  onGoSearch,
  onGoProfile
}) {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [showDropdown, setShowDropdown] = useState(false); // ✅ สถานะการเปิด/ปิด Dropdown

  const [isManageMode, setIsManageMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [category, setCategory] = useState('กู้ภัย'); 
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "emergency_services"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id });
      });
      setContacts(data);
    }, (error) => console.error("Firestore Error:", error));

    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('สิทธิ์การเข้าถึง', 'เราต้องการสิทธิ์เข้าถึงคลังภาพ');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, 
      });
      if (result.canceled) return;
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: 'base64',
      });
      setImage(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      Alert.alert("Error", "เกิดปัญหาขณะเลือกรูป: " + error.message);
    }
  };

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setLoading(true);
    try {
      const payload = { 
        title: name.trim(), 
        phone: phone.trim(), 
        category: category, 
        image: image || "", 
        updatedAt: new Date().toISOString()
      };
      if (editId) {
        await updateDoc(doc(db, "emergency_services", editId), payload);
        Alert.alert("สำเร็จ", "แก้ไขข้อมูลเรียบร้อย");
      } else {
        await addDoc(collection(db, "emergency_services"), payload);
        Alert.alert("สำเร็จ", "เพิ่มข้อมูลใหม่เรียบร้อย");
      }
      resetForm();
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบข้อมูลหน่วยงานนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: async () => {
        try {
          await deleteDoc(doc(db, "emergency_services", id));
          Alert.alert("สำเร็จ", "ลบข้อมูลเรียบร้อย");
        } catch (e) {
          Alert.alert("Error", e.message);
        }
      }}
    ]);
  };

  const resetForm = () => {
    setName(''); setPhone(''); setCategory('กู้ภัย'); setImage(null);
    setEditId(null); setIsManageMode(false); setShowDropdown(false);
  };

  const openEdit = (item) => {
    setName(item.title || ""); 
    setPhone(item.phone || ""); 
    setCategory(item.category || "กู้ภัย");
    setImage(item.image || null); 
    setEditId(item.id); 
    setIsManageMode(true);
  };

  const filteredData = contacts.filter(item => {
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    const matchText = (item.title || "").toLowerCase().includes(searchText.toLowerCase().trim());
    return matchCategory && matchText;
  });

  // --- UI ส่วนแสดงรายการ (List Mode) ---
  if (!isManageMode) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* ส่วนหัว */}
          <View style={styles.header}>
                  <Text style={styles.brandText}>Ksafe</Text>
                  <Text style={styles.titleText}>จัดการเบอร์สถานที่</Text>
                </View>

          {/* แถบค้นหา */}
          <View style={styles.searchBar}>
                  <TextInput 
                    placeholder="ค้นหาในรายการ..." 
                    style={styles.searchInput} 
                    value={searchText} 
                    onChangeText={setSearchText} 
                  />
                </View>

          {/* ✅ ส่วน Dropdown Filter (เหมือนหน้า Facilities) */}
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.dropdownBtn} 
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.dropdownBtnText}>{selectedCategory}</Text>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsManageMode(true)}>
              <Plus size={20} color="#FFF" />
              <Text style={styles.addBtnText}>เพิ่มหน่วยงาน</Text>
            </TouchableOpacity>
          </View>

          {/* Overlay สำหรับแสดงรายการ Dropdown */}
          {showDropdown && (
            <View style={styles.dropdownOverlay}>
              <TouchableOpacity style={{flex: 1}} onPress={() => setShowDropdown(false)} />
              <View style={styles.dropdownMenu}>
                <TouchableOpacity 
                  onPress={() => { setSelectedCategory('ทั้งหมด'); setShowDropdown(false); }} 
                  style={styles.dropdownItem}
                >
                  <Text style={selectedCategory === 'ทั้งหมด' ? styles.activeText : null}>ทั้งหมด</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    onPress={() => { setSelectedCategory(cat); setShowDropdown(false); }} 
                    style={styles.dropdownItem}
                  >
                    <Text style={selectedCategory === cat ? styles.activeText : null}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 150 }}
            renderItem={({ item }) => (
  <View style={styles.facilityCard}>
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.cardImage} />
    ) : (
      <View style={[styles.cardImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
        <Image source={require('./assets/user.png')} style={{ width: 24, height: 24, tintColor: '#CCC' }} />
      </View>
    )}
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.facilityName} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.phoneText}>{item.phone}</Text>
      <View style={styles.tag}><Text style={styles.tagText}>{item.category}</Text></View>
    </View>
    <View style={{ flexDirection: 'row', gap: 5 }}>
      <TouchableOpacity style={styles.editBtnAction} onPress={() => openEdit(item)}>
        <Edit2 size={18} color="#F48E54" />
      </TouchableOpacity>
    </View>
  </View>
)}
          />
        </SafeAreaView>
        
        {/* Footer Navigation */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={onGoHome}><Image source={require('./assets/home (2).png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={onGoSOS}><Image source={require('./assets/phone-call.png')} style={[styles.footerIcon, { tintColor: '#F87C47' }]} /></TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={onGoSearch}><Image source={require('./assets/map (1).png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={onGoProfile}><Image source={require('./assets/user.png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- UI ส่วนแบบฟอร์ม (Manage Mode) ---
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity onPress={resetForm} style={styles.backHeader}>
            <View style={styles.arrowIcon} />
            <Text style={styles.backText}>{editId ? 'แก้ไขข้อมูล' : 'เพิ่มหน่วยงานใหม่'}</Text>
          </TouchableOpacity>
          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อหน่วยงาน (Title)</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="เช่น ตำรวจท่องเที่ยว" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เบอร์โทรศัพท์ (Phone)</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="เช่น 1155" keyboardType="phone-pad" />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เลือกหมวดหมู่ (Category)</Text>
              <View style={styles.radioGroup}>
                {categories.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.radioOption, category === cat && styles.radioActive]}>
                    <Text style={[styles.radioText, { color: category === cat ? '#fff' : '#666' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.label}>รูปภาพประกอบ</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImg} />
              ) : (
                <View style={{alignItems: 'center'}}>
                    <View style={styles.plusCircle}><Plus size={28} color="#F48E54" /></View>
                    <Text style={{color: '#999', marginTop: 12}}>เลือกรูปภาพหน่วยงาน</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: loading ? '#ccc' : '#F48E54' }]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>}
            </TouchableOpacity>

                      {/* ✅ เพิ่มปุ่มลบ เฉพาะกรณีที่เป็นการแก้ไขข้อมูลเดิม */}
                      {editId && (
                        <TouchableOpacity 
                          style={styles.deleteBtn} 
                          onPress={() => handleDelete(editId)}
                          disabled={loading}
                        >
                          <Trash2 size={20} color="#FF4444" />
                          <Text style={styles.deleteBtnText}>ลบสถานที่นี้</Text>
                        </TouchableOpacity>
                      )}

            <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
                <Text style={{ color: '#999' }}>ยกเลิกและย้อนกลับ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerArea: { paddingHorizontal: 25, marginTop: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, paddingHorizontal: 15, borderRadius: 16, marginBottom: 15, elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 15, color: '#333' },
  
  // ✅ Dropdown Styles (จากตัวอย่างที่คุณให้มา)
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10, zIndex: 10 },
  dropdownBtn: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  dropdownBtnText: { color: '#333', fontWeight: '500' },
  dropdownOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  dropdownMenu: { position: 'absolute', top: 215, left: 20, width: 220, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EEE', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  activeText: { color: '#F48E54', fontWeight: 'bold' },
  addBtn: { backgroundColor: '#F48E54', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 12, elevation: 2 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },

  facilityCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F5F5', 
    marginHorizontal: 20, 
    marginBottom: 10, 
    padding: 15, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#F0F0F0' 
  },
  cardImage: { width: 60, height: 60, borderRadius: 10 }, // แก้จาก avatar เป็น cardImage ให้ขนาดเท่ากัน
  facilityName: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' }, // ใช้ชื่อเดียวกับหน้า Facilities
  phoneText: { color: '#F48E54', fontSize: 14, fontWeight: '500', marginTop: 2 },
  tag: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  tagText: { fontSize: 11, color: '#EF4444', fontWeight: 'bold' },
  editBtnAction: { padding: 12, backgroundColor: '#FFF2EB', borderRadius: 12 },
  
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  radioOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10, marginBottom: 10 },
  radioActive: { backgroundColor: '#F48E54', borderColor: '#F48E54' },
  radioText: { fontSize: 14, fontWeight: '600' },
  
  backHeader: { marginHorizontal: 25, marginTop: 20, marginBottom: 25, flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 20, color: '#0f0f0f', fontWeight: 'bold', marginLeft: 10 },
  arrowIcon: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#0f0f0f',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  formArea: { paddingHorizontal: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB', color: '#333' },
  imagePicker: { height: 200, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#F48E54', backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 30, overflow: 'hidden' },
  plusCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  previewImg: { width: '100%', height: '100%' },
  saveButton: { padding: 20, borderRadius: 20, alignItems: 'center', elevation: 4 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  deleteLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, padding: 10 },
  cancelBtn: { marginTop: 5, alignItems: 'center', padding: 15 },
  
  footer: { position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 15 },
  footerButton: { padding: 10, flex: 1, alignItems: 'center' },
  footerIcon: { width: 25, height: 25 },
   header: { padding: 20 },
  brandText: { fontSize: 22, fontWeight: 'bold' },
  titleText: { fontSize: 18, color: '#666' },
searchBar: { paddingHorizontal: 20, marginBottom: 10 },
  searchInput: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12 },
  deleteBtn: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15, 
    borderRadius: 15, 
    marginTop: 15, 
    borderWidth: 1,
    borderColor: '#FFEBEB',
    backgroundColor: '#FFF5F5'
  },
  deleteBtnText: { color: '#FF4444', fontWeight: 'bold', marginLeft: 8 },
});
