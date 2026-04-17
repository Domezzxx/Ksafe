import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2;

// --- ส่วนประกอบย่อย (Reusable Components) ---

const ServiceCard = ({ title, subtitle, icon }) => (
  <TouchableOpacity style={styles.serviceCard}>
    <Image source={icon} style={styles.cardIcon} />
    <Text style={styles.serviceCardTitle}>{title}</Text>
    <Text style={styles.serviceCardSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const ContactItem = ({ title, subtitle, icon }) => (
  <TouchableOpacity style={styles.contactItem}>
    <View style={styles.contactLeft}>
      <Image source={icon} style={styles.contactIcon} />
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <Image source={require('./assets/telephone.png')} style={styles.phoneIcon} />
  </TouchableOpacity>
);

// --- ส่วนเนื้อหาแต่ละหน้า (Page Contents) ---

const EmergencyHome = () => (
  <View style={styles.pageContent}>
    <View style={styles.grid}>
      <ServiceCard title="สถานีตำรวจ" subtitle="แจ้งเหตุด่วนเหตุร้ายกับตำรวจ" icon={require('./assets/police.png')} />
      <ServiceCard title="แพทย์ฉุกเฉิน" 
      subtitle="บริการทางด้านสุขภาพ การส่งเสริม ป้องกัน รักษา และฟื้นฟูสภาวะความเจ็บป่วย" icon={require('./assets/hospital.png')} />
      <ServiceCard title="กู้ภัย กู้ชีพ" 
      subtitle="อุบัติเหตุฉุกเฉิน เหตุเร่งด่วน" icon={require('./assets/rs.png')} />
      <ServiceCard title="เพลิงไหม้" 
      subtitle="แจ้งเหตุเพลิงไหม้" icon={require('./assets/fire.png')} />
    </View>
    <Text style={styles.sectionTitle}>เบอร์ติดต่ออื่นๆ</Text>
    <ContactItem title="สถานีตำรวจ"
    subtitle="แจ้งเหตุด่วนเหตุร้ายกับตำรวจ" icon={require('./assets/police.png')} />
    <ContactItem title="โรงพยาบาล" 
    subtitle="บริการทางด้านสุขภาพ" icon={require('./assets/hospital.png')} />
    <ContactItem title="กู้ภัย กู้ชีพ" 
    subtitle="อุบัติเหตุฉุกเฉิน เหตุเร่งด่วน" icon={require('./assets/rs.png')} />
    <ContactItem title="เพลิงไหม้" 
    subtitle="แจ้งเหตุเพลิงไหม้" icon={require('./assets/fire.png')} />
    <ContactItem title="การไฟฟ้าส่วนภูมิภาค" subtitle="จัดหาและจำหน่ายพลังงานไฟฟ้า" icon={require('./assets/phifa.png')} />
    <ContactItem title="กรมการขนส่งทางบก" 
    subtitle="ดูแล จัดระเบียบ พัฒนาระบบการขนส่งทางถนน" icon={require('./assets/khonsong.png')} />
    <ContactItem title="สายด่วนจราจร" 
    subtitle="ขอความช่วยเหลือบนท้องถนนตลอด 24 ชั่วโมง " icon={require('./assets/jrajon.png')} />
    <ContactItem title="กองปราบ" subtitle="สายด่วนแจ้งเหตุอาชญากรรมเป็นภัยต่อประเทศ " icon={require('./assets/kongparb.png')} />
    <ContactItem title="ตำรวจท่องเที่ยว" subtitle="ดูแลแก่นักท่องเที่ยวทั้งชาวไทยและต่างชาติ " icon={require('./assets/thongtiaw.png')} />
    <ContactItem title="ศูนย์เตือนภัยพิบัติแห่งชาติ" subtitle="เฝ้าระวัง แจ้งเตือนภัยธรรมชาติล่วงหน้า " icon={require('./assets/ppb.png')} />
    <ContactItem title="ร้องเรียนเรื่องรถโดยสารสาธารณะ" subtitle="ร้องเรียนรถโดยสารสาธารณะ (แท็กซี่, รถตู้, ประจำทาง) " icon={require('./assets/bus.png')} />


  </View>
);

const MedicalHome = () => (
  <View style={styles.pageContent}>
    <View style={styles.grid}>
      <ServiceCard title="กู้ภัย กู้ชีพ" 
      subtitle="อุบัติเหตุฉุกเฉิน เหตุเร่งด่วน" icon={require('./assets/rs.png')} />
      <ServiceCard title="แพทย์ฉุกเฉิน" 
      subtitle="เหตุฉุกเฉินเหตุร้าย จากสายด่วนตรวจสอบ" icon={require('./assets/rp.png')} />
      <ServiceCard title="สายด่วนจราจร" subtitle="ขอความช่วยเหลือบนท้องถนนตลอด 24 ชั่วโมง" icon={require('./assets/saildung.png')} />
    </View>
    <Text style={styles.sectionTitle}>เบอร์ติดต่ออื่นๆ</Text>
    <ContactItem title="โรงพยาบาลมหาราชนครราชสีมา" subtitle="ศูนย์การแพทย์ชั้นนำระดับตติยภูมิของภาคอีสาน" icon={require('./assets/Maharat.png')} />
    <ContactItem title="โรงพยาบาลกรุงเทพราชสีมา" subtitle="มาตรฐานบริการระดับสากล เพื่อสุขภาพที่ดีของคุณ" icon={require('./assets/kungthep.png')} />
    <ContactItem title="แจ้งเหตุด่วน" 
    subtitle="บริการปฐมภูมิเบื้องต้น เข้าถึงง่ายเพื่อชาว มทส. " icon={require('./assets/pcu.png')} />
    <ContactItem title="โรงพยาบาลราชสีมา ฮอสพิทอล"
      subtitle="รักษาครบวงจร สะดวกสบาย ใจกลางเมือง เข้าถึงง่ายเพื่อชาว มทส. " icon={require('./assets/rh.png')} />
    <ContactItem title="โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี" subtitle="นวัตกรรมการแพทย์ที่ทันสมัย เพื่อคุณภาพชีวิต" icon={require('./assets/suth.png')} />
    <ContactItem title="โรงพยาบาลริมลิฟวิ่ง" subtitle="ผู้เชี่ยวชาญด้านการฟื้นฟู และการดูแลผู้สูงอายุ เพื่อคุณภาพชีวิต" icon={require('./assets/rim.png')} />
  
  </View>
);

const SafetyHome = () => (
  <View style={styles.pageContent}>
    <View style={styles.grid}>
      <ServiceCard title="กู้ภัย กู้ชีพ" subtitle="อุบัติเหตุฉุกเฉิน เหตุเร่งด่วน" icon={require('./assets/rs.png')} />
      <ServiceCard title="แพทย์ฉุกเฉิน" subtitle="เหตุฉุกเฉินเหตุร้าย จากสายด่วนตรวจสอบ" icon={require('./assets/rp.png')} />
    </View>
    <Text style={styles.sectionTitle}>เบอร์ติดต่ออื่นๆ</Text>
    <ContactItem title="สถานีตำรวจภูธรโพธิ์กลาง" subtitle="พิทักษ์สันติราษฎร์ด้วยใจ พร้อมรับใช้ประชาชนชาวโคราช" icon={require('./assets/poograng.png')} />
    <ContactItem title="สถานีตำรวจภูธรนครราชสีมา" subtitle="ศูนย์รวมความปลอดภัย ใส่ใจทุกการบริการ มาตรฐานสากลเพื่อชาวโคราช" icon={require('./assets/poothonpolice.png')} />

  </View>
);

const UtilityHome = () => (
  <View style={styles.pageContent}>
    <View style={styles.grid}>
      <ServiceCard title="การไฟฟ้าส่วนภูมิภาค" subtitle="จัดหาและจำหน่ายพลังงานไฟฟ้า" icon={require('./assets/phifa.png')} />
      <ServiceCard title="กองปราบ" subtitle="สายด่วนแจ้งเหตุอาชญากรรมเป็นภัยต่อประเทศ" icon={require('./assets/kongparb.png')} />
      <ServiceCard title="ตำรวจท่องเที่ยว" subtitle="ดูแลแก่นักท่องเที่ยวทั้งชาวไทยและต่างชาติ" icon={require('./assets/thongtiaw.png')} />
      <ServiceCard title="ศูนย์เตือนภัยพิบัติแห่งชาติ" subtitle="เฝ้าระวัง แจ้งเตือนภัยธรรมชาติล่วงหน้า " icon={require('./assets/ppb.png')} />
    </View>
    <Text style={styles.sectionTitle}>เบอร์ติดต่ออื่นๆ</Text>
    <ContactItem title="การไฟฟ้าส่วนภูมิภาคเขต 3" subtitle="มาตรฐานบริการด้านพลังงาน สร้างสรรค์ความสว่างไสวให้ภูมิภาค" icon={require('./assets/phifa.png')} />
    <ContactItem title="ชมรมจิตอาสาแสดทอง " 
      subtitle="พลังแห่งการแบ่งปัน สร้างสรรค์ความสุขเพื่อสังคม" icon={require('./assets/sutv.png')} />
    <ContactItem title="ศูนย์กู้ภัยฮุก 31 "
      subtitle="บรรเทาสาธารณภัย มั่นใจในการบริการเคียงข้างทุกข์สุขชาวนครราชสีมา" icon={require('./assets/huk.png')} />
    <ContactItem title="สำนักงานกรมทางหลวงที่ 10 นครราชสีมา "
      subtitle="ประตูสู่เส้นทางที่ปลอดภัย พัฒนาโครงข่ายเพื่อความสะดวกของคนไทย" icon={require('./assets/sumnak.png')} />



  </View>
);

// --- หน้าจอหลัก ---

export default function DashboardScreen({ onGoHome, onGoSOS, onGoSearch, onGoProfile }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['เหตุด่วน', 'การแพทย์', 'ความปลอดภัย', 'สาธารณูปโภค'];

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <EmergencyHome />;
      case 1: return <MedicalHome />;
      case 2: return <SafetyHome />;
      case 3: return <UtilityHome />;
      default: return <EmergencyHome />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ksafe</Text>
        </View>

        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab, index) => (
              <TouchableOpacity key={index} onPress={() => setActiveTab(index)} style={styles.tabItem}>
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {renderContent()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer ดีไซน์ตามภาพและคลิกได้จริง */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={onGoHome}>
          <Image
            source={require('./assets/home (2).png')}
            style={[styles.footerIcon, { tintColor: '#F87C47' }]}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={onGoSOS}>
          <Image
            source={require('./assets/emergency (1).png')}
            style={[styles.footerIcon, { tintColor: '#929292' }]}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={onGoSearch}>
          <Image
            source={require('./assets/map (1).png')}
            style={[styles.footerIcon, { tintColor: '#929292' }]}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={onGoProfile}>
          <Image
            source={require('./assets/user.png')}
            style={[styles.footerIcon, { tintColor: '#D9D9D9' }]}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 25, paddingBottom: 10 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#666' },
  tabsWrapper: { paddingHorizontal: 15, marginBottom: 10 },
  tabItem: { paddingHorizontal: 10, paddingVertical: 5 },
  tabText: { fontSize: 16, color: '#CCC', fontWeight: 'bold' },
  activeTabText: { color: '#666' },
  pageContent: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: {
    width: cardWidth,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    minHeight: 180
  },
  cardIcon: { width: 40, height: 40, marginBottom: 15, resizeMode: 'contain' },
  serviceCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#444', marginBottom: 5 },
  serviceCardSubtitle: { fontSize: 12, color: '#999', lineHeight: 18 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#666', marginVertical: 20 },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10
  },
  contactLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  contactIcon: { width: 35, height: 35, marginRight: 15, resizeMode: 'contain' },
  contactTextContainer: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  contactSubtitle: { fontSize: 11, color: '#999' },
  phoneIcon: { width: 20, height: 20, tintColor: '#666' },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 15
  },
  footerButton: {
    padding: 10,
    flex: 1,
    alignItems: 'center'
  },
  footerIcon: { width: 25, height: 25 }
});