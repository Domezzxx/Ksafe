import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

const Register = ({ onNext, onBack }) => {
    // สร้างกล่องเก็บข้อมูล 3 ช่อง
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* กล่องการ์ดสีขาว */}
                <View style={styles.card}>

                    {/* ⬅️ ปุ่มย้อนกลับ (มุมซ้ายบนของการ์ด) */}
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerText}>สมัครสมาชิก</Text>

                    {/* ช่องใส่ชื่อ นามสกุล */}
                    <Text style={styles.label}>ชื่อ นามสกุล</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="เจ๊มิว พ่อทุกสถาบัน"
                        placeholderTextColor="#C0C0C0"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* ช่องใส่เบอร์โทรศัพท์ */}
                    <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+66 999999999"
                        placeholderTextColor="#C0C0C0"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    {/* ช่องใส่รหัสผ่าน */}
                    <Text style={styles.label}>รหัสผ่าน</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="XXXXXXXXX"
                        placeholderTextColor="#C0C0C0"
                        secureTextEntry={true} // ซ่อนรหัสผ่านเป็นจุดดำๆ
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* ปุ่มถัดไป */}
                    <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
                        <Text style={styles.buttonText}>ถัดไป</Text>
                    </TouchableOpacity>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F48E54', 
        justifyContent: 'center',
        padding: 20,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    paddingTop: 20,

    width: '100%',         // ให้กว้างเต็มพื้นที่ที่กำหนด
    maxWidth: 400,         // ล็อคความกว้างสูงสุดไม่ให้เกิน 400px
    alignSelf: 'center',   // จัดกล่องให้อยู่กึ่งกลางหน้าจอเสมอ

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
    backButton: {
        marginBottom: 10,
        alignSelf: 'flex-start', 
    },
   
    backButtonText: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#B0B0B0', 
        marginTop: -10
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F48E54',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20, 
    },
    primaryButton: {
        backgroundColor: '#F48E54',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10, 
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Register;