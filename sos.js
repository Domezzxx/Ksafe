import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, PanResponder, Dimensions, SafeAreaView, StatusBar
} from 'react-native';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width * 0.85;
const KNOB_SIZE = 64;

// ใช้ชื่อฟังก์ชันว่า SOSScreen เพื่อให้สื่อความหมาย
export default function sos({ onCancel }) {
  const [isCounting, setIsCounting] = useState(false);
  const [timer, setTimer] = useState(5);
  const pan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval;
    if (isCounting && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      alert("กำลังโทรหาบริการฉุกเฉิน...");
      handleReset();
    }
    return () => clearInterval(interval);
  }, [isCounting, timer]);

  const handleReset = () => {
    setIsCounting(false);
    setTimer(5);
    pan.setValue(0);
    if (onCancel) onCancel(); 
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= SLIDE_WIDTH - KNOB_SIZE - 10) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SLIDE_WIDTH * 0.5) {
          Animated.spring(pan, { toValue: SLIDE_WIDTH - KNOB_SIZE - 10, useNativeDriver: false }).start();
          setIsCounting(true);
        } else {
          Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>SOS ฉุกเฉิน</Text>
          <Text style={styles.subHeader}>สถานีตำรวจภูธรโพธิ์กลาง</Text>
          <Text style={styles.subHeader}>044 211 191</Text>
        </View>

        <View style={styles.centerContent}>
          {isCounting ? (
            <View style={styles.timerContainer}>
              <View style={styles.timerCircle}>
                <Text style={styles.timerNumber}>{timer}</Text>
              </View>
              <Text style={styles.infoText}>
                เราจะโทรหาบริการฉุกเฉิน{"\n"}เมื่อสิ้นสุดเวลานับถอยหลัง
              </Text>
            </View>
          ) : (
             <View style={{ height: 180 }} /> // พื้นที่ว่างรอการนับ
          )}
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.footerNote}>
            โปรดอยู่ในที่ปลอดภัย{"\n"}คุณสามารถยกเลิกได้ก่อนครบเวลา
          </Text>

          {!isCounting ? (
            <View style={styles.slideTrack}>
              <Animated.View
                style={[styles.knob, { transform: [{ translateX: pan }] }]}
                {...panResponder.panHandlers}
              />
              <Text style={styles.slideText}>โทรฉุกเฉิน</Text>
            </View>
          ) : (
            <View style={styles.slideTrackActive}>
               <View style={styles.redFill} />
               <View style={[styles.knob, { position: 'absolute', right: 5 }]} />
            </View>
          )}

          <TouchableOpacity style={styles.cancelArea} onPress={handleReset}>
            <View style={styles.cancelCircle}><Text style={styles.cancelX}>✕</Text></View>
            <Text style={styles.cancelLabel}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF8A48' },
  headerContainer: { alignItems: 'center', paddingTop: 50 },
  headerTitle: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  subHeader: { fontSize: 18, color: '#fff', lineHeight: 26 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerContainer: { alignItems: 'center' },
  timerCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  timerNumber: { fontSize: 90, fontWeight: 'bold', color: '#FF8A48' },
  infoText: { color: '#fff', textAlign: 'center', fontSize: 18, marginTop: 20, fontWeight: '600' },
  bottomSection: { paddingBottom: 40, alignItems: 'center' },
  footerNote: { color: '#fff', textAlign: 'center', marginBottom: 20, fontSize: 14 },
  slideTrack: { width: SLIDE_WIDTH, height: 74, backgroundColor: '#fff', borderRadius: 37, padding: 5, justifyContent: 'center' },
  slideTrackActive: { width: SLIDE_WIDTH, height: 74, backgroundColor: '#ffffffd0', borderRadius: 37, padding: 5, flexDirection: 'row', alignItems: 'center' },
  redFill: { flex: 1, height: 64, backgroundColor: '#FF5E5E', borderRadius: 32 },
  knob: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, zIndex: 10 },
  slideText: { position: 'absolute', right: 40, color: '#FF5E5E', fontSize: 20, fontWeight: 'bold' },
  cancelArea: { marginTop: 20, alignItems: 'center' },
  cancelCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  cancelX: { fontSize: 20, color: '#FF5E5E', fontWeight: 'bold' },
  cancelLabel: { color: '#fff', marginTop: 5, fontSize: 16, fontWeight: '600' },
});