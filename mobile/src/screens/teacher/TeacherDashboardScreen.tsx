import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPRING_API = 'http://10.181.4.71:8080/api/uca';

const P = {
  mahogany: '#622B14', bronze: '#995F2F',
  cream: '#FFF8F6', card: '#FFFFFF',
  text: '#1E0E08', muted: '#9E7060',
  border: '#F0E4DC', light: '#FDF5F0',
};
const shadow = { shadowColor: '#622B14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 };

interface Absence {
  id: number;
  nomModule: string;
  filiere: string;
  promo: string;
  typeSeance: string;
  date: string;
  absenceDetails: { estAbsent: boolean }[];
}

interface Props { teacherName?: string; teacherId?: number; onTabPress?: (tab: string) => void; }

export default function TeacherDashboardScreen({ teacherName = 'Professeur', teacherId, onTabPress }: Props) {
  const insets = useSafeAreaInsets();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const id = teacherId ?? (await AsyncStorage.getItem('teacherId'));
    if (!id) { setLoading(false); return; }
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${SPRING_API}/absence/teacher/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAbsences(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, [teacherId]);

  const recent = [...absences]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={P.mahogany} />}
      >
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Bonjour,</Text>
            <Text style={s.name}>{teacherName}</Text>
          </View>
          <View style={s.avatarContainer}>
            <Ionicons name="person" size={24} color={P.mahogany} />
          </View>
        </View>

        <View style={s.welcomeCard}>
          <Text style={s.welcomeTitle}>Prêt pour aujourd'hui ?</Text>
          <Text style={s.welcomeText}>
            Gérez vos séances et scannez les présences facilement depuis votre tableau de bord.
          </Text>
          <View style={s.welcomeIconBg}>
            <Feather name="calendar" size={32} color={P.mahogany} />
          </View>
        </View>

        {/* Actions rapides */}
        <Text style={s.sectionTitle}>Actions rapides</Text>
        <View style={s.actionsGrid}>
          {[
            { bg: '#FFEDDF', icon: 'camera'      as const, color: P.mahogany, label: 'Nouvelle Séance (Scan)',   tab: 'scan'     },
            { bg: '#E8F5E9', icon: 'list'         as const, color: '#2E7D32',  label: 'Historique des absences', tab: 'absences' },
            { bg: '#E3F2FD', icon: 'stats-chart'  as const, color: '#1565C0',  label: 'Statistiques globales',   tab: 'stats'    },
            { bg: '#F3E5F5', icon: 'person'       as const, color: '#6A1B9A',  label: 'Mon profil',              tab: 'profile'  },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={s.actionCard} onPress={() => onTabPress?.(item.tab)} activeOpacity={0.75}>
              <View style={[s.iconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={s.actionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dernières séances dynamiques */}
        <Text style={s.sectionTitle}>Dernières séances</Text>
        <View style={s.activityCard}>
          {loading ? (
            <ActivityIndicator color={P.mahogany} style={{ paddingVertical: 20 }} />
          ) : recent.length === 0 ? (
            <Text style={s.empty}>Aucune séance enregistrée</Text>
          ) : (
            recent.map((item, i) => {
              const absentCount = (item.absenceDetails ?? []).filter(d => d.estAbsent).length;
              return (
                <View key={item.id} style={[s.activityRow, i === recent.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[s.activityDot, { backgroundColor: i === 0 ? P.mahogany : P.bronze }]} />
                  <View style={s.activityContent}>
                    <Text style={s.activityTitle}>{item.nomModule} ({item.filiere})</Text>
                    <Text style={s.activityTime}>{formatDate(item.date)} · {item.typeSeance} · {item.promo}</Text>
                  </View>
                  <View style={s.badge}>
                    <Text style={s.badgeTxt}>{absentCount} absent{absentCount !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: P.cream },
  scroll:          { paddingHorizontal: 20, paddingBottom: 30 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 25 },
  greeting:        { fontSize: 14, color: P.muted, marginBottom: 4 },
  name:            { fontSize: 24, fontWeight: 'bold', color: P.text },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: P.border, justifyContent: 'center', alignItems: 'center' },
  welcomeCard:     { backgroundColor: P.mahogany, borderRadius: 16, padding: 24, marginBottom: 24, position: 'relative', overflow: 'hidden', ...shadow },
  welcomeTitle:    { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  welcomeText:     { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20, maxWidth: '80%' },
  welcomeIconBg:   { position: 'absolute', right: -10, bottom: -10, backgroundColor: 'rgba(255,255,255,0.15)', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  sectionTitle:    { fontSize: 16, fontWeight: 'bold', color: P.text, marginBottom: 12 },
  actionsGrid:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  actionCard:      { width: '48%', backgroundColor: P.card, borderRadius: 14, padding: 16, marginBottom: 14, ...shadow },
  iconBox:         { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText:      { fontSize: 13, fontWeight: '600', color: P.text, lineHeight: 18 },
  activityCard:    { backgroundColor: P.card, borderRadius: 14, padding: 16, ...shadow },
  activityRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.light },
  activityDot:     { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle:   { fontSize: 14, fontWeight: '600', color: P.text, marginBottom: 4 },
  activityTime:    { fontSize: 12, color: P.muted },
  badge:           { backgroundColor: '#FFF0E8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTxt:        { fontSize: 11, fontWeight: '600', color: '#8B2500' },
  empty:           { textAlign: 'center', color: P.muted, paddingVertical: 20, fontSize: 13 },
});
