import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Header from '../components/Header';
import { useStudentStats } from '../hooks/useStudentStats';
import { COLORS, SIZES, FONTS } from '../constants/theme';

// Palette locale alignée sur le thème mahogany du Projet B
const P = {
  mahogany:    COLORS.primary,       // '#622B14'
  bronze:      '#995F2F',
  bronzeLight: '#C4956A',
  cream:       COLORS.lightGray,     // '#F8F9FA'
  card:        COLORS.card,          // '#FFFFFF'
  text:        COLORS.text,          // '#212529'
  muted:       COLORS.subtitle,      // '#868E96'
  border:      COLORS.border,        // '#F1F3F5'
  alertBg:     '#FFF0E8',
  alertRed:    '#8B2500',
  presentC:    '#7A5C00',
  presentBg:   '#FFF8E1',
  absentC:     '#8B2500',
  absentBg:    '#FFF0E8',
};

const ALERT_THRESHOLD = 2;

function fmt(iso: string) {
  const [, m, d] = iso.split('-');
  const M = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  return `${parseInt(d)} ${M[parseInt(m) - 1]}`;
}

function DonutChart({ present, absent, total, rate }: {
  present: number; absent: number; total: number; rate: number;
}) {
  const SZ = 190, R = 70, SW = 24, C = 2 * Math.PI * R;
  const pArc = (present / total) * C;
  const aArc = (absent  / total) * C;
  return (
    <View style={dc.wrap}>
      <View style={dc.svgBox}>
        <Svg width={SZ} height={SZ}>
          <Circle cx={SZ/2} cy={SZ/2} r={R} stroke={P.border}
            strokeWidth={SW} fill="none" />
          <Circle cx={SZ/2} cy={SZ/2} r={R} stroke={P.bronzeLight}
            strokeWidth={SW} fill="none"
            strokeDasharray={`${aArc} ${C}`} strokeLinecap="round"
            rotation={-90 + (present / total) * 360} origin={`${SZ/2},${SZ/2}`} />
          <Circle cx={SZ/2} cy={SZ/2} r={R} stroke={P.mahogany}
            strokeWidth={SW} fill="none"
            strokeDasharray={`${pArc} ${C}`} strokeLinecap="round"
            rotation={-90} origin={`${SZ/2},${SZ/2}`} />
        </Svg>
        <View style={dc.center}>
          <Text style={dc.pct}>{rate}%</Text>
          <Text style={dc.sub}>Présence</Text>
        </View>
      </View>
      <View style={dc.legend}>
        <View style={dc.lItem}>
          <View style={[dc.lDot, { backgroundColor: P.mahogany }]} />
          <View>
            <Text style={dc.lVal}>{present}</Text>
            <Text style={dc.lLbl}>Présent</Text>
          </View>
        </View>
        <View style={dc.lSep} />
        <View style={dc.lItem}>
          <View style={[dc.lDot, { backgroundColor: P.bronzeLight }]} />
          <View>
            <Text style={dc.lVal}>{absent}</Text>
            <Text style={dc.lLbl}>Absent</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const dc = StyleSheet.create({
  wrap:   { alignItems: 'center', gap: 20 },
  svgBox: { width: 190, height: 190, justifyContent: 'center', alignItems: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  pct:    { fontSize: 36, fontWeight: FONTS.bold, color: P.mahogany },
  sub:    { fontSize: 12, color: P.muted, letterSpacing: 0.4, marginTop: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  lItem:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lDot:   { width: 12, height: 12, borderRadius: 6 },
  lVal:   { fontSize: 22, fontWeight: FONTS.bold, color: P.text },
  lLbl:   { fontSize: 11, color: P.muted },
  lSep:   { width: 1, height: 36, backgroundColor: P.border },
});

interface HomeScreenProps {
  onLogout?: () => void;
  onProfilePress?: () => void;
}

export default function HomeScreen({ onLogout, onProfilePress }: HomeScreenProps) {
  const { stats, loading, error, refresh } = useStudentStats();

  const absent    = stats?.totalAbsences ?? 0;
  const present   = stats?.totalPresent  ?? 0;
  const total     = absent + present;
  const rate      = stats?.attendanceRate ?? 100;
  const firstName = stats?.firstName ?? '';
  const filier    = stats?.filier    ?? '';
  const promo     = stats?.promo     ?? '';
  const byModule  = stats?.absencesByModule ?? {};
  const recent    = stats?.recentAbsences   ?? [];

  const topModules   = Object.entries(byModule).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const alertModules = Object.entries(byModule).filter(([, c]) => c >= ALERT_THRESHOLD);
  const presencePct  = total > 0 ? Math.round((present / total) * 100) : 100;

  if (loading && !stats) return (
    <View style={[s.root, s.centered]}>
      <ActivityIndicator size="large" color={P.mahogany} />
      <Text style={s.muted}>Chargement…</Text>
    </View>
  );

  if (error && !stats) return (
    <View style={[s.root, s.centered]}>
      <Text style={s.errTxt}>{error}</Text>
      <TouchableOpacity style={s.retryBtn} onPress={refresh}>
        <Text style={s.retryTxt}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.root}>
      <Header title="Tableau de bord" onProfilePress={onProfilePress} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={P.mahogany} />}
      >

        {/* ── 1. Bienvenue ── */}
        <View style={s.welcome}>
          <Text style={s.wName}>Bonjour {firstName || 'Étudiant'} 👋</Text>
          <Text style={s.wSub}>
          Bienvenue sur votre espace étudiant {filier ? ` · ${filier}` : ''}{promo ? ` ${promo}` : ''}
          </Text>
        </View>

        {/* ── 2. Bannières d'alerte ── */}
        {alertModules.map(([mod, count]) => (
          <View key={mod} style={s.alert}>
            <Text style={s.alertIcon}>⚠️</Text>
            <Text style={s.alertTxt}>
              Attention : <Text style={s.alertBold}>{count} absences</Text> en{' '}
              <Text style={s.alertBold}>{mod}</Text>
            </Text>
          </View>
        ))}

        {/* ── 3. Grille statistiques ── */}
        <View style={s.grid}>
          {[
            { icon: '❌', val: `${absent}`,  lbl: 'Absences',  color: P.absentC  },
            { icon: '✅', val: `${present}`, lbl: 'Présences', color: P.mahogany },
            { icon: '📈', val: `${rate}%`,   lbl: 'Taux',      color: P.bronze   },
          ].map((item) => (
            <View key={item.lbl} style={s.statCard}>
              <Text style={s.statIcon}>{item.icon}</Text>
              <Text style={[s.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={s.statLbl}>{item.lbl}</Text>
            </View>
          ))}
        </View>

        {/* ── 4. Récapitulatif Global (Donut Chart) ── */}
        {total > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Récapitulatif Global</Text>
            <DonutChart present={present} absent={absent} total={total} rate={presencePct} />
          </View>
        )}

        {/* ── 5. Modules Critiques ── */}
        {topModules.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Modules Critiques</Text>
            {topModules.map(([mod, count], i) => {
              const isAlert = count >= ALERT_THRESHOLD;
              return (
                <View key={mod} style={[s.modRow, i < topModules.length - 1 && s.divider]}>
                  <View style={[s.modAccent, { backgroundColor: isAlert ? P.absentC : P.bronze }]} />
                  <View style={s.modInfo}>
                    <Text style={s.modName}>{mod}</Text>
                    <View style={s.modBar}>
                      <View style={[s.modFill, {
                        width: absent > 0 ? `${Math.round((count / absent) * 100)}%` : '0%',
                        backgroundColor: isAlert ? P.absentC : P.bronze,
                      }]} />
                    </View>
                  </View>
                  <View style={[s.pill, { backgroundColor: isAlert ? P.absentBg : '#FDF3EA' }]}>
                    <Text style={[s.pillTxt, { color: isAlert ? P.absentC : P.bronze }]}>
                      {count} abs.
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── 6. Dernières Séances ── */}
        {recent.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Dernières Séances</Text>
            {recent.map((r, i) => (
              <View key={i} style={[s.seanceRow, i < recent.length - 1 && s.divider]}>
                <View style={[s.seanceDot, { backgroundColor: r.absent ? P.absentC : P.presentC }]} />
                <View style={s.seanceInfo}>
                  <Text style={s.seanceMod}>{r.module}</Text>
                  <Text style={s.seanceDate}>{fmt(r.date)}</Text>
                </View>
                <View style={[s.pill, { backgroundColor: r.absent ? P.absentBg : P.presentBg }]}>
                  <Text style={[s.pillTxt, { color: r.absent ? P.absentC : P.presentC }]}>
                    {r.absent ? 'Absent' : 'Présent'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const shadow = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: P.cream },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  muted:    { color: P.muted },
  errTxt:   { color: P.absentC, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: P.mahogany, borderRadius: SIZES.radius },
  retryTxt: { color: '#fff', fontWeight: FONTS.bold },
  scroll:   { padding: SIZES.medium, gap: 14 },

  // Bienvenue
  welcome: { paddingVertical: 8, paddingHorizontal: 4, gap: 4 },
  wName:   { fontSize: SIZES.extraLarge, fontWeight: FONTS.bold, color: P.mahogany },
  wSub:    { fontSize: SIZES.small, color: P.muted },

  // Alerte
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: P.alertBg, borderRadius: SIZES.radius, padding: 14,
    borderLeftWidth: 4, borderLeftColor: P.alertRed, ...shadow,
  },
  alertIcon: { fontSize: 18 },
  alertTxt:  { flex: 1, fontSize: SIZES.small, color: P.alertRed },
  alertBold: { fontWeight: FONTS.bold },

  // Grid stats
  grid:     { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: P.card, borderRadius: SIZES.radius, padding: 14,
    alignItems: 'center', gap: 6, ...shadow,
  },
  statIcon: { fontSize: 20 },
  statVal:  { fontSize: SIZES.extraLarge, fontWeight: FONTS.bold },
  statLbl:  { fontSize: 10, color: P.muted, fontWeight: FONTS.bold },

  // Card
  card:      { backgroundColor: P.card, borderRadius: 20, padding: 18, gap: 16, ...shadow },
  cardTitle: { fontSize: SIZES.font + 1, fontWeight: FONTS.bold, color: P.mahogany },

  // Modules
  modRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  modAccent: { width: 4, height: 40, borderRadius: 2 },
  modInfo:   { flex: 1, gap: 6 },
  modName:   { fontSize: SIZES.small + 1, fontWeight: FONTS.bold, color: P.text },
  modBar:    { height: 4, backgroundColor: P.border, borderRadius: 2, overflow: 'hidden' },
  modFill:   { height: '100%', borderRadius: 2 },

  // Séances
  seanceRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  seanceDot:  { width: 10, height: 10, borderRadius: 5 },
  seanceInfo: { flex: 1 },
  seanceMod:  { fontSize: SIZES.small + 1, fontWeight: FONTS.bold, color: P.text },
  seanceDate: { fontSize: 11, color: P.muted, marginTop: 2 },

  // Pill badge
  pill:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillTxt: { fontSize: 11, fontWeight: FONTS.bold },

  divider: { borderBottomWidth: 1, borderBottomColor: P.border },
});
