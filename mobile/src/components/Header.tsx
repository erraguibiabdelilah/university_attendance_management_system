import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
  onProfilePress?: () => void;
  onBack?: () => void;
}

export default function Header({ title = 'UniPortal', onProfilePress, onBack }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const [badgeCount, setBadgeCount] = useState(0);
  const [moduleAlerts, setModuleAlerts] = useState<Record<string, number>>({});

  useEffect(() => { loadBadge(); }, []);

  const loadBadge = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const token = await AsyncStorage.getItem('token');
      if (!token || !username) return;

      const userRes = await fetch(`http://10.181.4.71:8080/api/uca/auth/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) return;
      const user = await userRes.json();

      const absRes = await fetch(`http://10.181.4.71:8080/api/uca/absenceDetail/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!absRes.ok) return;
      const absences = await absRes.json();

      const moduleCount: Record<string, number> = {};
      absences.filter((a: any) => a.estAbsent).forEach((a: any) => {
        const m = a.nomModule || 'inconnu';
        moduleCount[m] = (moduleCount[m] || 0) + 1;
      });

      const alerts = Object.fromEntries(
        Object.entries(moduleCount).filter(([_, c]) => c >= 2)
      );
      setModuleAlerts(alerts);

      // Comparer avec les notifications déjà vues
      const seenKey = `notif_seen_${user.id}`;
      const seenRaw = await AsyncStorage.getItem(seenKey);
      const seen: Record<string, number> = seenRaw ? JSON.parse(seenRaw) : {};

      // Badge = modules avec un nouveau count non encore vu
      const newCount = Object.entries(alerts).filter(
        ([m, c]) => seen[m] !== c
      ).length;
      setBadgeCount(newCount);
    } catch { }
  };

  const handleNotificationPress = async () => {
    if (Object.keys(moduleAlerts).length === 0) {
      Alert.alert('Notifications', 'Aucune alerte d\'absence pour le moment.');
    } else {
      const lines = Object.entries(moduleAlerts)
        .map(([m, c]) => `• ${m} : ${c} absence${c > 1 ? 's' : ''}`).join('\n');
      Alert.alert(
        'Avertissement — Absences',
        `Vous avez dépassé le seuil autorisé d'absences dans les modules suivants :\n\n${lines}\n\nNous vous invitons à régulariser votre situation en soumettant les justificatifs nécessaires dans les meilleurs délais.`,
        [{ text: 'Compris' }]
      );
    }

    // Marquer toutes les alertes actuelles comme vues
    try {
      const username = await AsyncStorage.getItem('username');
      const token = await AsyncStorage.getItem('token');
      if (!token || !username) return;
      const userRes = await fetch(`http://10.181.4.71:8080/api/uca/auth/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) return;
      const user = await userRes.json();
      const seenKey = `notif_seen_${user.id}`;
      await AsyncStorage.setItem(seenKey, JSON.stringify(moduleAlerts));
      setBadgeCount(0);
    } catch { }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + SIZES.base }]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <Text style={styles.logo}>{title}</Text>
      )}
      {onBack && <Text style={styles.logo}>{title}</Text>}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          {badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        {onProfilePress && (
          <TouchableOpacity style={styles.avatar} onPress={onProfilePress}>
            <Ionicons name="person" size={20} color={COLORS.background} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.medium, paddingBottom: SIZES.small,
    backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  logo: { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.primary },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: SIZES.medium, position: 'relative' },
  badge: {
    position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16,
    borderRadius: 8, backgroundColor: COLORS.status.unjustified,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.subtitle,
    justifyContent: 'center', alignItems: 'center',
  },
});
