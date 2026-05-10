import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';

// ✅ เปลี่ยนมาใช้ Firestore อย่างเดียวตามความต้องการ
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';

const Register = ({ onNext, onBack }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // 1. ตรวจสอบข้อมูลเบื้องต้น
        if (!name || !phone || !password) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (password.length < 6) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);
        try {
            // 2. ตรวจสอบว่าเบอร์โทรศัพท์นี้เคยลงทะเบียนใน Firestore หรือยัง
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("phone_number", "==", phone.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                Alert.alert('แจ้งเตือน', 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว');
                setLoading(false);
                return;
            }

            // 3. บันทึกข้อมูลลง Firestore โดยตรง (เพื่อใช้ตรวจสอบตอน Login)
            const newUser = {
                firstName: name,
                lastName: '',
                phone_number: phone.trim(), // ใช้ key นี้ให้ตรงกับหน้า Login
                password: password,         // เก็บ password ตรงๆ เพื่อใช้เทียบค่าในหน้า Login
                role: 'user',               // กำหนดสิทธิ์เริ่มต้น
                weight: '',
                height: '',
                birthDate: '01/01/2540',
                gender: 'ไม่ระบุ',
                bloodType: 'ไม่ทราบ',
                organDonor: 'ฉันไม่ใช่ผู้บริจาคอวัยวะ',
                aboutMe: 'ไม่มี',
                address: '',
                coordinate: { latitude: 14.8782, longitude: 102.0194 },
                emergencyContact: { name: 'สถานีตำรวจ', phone: '191' },
                profileImage: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                createdAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, 'users'), newUser);

            // 4. ส่งข้อมูลไปหน้าถัดไป
            if (onNext) {
                onNext({ name, phone, password, id: docRef.id });
            }

            Alert.alert('สำเร็จ', 'ลงทะเบียนเรียบร้อยแล้ว');

        } catch (error) {
            console.error("Register Error: ", error);
            Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <Image 
                source={require('./assets/bg.png')} 
                style={styles.headerImage}
                resizeMode="cover"
            />
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <View style={styles.arrowIcon} />
                        </TouchableOpacity>
                        
                        <Text style={styles.headerText}>สร้างบัญชีผู้ใช้</Text>
                        
                        <Text style={styles.label}>ชื่อจริง</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="กรอกชื่อจริง"
                            placeholderTextColor="#C0C0C0"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0XXXXXXXXX"
                            placeholderTextColor="#C0C0C0"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />

                        <Text style={styles.label}>รหัสผ่าน</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="กำหนดรหัสผ่าน (อย่างน้อย 6 ตัว)"
                            placeholderTextColor="#C0C0C0"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity 
                            style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]} 
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>ลงทะเบียน</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
    headerImage: { 
        position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: '40%', 
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40 
    },
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    keyboardView: { flex: 1, justifyContent: 'center' },
    card: { 
        backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, width: '100%', maxWidth: 400, 
        alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 
    },
    backButton: { marginBottom: 10, alignSelf: 'flex-start', padding: 4, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { fontSize: 30, color: '#B0B0B0', fontWeight: 'bold' },
    arrowIcon: {
        width: 12,
        height: 12,
        borderLeftWidth: 2.5,
        borderBottomWidth: 2.5,
        borderColor: '#B0B0B0',
        transform: [{ rotate: '45deg' }],
        marginLeft: 4,
    },
    headerText: { fontSize: 24, fontWeight: 'bold', color: '#F48E54', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
    input: { 
        borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 15, paddingHorizontal: 15, 
        paddingVertical: 12, fontSize: 16, marginBottom: 15, color: '#000'
    },
    primaryButton: { 
        backgroundColor: '#F48E54', borderRadius: 25, paddingVertical: 15, 
        alignItems: 'center', marginTop: 10 
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default Register;
