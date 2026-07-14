import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPRING_API = 'http://10.181.4.71:8080/api/uca';

const P = {
  mahogany: '#622B14', cream: '#FFF8F6', card: '#FFFFFF',
  text: '#1E0E08', muted: '#9E7060', border: '#F0E4DC',
  green: '#2E7D32', red: '#8B2500',
};
const shadow = { shadowColor: '#622B14', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 };

interface AbsenceDetail { id: number; studentId: number; studentFirstName: string; studentLastName: string; estAbsent: boolean; }
interface Absence { id: number; nomModule: string; filiere: string; promo: string; typeSeance: string; date: string; absenceDetails: AbsenceDetail[]; }

export default function TeacherAbsencesScreen({ teacherId }: { teacherId?: number }) {
  const insets = useSafeAreaInsets();
  const [absences,  setAbsences]  = useState<Absence[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [toggling,  setToggling]  = useState<number | null>(null);
  const [expanded,  setExpanded]  = useState<number | null>(null);

  const fetchAbsences = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${SPRING_API}/absence/teacher/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Absence[] = await res.json();
        setAbsences(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [teacherId]);

  useEffect(() => { fetchAbsences(); }, [fetchAbsences]);

  const toggleDetail = async (detail: AbsenceDetail) => {
    setToggling(detail.id);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${SPRING_API}/absenceDetail/${detail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...detail, estAbsent: !detail.estAbsent }),
      });
      if (!res.ok) throw new Error();
      setAbsences(prev => prev.map(a => ({
        ...a,
        absenceDetails: a.absenceDetails.map(d =>
          d.id === detail.id ? { ...d, estAbsent: !d.estAbsent } : d
        ),
      })));
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier le statut.');
    } finally {
      setToggling(null);
    }
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>Absences enregistrées</Text>
        <TouchableOpacity onPress={fetchAbsences}>
          <Ionicons name="refresh" size={20} color={P.mahogany} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={P.mahogany} style={{ marginTop: 40 }} />
      ) : absences.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 36 }}>🗓️</Text>
          <Text style={s.emptyTitle}>Aucune absence enregistrée</Text>
          <Text style={s.emptyHint}>Scannez votre classe pour commencer</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {absences.map(absence => (
            <View key={absence.id} style={s.card}>
              <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(expanded === absence.id ? null : absence.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={s.module}>{absence.nomModule || '—'}</Text>
                  <Text style={s.meta}>{absence.filiere} · {absence.promo} · {absence.typeSeance} · {absence.date}</Text>
                </View>
                <Ionicons name={expanded === absence.id ? 'chevron-up' : 'chevron-down'} size={16} color={P.muted} />
              </TouchableOpacity>

              {expanded === absence.id && (
                <View style={s.details}>
                  {(absence.absenceDetails ?? []).map(d => (
                    <View key={d.id} style={s.row}>
                      <View style={[s.dot, { backgroundColor: d.estAbsent ? P.red : P.green }]} />
                      <Text style={s.name}>{d.studentFirstName} {d.studentLastName}</Text>
                      <TouchableOpacity
                        style={[s.pill, { backgroundColor: d.estAbsent ? '#FFF0E8' : '#E8F5E9' }]}
                        onPress={() => toggleDetail(d)}
                        disabled={toggling === d.id}
                      >
                        {toggling === d.id
                          ? <ActivityIndicator size="small" color={P.mahogany} />
                          : <Text style={[s.pillTxt, { color: d.estAbsent ? P.red : P.green }]}>
                              {d.estAbsent ? 'Absent' : 'Présent'}
                            </Text>
                        }
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#FFF8F6' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title:      { fontSize: 20, fontWeight: '700', color: P.text },
  scroll:     { paddingHorizontal: 16, paddingBottom: 20 },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: P.text },
  emptyHint:  { fontSize: 13, color: P.muted },
  card:       { backgroundColor: P.card, borderRadius: 14, marginBottom: 10, overflow: 'hidden', ...shadow },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  module:     { fontSize: 14, fontWeight: '700', color: P.text },
  meta:       { fontSize: 11, color: P.muted, marginTop: 2 },
  details:    { borderTopWidth: 1, borderTopColor: P.border, paddingHorizontal: 14, paddingBottom: 8 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: P.border },
  dot:        { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  name:       { flex: 1, fontSize: 13, color: P.text },
  pill:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, minWidth: 72, alignItems: 'center' },
  pillTxt:    { fontSize: 12, fontWeight: '700' },
});
