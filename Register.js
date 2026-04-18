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

import { db } from './firebaseConfig';
import { 
    doc, 
    runTransaction, 
    Timestamp, 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    limit 
} from 'firebase/firestore';

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

        // --- เริ่มต้นกระบวนการรัน ID และส่งข้อมูล ---
        setLoading(true);
        try {
            // ดึงข้อมูล ID ล่าสุดมาเพื่อเตรียมความพร้อม (หรือจะไปรันในหน้า OTP ก็ได้)
            // แต่ในโครงสร้างนี้เราจะส่งข้อมูลผู้ใช้ไปรอที่หน้า OTP ก่อน
            
            const userData = {
                name: name,
                phone: phone,
                password: password
            };

            // 2. ส่งข้อมูลออกไปผ่าน props onNext เพื่อไปหน้า OTP
            // หมายเหตุ: การบันทึก Firebase จริงๆ ควรเกิดขึ้นหลังจากยืนยัน OTP สำเร็จในหน้าถัดไป
            if (onNext) {
                onNext(userData);
            }

        } catch (error) {
            console.error("Register Error: ", error);
            Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการเตรียมข้อมูล');
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
                            <Text style={styles.backButtonText}>←</Text>
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
                            placeholder="กำหนดรหัสผ่าน"
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
    backButton: { marginBottom: 10, alignSelf: 'flex-start' },
    backButtonText: { fontSize: 30, color: '#B0B0B0', fontWeight: 'bold' },
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
