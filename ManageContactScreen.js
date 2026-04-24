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
  SafeAreaView
} from 'react-native';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // นำ storage ออกถ้าไม่ได้ใช้ เพื่อลดความซับซ้อน
import { Edit2, Plus, Search } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const categories = ['โรงพยาบาล', 'สถานีตำรวจ', 'กู้ภัย', 'สถานีดับเพลิง','อื่นๆ'];

export default function ManageContactScreen({
  onGoHome,
  onGoSOS,
  onGoSearch,
  onGoProfile
}) {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  const [isManageMode, setIsManageMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('กู้ภัย'); 
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "emergency_contacts"));
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
    console.log("--- เริ่มขั้นตอนเลือกรูปภาพ ---");
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
        quality: 0.2, // ลดคุณภาพเพื่อประหยัดพื้นที่ Firestore (Limit 1MB)
      });

      if (result.canceled) return;

      console.log("เลือกรูปสำเร็จ URI:", result.assets[0].uri);

      // ✅ แก้ไข: ใช้ encoding: 'base64' เป็น string เพื่อเลี่ยงปัญหา Property Undefined
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: 'base64',
      });
      
      const fullBase64 = `data:image/jpeg;base64,${base64}`;
      setImage(fullBase64);
      console.log("--- แปลง Base64 สำเร็จพร้อมบันทึก ---");

    } catch (error) {
      console.error("❌ Error pickImage:", error);
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
        name: name.trim(), 
        phone_number: phone.trim(), 
        category: category, 
        image: image || "", // เก็บ Base64 ลง Firestore คอลัมน์ image
        updatedAt: new Date().toISOString()
      };

      if (editId) {
        await updateDoc(doc(db, "emergency_contacts", editId), payload);
        Alert.alert("สำเร็จ", "แก้ไขข้อมูลเรียบร้อย");
      } else {
        await addDoc(collection(db, "emergency_contacts"), payload);
        Alert.alert("สำเร็จ", "เพิ่มข้อมูลใหม่เรียบร้อย");
      }
      
      resetForm();
    } catch (error) {
      console.error("Firestore Save Error:", error);
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(''); setPhone(''); setCategory('กู้ภัย'); setImage(null);
    setEditId(null); setIsManageMode(false);
  };

  const openEdit = (item) => {
    setName(item.name); setPhone(item.phone_number); setCategory(item.category);
    setImage(item.image); setEditId(item.id); setIsManageMode(true);
  };

  const filteredData = contacts.filter(item => {
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    const matchText = (item.name || "").toLowerCase().includes(searchText.toLowerCase().trim());
    return matchCategory && matchText;
  });

  // --- ส่วนการ Render (UI) คงเดิมตามที่คุณส่งมา ---
  if (!isManageMode) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.headerArea}>
            <Text style={styles.headerTitle}>Ksafe</Text>
            <Text style={styles.headerSubtitle}>จัดการเบอร์ติดต่อฉุกเฉิน</Text>
          </View>
          <View style={styles.searchContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="ค้นหาหน่วยงาน..."
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.catContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {['ทั้งหมด', ...categories].map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[styles.catButton, selectedCategory === cat && styles.catActive]}
                >
                  <Text style={[styles.catText, { color: selectedCategory === cat ? '#fff' : '#666' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardInner}>
                  <Image 
                    source={item.image ? { uri: item.image } : require('./assets/user.png')} 
                    style={styles.avatar} 
                  />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.phoneText}>{item.phone_number}</Text>
                    <View style={styles.tag}><Text style={styles.tagText}>{item.category}</Text></View>
                  </View>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Edit2 size={18} color="#F48E54" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity style={styles.fab} onPress={() => setIsManageMode(true)}>
            <Plus size={30} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={onGoHome}><Image source={require('./assets/home (2).png')} style={[styles.footerIcon, { tintColor: '#929292' }]} /></TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={onGoSOS}><Image source={require('./assets/emergency (1).png')} style={[styles.footerIcon, { tintColor: '#F87C47' }]} /></TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={onGoSearch}><Image source={require('./assets/map (1).png')} style={[styles.footerIcon, { tintColor: '#929292' }]} /></TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={onGoProfile}><Image source={require('./assets/user.png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity onPress={resetForm} style={styles.backHeader}>
            <Text style={styles.backText}>← {editId ? 'แก้ไขข้อมูลหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}</Text>
          </TouchableOpacity>
          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อหน่วยงาน</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="เช่น โรงพยาบาล..." />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เบอร์โทรศัพท์</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="เช่น 1669" keyboardType="phone-pad" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เลือกหมวดหมู่</Text>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerArea: { paddingHorizontal: 25, marginTop: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, paddingHorizontal: 15, borderRadius: 16, marginBottom: 20, elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 15, color: '#333' },
  catContainer: { paddingLeft: 20, marginBottom: 25 },
  catButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 25, marginRight: 10, elevation: 2 },
  catActive: { backgroundColor: '#F48E54' },
  catText: { fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', marginBottom: 15, borderRadius: 24, elevation: 4 },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  avatar: { width: 65, height: 65, borderRadius: 18, backgroundColor: '#F3F4F6' },
  nameText: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  phoneText: { color: '#F48E54', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  tag: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  tagText: { fontSize: 11, color: '#EF4444', fontWeight: 'bold' },
  editBtn: { padding: 12, backgroundColor: '#FFF7ED', borderRadius: 15 },
  fab: { position: 'absolute', right: 25, bottom: 120, backgroundColor: '#F48E54', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  radioOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10, marginBottom: 10 },
  radioActive: { backgroundColor: '#F48E54', borderColor: '#F48E54' },
  radioText: { fontSize: 14, fontWeight: '600' },
  backHeader: { marginHorizontal: 25, marginTop: 20, marginBottom: 25 },
  backText: { fontSize: 20, color: '#F48E54', fontWeight: 'bold' },
  formArea: { paddingHorizontal: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB', color: '#333' },
  imagePicker: { height: 200, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#F48E54', backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 30, overflow: 'hidden' },
  plusCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  previewImg: { width: '100%', height: '100%' },
  saveButton: { padding: 20, borderRadius: 20, alignItems: 'center', elevation: 4 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cancelBtn: { marginTop: 20, alignItems: 'center', padding: 15 },
  footer: { position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 15 },
  footerButton: { padding: 10, flex: 1, alignItems: 'center' },
  footerIcon: { width: 25, height: 25 }
});
