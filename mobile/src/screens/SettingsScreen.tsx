import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { COLORS, SIZES, FONTS } from '../constants/theme';

export default function SettingsScreen({ onLogout, onBack }: { onLogout: () => void; onBack?: () => void }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Header title="Paramètres" onBack={onBack} />

      <View style={styles.content}>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.background} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Abdelilah Erraguibi</Text>
            <Text style={styles.email}>abdelilah@uniportal.com</Text>
            <Text style={styles.filiere}>Master Ingénierie Logicielle</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Préférences</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color={COLORS.text} />
            <Text style={styles.settingText}>Notifications Push</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={24} color={COLORS.text} />
            <Text style={styles.settingText}>Mode Sombre</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.status.unjustified} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: SIZES.medium,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.extraLarge,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.subtitle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.large,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  email: {
    fontSize: SIZES.font,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  filiere: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: FONTS.bold,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
    color: COLORS.subtitle,
    marginBottom: SIZES.medium,
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: COLORS.card,
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginLeft: SIZES.medium,
  },
  logoutButton: {
    backgroundColor: COLORS.card,
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.extraLarge,
    borderWidth: 1,
    borderColor: '#ffe3e3',
  },
  logoutText: {
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
    color: COLORS.status.unjustified,
    marginLeft: SIZES.small,
  }
});
