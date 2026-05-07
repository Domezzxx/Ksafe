import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Edit2, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ManageUserScreen({ onGoHome, onGoSOS, onGoSearch, onGoProfile }) {
  const [users, setUsers] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('ไม่ระบุ');
  const [bloodType, setBloodType] = useState('ไม่ทราบ');
  const [organDonor, setOrganDonor] = useState('ฉันไม่ใช่ผู้บริจาคอวัยวะ');
  const [aboutMe, setAboutMe] = useState('');
  const [address, setaddress] = useState('');

  const [contactName, setContactName] = useState('ไม่มีข้อมูล');
  const [contactPhone, setContactPhone] = useState('ไม่มีข้อมูล');
  const [contactDesc, setContactDesc] = useState('ไม่มีข้อมูล');

  useEffect(() => {
    if (!db) return;

    // ดึงข้อมูล Users
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => { data.push({ ...doc.data(), id: doc.id }); });
      setUsers(data);
    }, (error) => console.error("Users Firestore Error:", error));

    // ดึงข้อมูล Emergency Contacts
    const qEmergency = query(collection(db, "emergencyContact"));
    const unsubEmergency = onSnapshot(qEmergency, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => { 
        // เก็บ docId ไว้ด้วยเผื่อกรณีที่ฟิลด์ id ภายในไม่ตรงกับชื่อเอกสาร
        data.push({ ...doc.data(), docId: doc.id }); 
      });
      setEmergencyContacts(data);
    }, (error) => console.error("EmergencyContact Firestore Error:", error));

    return () => { unsubUsers(); unsubEmergency(); };
  }, []);

  const handleUpdate = async () => {
    if (!firstName) { Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อ"); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", selectedUserId), {
        firstName, lastName, weight, height, birthDate,
        gender, bloodType, organDonor, aboutMe, address,
        updatedAt: new Date().toISOString()
      });
      Alert.alert("สำเร็จ", "อัปเดตข้อมูลผู้ใช้เรียบร้อย");
      setIsEditMode(false);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert("ยืนยัน", "คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?", [
      { text: "ยกเลิก" },
      {
        text: "ลบ", style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", selectedUserId));
            setIsEditMode(false);
          } catch (e) { Alert.alert("Error", e.message); }
        }
      }
    ]);
  };

  const openEdit = (user) => {
    setSelectedUserId(user.id);
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setWeight(user.weight || '');
    setHeight(user.height || '');
    setBirthDate(user.birthDate || '');
    setGender(user.gender || 'ไม่ระบุ');
    setBloodType(user.bloodType || 'ไม่ทราบ');
    setOrganDonor(user.organDonor || 'ฉันไม่ใช่ผู้บริจาคอวัยวะ');
    setAboutMe(user.aboutMe || '');
    setaddress(user.address || '');

    // ✅ ค้นหา Contact โดยตรวจสอบทั้งฟิลด์ id และ docId ของเอกสาร
    const contact = emergencyContacts.find(c => 
        (c.id === user.id) || (c.docId === user.id)
    );

    if (contact) {
      setContactName(contact.name || 'ไม่ระบุชื่อ');
      setContactPhone(contact.phone || 'ไม่ระบุเบอร์');
      setContactDesc(contact.desc || 'ไม่มีรายละเอียด');
    } else {
      setContactName('ไม่มีข้อมูล');
      setContactPhone('ไม่มีข้อมูล');
      setContactDesc('ไม่มีข้อมูล');
    }

    setIsEditMode(true);
  };

  const filteredUsers = users.filter(u =>
    (u.firstName || "").toLowerCase().includes(searchText.toLowerCase()) ||
    (u.phone || "").includes(searchText)
  );

  if (!isEditMode) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.brandText}>Ksafe</Text>
            <Text style={styles.titleText}>จัดการผู้ใช้</Text>
          </View>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.userPhone}>{item.phone}</Text>
                </View>
                <TouchableOpacity style={styles.editIconBtn} onPress={() => openEdit(item)}>
                  <Edit2 size={16} color="#000" />
                </TouchableOpacity>
              </View>
            )}
          />
        </SafeAreaView>
        {/* Footer Navigation */}
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.footerButton} onPress={onGoHome}><Image source={require('./assets/home (2).png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
                  <TouchableOpacity style={styles.footerButton} onPress={onGoSOS}><Image source={require('./assets/emergency (1).png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
                  <TouchableOpacity style={styles.footerButton} onPress={onGoSearch}><Image source={require('./assets/map (1).png')} style={[styles.footerIcon, { tintColor: '#D9D9D9' }]} /></TouchableOpacity>
                  <TouchableOpacity style={styles.footerButton} onPress={onGoProfile}><Image source={require('./assets/user.png')} style={[styles.footerIcon, { tintColor: '#F87C47' }]} /></TouchableOpacity>
                </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setIsEditMode(false)} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 100 }}>
          <Text style={styles.editTitle}>แก้ไขข้อมูลผู้ใช้</Text>

          <Text style={styles.sectionLabel}>ไอดีผู้ใช้งาน</Text>
          <View style={[styles.selectBox, { backgroundColor: '#F3F4F6' }]}><Text>{selectedUserId}</Text></View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionLabel}>ข้อมูลทั่วไป</Text>
            <View style={styles.row}>
              <View style={[styles.inputBox, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.floatLabel}>ชื่อ</Text>
                <TextInput value={firstName} onChangeText={setFirstName} style={styles.inputStyle} />
              </View>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Text style={styles.floatLabel}>นามสกุล</Text>
                <TextInput value={lastName} onChangeText={setLastName} style={styles.inputStyle} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputBox, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.floatLabel}>น้ำหนัก</Text>
                <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.inputStyle} />
              </View>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Text style={styles.floatLabel}>ส่วนสูง</Text>
                <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.inputStyle} />
              </View>
            </View>

            <Text style={styles.sectionLabel}>วัน/เดือน/ปีเกิด</Text>
            <View style={styles.inputBox}>
              <TextInput value={birthDate} onChangeText={setBirthDate} placeholder="01/01/25XX" style={styles.inputStyle} />
              <Calendar size={18} color="#666" style={{ position: 'absolute', right: 15, bottom: 15 }} />
            </View>

            <Text style={styles.sectionLabel}>เพศ</Text>
            <View style={styles.selectBox}><Text>{gender}</Text></View>

            <Text style={styles.sectionLabel}>กรุ๊ปเลือด</Text>
            <View style={styles.selectBox}><Text>{bloodType}</Text></View>

            <Text style={styles.sectionLabel}>สถานะบริจาคอวัยวะ</Text>
            <View style={styles.selectBox}><Text>{organDonor}</Text></View>

            <Text style={styles.sectionLabel}>ข้อมูลสุขภาพ (โรคประจำตัว)</Text>
            <View style={[styles.inputBox, { height: 80 }]}>
              <TextInput multiline value={aboutMe} onChangeText={setAboutMe} style={styles.inputStyle} />
            </View>

            <Text style={styles.sectionLabel}>ที่อยู่</Text>
            <View style={[styles.inputBox, { height: 60 }]}>
              <TextInput multiline value={address} onChangeText={setaddress} style={styles.inputStyle} />
            </View>


            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>บันทึก</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>ลบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20 },
  brandText: { fontSize: 22, fontWeight: 'bold' },
  titleText: { fontSize: 18, color: '#666' },
  searchBar: { paddingHorizontal: 20, marginBottom: 10 },
  searchInput: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  cardInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600' },
  userPhone: { color: '#F48E54', marginTop: 4, fontWeight: '500' },
  editIconBtn: { padding: 8, backgroundColor: '#FFEDD5', borderRadius: 8 },
  backBtn: { paddingHorizontal: 25, marginTop: 10 },
  backArrow: { fontSize: 24, color: '#999' },
  editTitle: { fontSize: 26, fontWeight: 'bold', marginTop: 10, marginBottom: 20 },
  formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 2, marginBottom: 20 },
  sectionLabel: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 15, marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 10 },
  inputBox: { borderWidth: 1, borderColor: '#F48E54', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#fff', minHeight: 55 },
  floatLabel: { fontSize: 12, color: '#999' },
  inputStyle: { fontSize: 16, color: '#000', marginTop: 2 },
  selectBox: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 15, backgroundColor: '#fff', marginBottom: 5 },
  
  // สไตล์สำหรับ Card ข้อมูลฉุกเฉิน
  emergencyContactCard: { marginTop: 20, padding: 15, backgroundColor: '#FFF7ED', borderRadius: 16, borderWidth: 1, borderColor: '#FFEDD5' },
  emergencyLabel: { fontSize: 15, fontWeight: 'bold', color: '#F48E54', marginBottom: 10 },
  contactInfoRow: { marginBottom: 8 },
  contactSubLabel: { fontSize: 12, color: '#666' },
  contactValueText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  buttonRow: { flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' },
  saveBtn: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: 12, flex: 1, marginRight: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  deleteBtn: { backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 12, flex: 1, alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  footer: { position: 'absolute', bottom: 15, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 15 },
  footerButton: { padding: 10, flex: 1, alignItems: 'center' },
  footerIcon: { width: 25, height: 25 }
});
