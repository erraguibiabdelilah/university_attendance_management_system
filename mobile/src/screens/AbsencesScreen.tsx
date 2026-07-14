import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_URL = 'http://10.181.4.71:8080/api/uca';
const BROWN = '#5c3d2e';
const BG = '#f5f0eb';

interface AbsenceRecord {
  id: string;
  name: string;
  promo: string;
  date: string;
  status: 'JUSTIFIÉE' | 'NON JUSTIFIÉE' | 'EN ATTENTE';
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  'JUSTIFIÉE': { bg: '#e6f4ea', color: '#2e7d32', label: 'Justifiée' },
  'NON JUSTIFIÉE': { bg: '#fdecea', color: '#c62828', label: 'Non justifiée' },
  'EN ATTENTE': { bg: '#fff3e0', color: '#e65100', label: 'En attente' },
};

export default function AbsencesScreen({ onScanPress, onProfilePress }: { onScanPress: () => void; onProfilePress?: () => void }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'TOUT' | 'JUSTIFIÉE' | 'NON JUSTIFIÉE' | 'EN ATTENTE'>('TOUT');
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadAbsences(); }, []);

  const loadAbsences = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const username = await AsyncStorage.getItem('username');
      if (!token || !username) return;

      const userRes = await fetch(`${BASE_URL}/auth/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) return;
      const user = await userRes.json();

      const absRes = await fetch(`${BASE_URL}/absenceDetail/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!absRes.ok) return;
      const data = await absRes.json();

      const justRes = await fetch(`${BASE_URL}/justification/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const justifications = justRes.ok ? await justRes.json() : [];

      const mapped: AbsenceRecord[] = data
        .filter((a: any) => a.estAbsent)
        .map((a: any) => {
          const just = justifications.find((j: any) => j.absenceDetailId === a.id);
          let status: AbsenceRecord['status'] = 'NON JUSTIFIÉE';
          if (just) status = just.statut === 'VALIDE' ? 'JUSTIFIÉE' : 'EN ATTENTE';
          return {
            id: String(a.id),
            name: a.nomModule || 'Module inconnu',
            promo: a.promo || '',
            date: a.date ? new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            status,
          };
        });

      setAbsences(mapped);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = filter === 'TOUT' ? absences : absences.filter(a => a.status === filter);

  const renderItem = ({ item }: { item: AbsenceRecord }) => {
    const s = STATUS_STYLE[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.moduleName}>{item.name}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color="#888" />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
              <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </View>
      </View>
    );
  };

  const filters: { key: 'TOUT' | 'NON JUSTIFIÉE' | 'EN ATTENTE' | 'JUSTIFIÉE'; label: string }[] = [
    { key: 'TOUT', label: 'Tout' },
    { key: 'NON JUSTIFIÉE', label: 'Non just.' },
    { key: 'EN ATTENTE', label: 'En attente' },
    { key: 'JUSTIFIÉE', label: 'Justifiées' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Absences</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress}>
            <Ionicons name="person" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {isLoading ? (
        <ActivityIndicator color={BROWN} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>Aucune absence trouvée.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={loadAbsences}
          refreshing={isLoading}
        />
      )}

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 4 },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#aaa',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#622B14' },
  filtersRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0e8e0',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0d6cc',
  },
  filterChipActive: { backgroundColor: BROWN, borderColor: BROWN },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  moduleName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  dateText: { fontSize: 13, color: '#888' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28, backgroundColor: BROWN,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
});
