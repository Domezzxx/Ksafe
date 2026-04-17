import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image
} from 'react-native';

const Success = ({ onNext }) => {
    return (
        <View style={styles.mainContainer}>
            <Image 
                source={require('./assets/bg.png')} 
                style={styles.headerImage}
                resizeMode="cover"
            />

            <SafeAreaView style={styles.container}>
                <View style={styles.card}>
                    
                    {/* ไอคอนติ๊กถูก (ใช้ Text หรือถ้านำเข้ารูปติ๊กถูกมาใส่แทนก็ได้ครับ) */}
                    <View style={styles.iconCircle}>
                        <Text style={styles.checkIcon}>✓</Text>
                    </View>

                    <Text style={styles.headerText}>สมัครสมาชิกสำเร็จ</Text>
                    <Text style={styles.subText}>
                        คุณสามารถเข้าสู่ระบบเพื่อ{'\n'}เริ่มต้นใช้งานได้ทันที
                    </Text>

                    <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
                        <Text style={styles.buttonText}>ไปหน้าเข้าสู่ระบบ</Text>
                    </TouchableOpacity>
                    
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '50%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',         
    maxWidth: 400,         
    alignSelf: 'center',   
    alignItems: 'center', // 💡 หน้า Success จัดให้อยู่ตรงกลางทั้งหมด
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50', // สีเขียวแสดงความสำเร็จ
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkIcon: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F48E54',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#F48E54',
    borderRadius: 25,
    paddingVertical: 15,
    width: '100%', // ให้ปุ่มกว้างเต็มการ์ด
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Success;
