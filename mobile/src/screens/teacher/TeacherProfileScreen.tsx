import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_URL = 'http://10.181.4.71:8080/api/uca';
const P = { mahogany: '#622B14', cream: '#FFF8F6', card: '#FFFFFF', text: '#1E0E08', muted: '#9E7060', border: '#F0E4DC' };

interface TeacherProfile { id: number; firstName: string; lastName: string; username: string; cni: string; imatricule: string; departemnt: string; role: string; }

export default function TeacherProfileScreen({ onLogout }: { onLogout?: () => void }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token    = await AsyncStorage.getItem('token');
        const username = await AsyncStorage.getItem('username');
        if (!token || !username) return;
        const res = await fetch(`${BASE_URL}/auth/username/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProfile(await res.json());
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <ActivityIndicator color={P.mahogany} style={{ flex: 1 }} />;

  const rows: { icon: any; label: string; value: string }[] = [
    { icon: 'person-outline',   label: 'Username',    value: profile?.username   || '—' },
    { icon: 'id-card-outline',  label: 'CNI',         value: profile?.cni        || '—' },
    { icon: 'barcode-outline',  label: 'Matricule',   value: profile?.imatricule || '—' },
    { icon: 'business-outline', label: 'Département', value: profile?.departemnt || '—' },
    { icon: 'shield-outline',   label: 'Rôle',        value: profile?.role       || '—' },
  ];

  return (
    <ScrollView style={[s.root, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={s.name}>{profile?.firstName} {profile?.lastName}</Text>
        <View style={s.badge}><Text style={s.badgeTxt}>Professeur</Text></View>
      </View>

      {/* Infos */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Informations</Text>
        {rows.map(r => (
          <View key={r.label} style={s.row}>
            <Ionicons name={r.icon} size={18} color={P.muted} />
            <Text style={s.label}>{r.label}</Text>
            <Text style={s.value}>{r.value}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#e53e3e" />
        <Text style={s.logoutTxt}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: P.cream },
  header:    { backgroundColor: P.mahogany, alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  avatar:    { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#fff' },
  name:      { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  badge:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20 },
  badgeTxt:  { color: '#fff', fontSize: 13 },
  card:      { backgroundColor: P.card, borderRadius: 14, marginHorizontal: 16, marginTop: 20, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: P.text, marginBottom: 12 },
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: P.border, gap: 10 },
  label:     { flex: 1, color: P.muted, fontSize: 13 },
  value:     { color: P.text, fontSize: 13, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  logoutTxt: { color: '#e53e3e', fontSize: 16, fontWeight: '700' },
});
