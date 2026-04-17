import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const WelcomeScreen2 = ({ onNext, onBack }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.centerContent}>
                {/* รูปไอคอนรถพยาบาล */}
                <Image
                    source={require('./assets/logo2.png')} // อย่าลืมใส่ไฟล์ในโฟลเดอร์ assets
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.titleText}>หมดปัญหาเรื่องโทรผิด</Text>

                <Text style={styles.descriptionText}>
                    เรามีข้อมูลติดต่อสายด่วนเฉพาะทางที่พร้อมให้บริการช่วยเหลือคุณตลอดเวลา
                    การใช้งานก็ง่ายเพียงแค่กดความช่วยเหลือที่ต้องการ เท่านี้ก็รอคุยกับเจ้าหน้าที่ได้เลย
                </Text>
            </View>

            {/* ⬅️ ปุ่มย้อนกลับ (มุมซ้ายล่าง) */}
            <TouchableOpacity style={[styles.arrowButton, styles.leftButton]} onPress={onBack}>
                <Text style={styles.buttonText}>←</Text>
            </TouchableOpacity>

            {/* ➡️ ปุ่มไปข้างหน้า (มุมขวาล่าง) */}
            <TouchableOpacity style={[styles.arrowButton, styles.rightButton]} onPress={onNext}>
                <Text style={styles.buttonText}>→</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logo: { width: 250, height: 250, marginBottom: 30 },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    arrowButton: {
        position: 'absolute',
        bottom: 25,
        right: 30,
        width: 60,
        height: 50,
        borderRadius: 40,
        backgroundColor: '#f3ece5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftButton: { left: 30 },  // ชิดซ้าย
    rightButton: { right: 30 }, // ชิดขวา
    buttonText: { fontSize: 35, fontWeight: 'bold', marginTop: -12 }
});

export default WelcomeScreen2