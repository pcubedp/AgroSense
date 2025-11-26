// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeStackProps, RootTabParamList } from '../navigation/AppNavigator';
import { useI18n } from '../i18n';

type HomeScreenProps = HomeStackProps<'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t, lang, setLang } = useI18n() as any;
  const goToTab = (screenName: keyof RootTabParamList) => navigation.navigate('MainTabs', { screen: screenName });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.greetingText}>👋 {lang === 'en' ? 'Welcome' : 'नमस्ते'}, Farmer</Text>
        <Text style={styles.greetingSub}>{t('subHeader')}</Text>
      </View>

      <Image source={{ uri: 'https://placehold.co/1200x600/2d6a4f/ffffff?text=AgroSense' }} style={styles.bannerImage} resizeMode="cover" />

      <View style={styles.cards}>
        <TouchableOpacity style={[styles.card, styles.cardPrimary]} activeOpacity={0.9} onPress={() => goToTab('Scanner')}>
          <Ionicons name="scan-circle" size={42} color="#fff" />
          <Text style={styles.cardTitle}>{t('takePhoto')}</Text>
          <Text style={styles.cardDesc}>{t('subHeader')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.cardSecondary]} activeOpacity={0.9} onPress={() => goToTab('Dashboard')}>
          <MaterialCommunityIcons name="chart-bell-curve" size={42} color="#fff" />
          <Text style={styles.cardTitle}>{t('viewDashboard')}</Text>
          <Text style={styles.cardDesc}>{t('recommendations')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.langToggle} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}>
        <Text style={styles.langToggleText}>{t('language')}: {lang === 'en' ? 'English' : 'हिन्दी'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4faf6', paddingHorizontal: 18, paddingTop: Platform.OS === 'ios' ? 18 : 12 },
  headerBox: { marginBottom: 16 },
  greetingText: { fontSize: 28, fontWeight: '800', color: '#174c2f' },
  greetingSub: { color: '#51636a', marginTop: 6, fontSize: 15 },
  bannerImage: { width: '100%', height: 160, borderRadius: 14, marginBottom: 18 },
  cards: { flexDirection: 'column', gap: 14 },
  card: { borderRadius: 14, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  cardPrimary: { backgroundColor: '#1b6b39' },
  cardSecondary: { backgroundColor: '#ef7b23' },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 10 },
  cardDesc: { color: '#f7f7f7', marginTop: 6, opacity: 0.95 },
  langToggle: { position: 'absolute', bottom: 18, alignSelf: 'center' },
  langToggleText: { color: '#666' },
});

export default HomeScreen;
