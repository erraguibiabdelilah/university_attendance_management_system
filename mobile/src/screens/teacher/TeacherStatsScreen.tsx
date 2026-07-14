import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const SPRING_API  = 'http://10.181.4.71:8080/api/uca';

const P = {
  mahogany: '#622B14', bronze: '#995F2F',
  cream: '#FFF8F6', card: '#FFFFFF',
  text: '#1E0E08', muted: '#9E7060',
  border: '#F0E4DC',
};
const shadow = { shadowColor: '#622B14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 };

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo:   '#FFFFFF',
  color: (opacity = 1) => `rgba(98,43,20,${opacity})`,
  strokeWidth: 2, barPercentage: 0.6, decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(30,14,8,${opacity})`,
};

interface Absence {
  filiere: string;
  absenceDetails: { estAbsent: boolean }[];
}

interface Props { teacherId?: number; }

export default function TeacherStatsScreen({ teacherId }: Props) {
  const insets = useSafeAreaInsets();
  const [absences,   setAbsences]   = useState<Absence[]>([]);
  const [loading,    setLoading]    = useState(true);
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

  // ── Calculs dynamiques ──────────────────────────────────────
  const totalSessions = absences.length;
  const totalStudents = absences.reduce((s, a) => s + (a.absenceDetails ?? []).length, 0);
  const totalAbsents  = absences.reduce((s, a) => s + (a.absenceDetails ?? []).filter(d => d.estAbsent).length, 0);
  const presenceRate  = totalStudents > 0 ? Math.round(((totalStudents - totalAbsents) / totalStudents) * 100) : 0;

  // Présence par filière
  const filiereMap: Record<string, { total: number; absents: number }> = {};
  absences.forEach(a => {
    if (!filiereMap[a.filiere]) filiereMap[a.filiere] = { total: 0, absents: 0 };
    filiereMap[a.filiere].total   += (a.absenceDetails ?? []).length;
    filiereMap[a.filiere].absents += (a.absenceDetails ?? []).filter(d => d.estAbsent).length;
  });
  const filieres = Object.keys(filiereMap);
  const presenceByFiliere = filieres.map(f => {
    const { total, absents } = filiereMap[f];
    return total > 0 ? Math.round(((total - absents) / total) * 100) : 0;
  });

  // Filière avec le + d'absences
  const worstFiliere = filieres.reduce<string | null>((worst, f) => {
    if (!worst) return f;
    return filiereMap[f].absents > filiereMap[worst].absents ? f : worst;
  }, null);

  const hasData = filieres.length > 0;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Statistiques</Text>
        <Text style={s.headerSubtitle}>Vue d'ensemble de vos classes</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={P.mahogany} size="large" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={P.mahogany} />}
        >
          {/* Résumé global */}
          <View style={s.summaryRow}>
            {[
              { label: 'Sessions',  value: totalSessions, color: P.mahogany,  icon: 'calendar' },
              { label: 'Présence',  value: `${presenceRate}%`, color: '#2E7D32', icon: 'checkmark-circle' },
              { label: 'Absents',   value: totalAbsents,  color: '#C0392B',   icon: 'person-remove' },
            ].map((item, i) => (
              <View key={i} style={[s.summaryCard, { borderTopColor: item.color }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Text style={[s.summaryValue, { color: item.color }]}>{item.value}</Text>
                <Text style={s.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Graphique par filière */}
          {hasData ? (
            <View style={s.chartCard}>
              <View style={s.cardHeader}>
                <Ionicons name="bar-chart" size={20} color={P.mahogany} />
                <Text style={s.cardTitle}>Présence par Filière (%)</Text>
              </View>
              <BarChart
                data={{ labels: filieres, datasets: [{ data: presenceByFiliere }] }}
                width={screenWidth - 72}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                style={s.chartStyle}
                showValuesOnTopOfBars
              />
            </View>
          ) : (
            <View style={s.chartCard}>
              <Text style={s.empty}>Aucune donnée disponible</Text>
            </View>
          )}

          {/* Détail par filière */}
          {hasData && (
            <View style={s.detailCard}>
              <View style={s.cardHeader}>
                <Ionicons name="list" size={20} color={P.mahogany} />
                <Text style={s.cardTitle}>Détail par filière</Text>
              </View>
              {filieres.map(f => {
                const { total, absents } = filiereMap[f];
                const rate = total > 0 ? Math.round(((total - absents) / total) * 100) : 0;
                return (
                  <View key={f} style={s.detailRow}>
                    <Text style={s.detailFiliere}>{f}</Text>
                    <View style={s.detailBar}>
                      <View style={[s.detailFill, { width: `${rate}%`, backgroundColor: rate >= 80 ? '#2E7D32' : rate >= 60 ? P.bronze : '#C0392B' }]} />
                    </View>
                    <Text style={s.detailPct}>{rate}%</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Alerte si une filière a un taux < 80% */}
          {worstFiliere && filiereMap[worstFiliere].total > 0 &&
            Math.round(((filiereMap[worstFiliere].total - filiereMap[worstFiliere].absents) / filiereMap[worstFiliere].total) * 100) < 80 && (
            <View style={s.warningCard}>
              <Ionicons name="warning" size={24} color="#E65100" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.warningTitle}>Alerte Assiduité</Text>
                <Text style={s.warningText}>
                  La filière {worstFiliere} enregistre le plus d'absences ({filiereMap[worstFiliere].absents} absent{filiereMap[worstFiliere].absents !== 1 ? 's' : ''}).
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: P.cream },
  header:       { paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle:  { fontSize: 28, fontWeight: 'bold', color: P.text, marginBottom: 4 },
  headerSubtitle:{ fontSize: 14, color: P.muted },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:       { paddingHorizontal: 20, paddingBottom: 30 },
  summaryRow:   { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard:  { flex: 1, backgroundColor: P.card, borderRadius: 12, padding: 12, alignItems: 'center', borderTopWidth: 3, gap: 4, ...shadow },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: P.muted, fontWeight: '600' },
  chartCard:    { backgroundColor: P.card, borderRadius: 16, padding: 16, marginBottom: 20, ...shadow },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', color: P.text, marginLeft: 8 },
  chartStyle:   { marginVertical: 8, borderRadius: 16 },
  detailCard:   { backgroundColor: P.card, borderRadius: 16, padding: 16, marginBottom: 20, ...shadow },
  detailRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  detailFiliere:{ width: 50, fontSize: 13, fontWeight: '700', color: P.text },
  detailBar:    { flex: 1, height: 10, backgroundColor: P.border, borderRadius: 5, overflow: 'hidden' },
  detailFill:   { height: '100%', borderRadius: 5 },
  detailPct:    { width: 38, textAlign: 'right', fontSize: 13, fontWeight: '700', color: P.text },
  warningCard:  { flexDirection: 'row', backgroundColor: '#FFF3E0', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#E65100', marginBottom: 4 },
  warningText:  { fontSize: 12, color: '#EF6C00', lineHeight: 18 },
  empty:        { textAlign: 'center', color: P.muted, paddingVertical: 20 },
});
