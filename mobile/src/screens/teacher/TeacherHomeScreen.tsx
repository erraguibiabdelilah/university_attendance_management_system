import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPRING_API = 'http://10.181.4.71:8080/api/uca';

const P = {
  mahogany: '#622B14', bronze: '#995F2F',
  cream: '#FFF8F6', card: '#FFFFFF',
  text: '#1E0E08', muted: '#9E7060',
  border: '#F0E4DC', light: '#FDF5F0',
};
const shadow = { shadowColor: '#622B14', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 };

type DropdownProps = { label: string; value: string; options: string[]; onSelect: (v: string) => void; };
function Dropdown({ label, value, options, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrap}>
      <Text style={dd.label}>{label}</Text>
      <TouchableOpacity style={dd.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={dd.value}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color={P.muted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={dd.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dd.sheet}>
            <Text style={dd.sheetTitle}>{label}</Text>
            {options.map(opt => (
              <TouchableOpacity key={opt} style={[dd.option, opt === value && dd.optionActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}>
                <Text style={[dd.optionTxt, opt === value && dd.optionTxtActive]}>{opt}</Text>
                {opt === value && <Ionicons name="checkmark" size={16} color={P.mahogany} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const dd = StyleSheet.create({
  wrap:           { gap: 6 },
  label:          { fontSize: 11, fontWeight: '600', color: P.muted, letterSpacing: 0.5, textTransform: 'uppercase' },
  trigger:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: P.light, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: P.border },
  value:          { fontSize: 14, color: P.text, fontWeight: '500' },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: P.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 4 },
  sheetTitle:     { fontSize: 13, fontWeight: '700', color: P.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  option:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: P.border },
  optionActive:   { backgroundColor: P.light, borderRadius: 8, paddingHorizontal: 10 },
  optionTxt:      { fontSize: 15, color: P.text },
  optionTxtActive:{ color: P.mahogany, fontWeight: '700' },
});

const FILIERES  = ['IRISI', 'SIT', 'ERME'];
const SEMESTRES = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const TYPES     = ['Course', 'TD', 'TP', 'Examen'];

export interface SessionConfig { filiere: string; semestre: string; module: string; type: string; }

interface Props {
  teacherName?: string;
  teacherId?: number;
  onScanPress?: (config: SessionConfig) => void;
}

export default function TeacherHomeScreen({ teacherName = 'Professeur', teacherId, onScanPress }: Props) {
  const insets = useSafeAreaInsets();
  const [filiere,  setFiliere]  = useState('IRISI');
  const [semestre, setSemestre] = useState('S8');
  const [module,   setModule]   = useState('');
  const [type,     setType]     = useState('Course');



  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.breadcrumb}>TEACHER</Text>
        <Text style={s.name}>{teacherName}</Text>
        <Text style={s.subtitle}>Gestion des absences</Text>

        {/* ── Configuration session ── */}
        <View style={s.card}>
          <View style={s.grid}>
            <Dropdown label="Filière"        value={filiere}  options={FILIERES}  onSelect={setFiliere} />
            <Dropdown label="Semestre"       value={semestre} options={SEMESTRES} onSelect={setSemestre} />
            <View style={dd.wrap}>
              <Text style={dd.label}>MODULE</Text>
              <TextInput
                style={dd.trigger}
                value={module}
                onChangeText={setModule}
                placeholder="Saisir le module…"
                placeholderTextColor={P.muted}
              />
            </View>
            <Dropdown label="Type de Séance" value={type}     options={TYPES}     onSelect={setType} />
          </View>
        </View>

        <TouchableOpacity style={s.scanBtn} onPress={() => onScanPress?.({ filiere, semestre, module, type })} activeOpacity={0.85}>
          <Ionicons name="camera" size={20} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={s.scanTxt}>SCAN CLASS</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: P.cream },
  scroll:     { paddingHorizontal: 20, paddingBottom: 20 },
  breadcrumb: { fontSize: 11, fontWeight: '700', color: P.mahogany, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 16, marginBottom: 6 },
  name:       { fontSize: 26, fontWeight: '700', color: P.text, marginBottom: 4 },
  subtitle:   { fontSize: 14, color: P.muted, marginBottom: 20 },
  card:       { backgroundColor: P.card, borderRadius: 16, padding: 18, gap: 16, marginBottom: 20, ...shadow },
  grid:       { gap: 16 },
  scanBtn:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: P.mahogany, borderRadius: 50,
    paddingVertical: 16, paddingHorizontal: 32,
    shadowColor: P.mahogany, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  scanTxt:    { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
});
