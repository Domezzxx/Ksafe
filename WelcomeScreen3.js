import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const WelcomeScreen3 = ({ onNext, onBack }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.centerContent}>
                {/* รูปไอคอนกากบาทสีส้ม */}
                <Image
                    source={require('./assets/logo3.png')} // 💡 อย่าลืมหารูปกากบาทมาใส่ใน assets นะครับ
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.titleText}>ข้อมูลติดต่อฉุกเฉิน</Text>

                <Text style={styles.descriptionText}>
                    เพิ่มข้อมูลติดต่อฉุกเฉินไว้ในแอพของเรา หากเกิดอะไรขึ้นมาผู้ช่วยเหลือของคุณก็ยังมีข้อมูลติดต่อกับคนที่ใกล้ชิดของคุณได้
                </Text>
            </View>

            {/* ⬅️ ปุ่มย้อนกลับ */}
            <TouchableOpacity style={[styles.arrowButton, styles.leftButton]} onPress={onBack}>
                <Text style={styles.buttonText}>←</Text>
            </TouchableOpacity>

            {/* ➡️ ปุ่มไปข้างหน้า (ไปหน้า Home) */}
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
    logo: { width: 220, height: 220, marginBottom: 30 },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 15,
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

export default WelcomeScreen3;