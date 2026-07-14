import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionConfig } from './TeacherHomeScreen';

const FACE_API   = 'http://10.181.4.71:8000';
const SPRING_API = 'http://10.181.4.71:8080/api/uca';

const P = {
  mahogany: '#622B14', bronze: '#995F2F',
  cream: '#FFF8F6',    card: '#FFFFFF',
  text: '#1E0E08',     muted: '#9E7060',
  border: '#F0E4DC',   green: '#2E7D32',
};

interface Props { onClose: () => void; session: SessionConfig; }
interface Student { id: number; firstName: string; lastName: string; photoUrl?: string; }
interface Result  { student: Student; present: boolean; confidence?: number; }

export default function TeacherScanScreen({ onClose, session }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const insets    = useSafeAreaInsets();

  const [students,  setStudents]  = useState<Student[]>([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [photoUri,  setPhotoUri]  = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results,   setResults]   = useState<Result[]>([]);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // ── 1. Fetch students for this filiere+semestre on mount ─────
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(
          `${SPRING_API}/auth/filier/${session.filiere}/promo/${session.semestre}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) setStudents(await res.json());
      } catch { /* ignore, will show empty list */ }
      finally { setLoadingDB(false); }
    })();
  }, []);

  // ── 2. Take photo → send to face_attendance /api/v1/scan ────
  const handleCapture = async () => {
    if (!cameraRef.current || analyzing) return;
    setAnalyzing(true);
    setResults([]);
    setSaved(false);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.7 });
      setPhotoUri(photo.uri);

      // Build students_json using local reference photos in face_attendance/students/
      // File naming convention: students/{firstName}.png (lowercase)
      const studentsPayload = students.map(s => ({
        student_id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        image_path: s.photoUrl ?? `students/${s.firstName.toLowerCase()}.png`,
      }));

      if (studentsPayload.length === 0) {
        throw new Error(`Aucun étudiant chargé pour ${session.filiere}/${session.semestre}. Vérifiez la filière et le semestre.`);
      }

      const form = new FormData();
      form.append('class_name', `${session.filiere}-${session.semestre}`);
      form.append('students_json', JSON.stringify(studentsPayload));
      form.append('classroom_image', {
        uri: photo.uri,
        name: 'classroom.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${FACE_API}/api/v1/scan`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Face API ${res.status}: ${errText}`);
      }

      // AttendanceResult from face_attendance
      const data: {
        present_students: { student_id: number; name: string; confidence: number }[];
        absent_students:  { student_id: number; name: string }[];
      } = await res.json();

      // Map to Result[] using student_id
      const presentIds = new Set(data.present_students.map(p => p.student_id));
      const mapped: Result[] = students.map(s => {
        const match = data.present_students.find(p => p.student_id === s.id);
        return { student: s, present: presentIds.has(s.id), confidence: match?.confidence };
      });
      setResults(mapped);
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Service de reconnaissance indisponible.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── 3. Save absence record to Spring Boot ───────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token    = await AsyncStorage.getItem('token');
      const username = await AsyncStorage.getItem('username');
      if (!token || !username) throw new Error('Session expirée, reconnectez-vous.');
      const headers  = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      const teacherRes = await fetch(`${SPRING_API}/auth/username/${username}`, { headers });
      const teacher    = await teacherRes.json();

      const payload = {
        absence: {
          teacherId:  teacher.id,
          nomModule:  session.module,
          filiere:    session.filiere,
          promo:      session.semestre,
          typeSeance: session.type,
          date:       new Date().toISOString().split('T')[0],
        },
        details: results.map(r => ({ studentId: r.student.id, estAbsent: !r.present })),
      };

      const saveRes = await fetch(`${SPRING_API}/absence/`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      if (!saveRes.ok) throw new Error(`Save ${saveRes.status}`);
      setSaved(true);
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  // ── Permission ───────────────────────────────────────────────
  if (!permission) return <View style={s.center}><ActivityIndicator color={P.mahogany} /></View>;
  if (!permission.granted) return (
    <View style={s.center}>
      <Text style={s.muted}>Permission caméra requise</Text>
      <TouchableOpacity style={s.btn} onPress={requestPermission}><Text style={s.btnTxt}>Autoriser</Text></TouchableOpacity>
      <TouchableOpacity style={[s.btn, { backgroundColor: P.muted, marginTop: 10 }]} onPress={onClose}><Text style={s.btnTxt}>Retour</Text></TouchableOpacity>
    </View>
  );

  const presentCount = results.filter(r => r.present).length;
  const absentCount  = results.filter(r => !r.present).length;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── Camera / Preview ── */}
      <View style={s.cameraBox}>
        {photoUri
          ? <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          : <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
        }

        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={s.badge}>
          <Text style={s.badgeTxt}>{session.filiere} · {session.semestre} · {session.module || '—'}</Text>
        </View>

        {loadingDB && (
          <View style={s.dbLoading}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={s.dbLoadingTxt}> Chargement des étudiants…</Text>
          </View>
        )}

        <View style={s.camActions}>
          {photoUri ? (
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
              onPress={() => { setPhotoUri(null); setResults([]); setSaved(false); }}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={s.actionTxt}> Reprendre</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.actionBtn} onPress={handleCapture}
              disabled={analyzing || loadingDB}>
              {analyzing
                ? <><ActivityIndicator color="#fff" /><Text style={s.actionTxt}> Analyse…</Text></>
                : <><Ionicons name="camera" size={22} color="#fff" /><Text style={s.actionTxt}> Prendre la photo</Text></>
              }
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Results ── */}
      <View style={s.panel}>
        {results.length > 0 && (
          <View style={s.summary}>
            <View style={[s.summaryPill, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[s.summaryTxt, { color: P.green }]}>✓ {presentCount} présent(s)</Text>
            </View>
            <View style={[s.summaryPill, { backgroundColor: '#FFF0E8' }]}>
              <Text style={[s.summaryTxt, { color: '#8B2500' }]}>✗ {absentCount} absent(s)</Text>
            </View>
          </View>
        )}

        {results.length === 0 && (
          <Text style={s.hint}>
            {analyzing ? 'Reconnaissance en cours…'
              : photoUri ? 'Aucun résultat'
              : `${students.length} étudiant(s) chargé(s) — prenez la photo`}
          </Text>
        )}

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {results.map((r, i) => (
            <View key={i} style={s.row}>
              <View style={[s.dot, { backgroundColor: r.present ? P.green : '#8B2500' }]} />
              <Text style={s.name}>{r.student.firstName} {r.student.lastName}</Text>
              {r.present
                ? <View style={[s.pill, { backgroundColor: '#E8F5E9' }]}><Text style={[s.pillTxt, { color: P.green }]}>Présent</Text></View>
                : <View style={[s.pill, { backgroundColor: '#FFF0E8' }]}><Text style={[s.pillTxt, { color: '#8B2500' }]}>Absent</Text></View>
              }
            </View>
          ))}
        </ScrollView>

        {results.length > 0 && !saved && (
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <><Ionicons name="checkmark-circle" size={20} color="#fff" /><Text style={s.saveTxt}> Enregistrer les absences</Text></>
            }
          </TouchableOpacity>
        )}

        {saved && (
          <View style={[s.saveBtn, { backgroundColor: P.green }]}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={s.saveTxt}> Absences enregistrées ✓</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: P.cream },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: P.cream },
  muted:  { color: P.muted, textAlign: 'center', paddingHorizontal: 24 },
  btn:    { backgroundColor: P.mahogany, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 50 },
  btnTxt: { color: '#fff', fontWeight: '700' },

  cameraBox:    { height: '50%', position: 'relative', backgroundColor: '#000' },
  closeBtn:     { position: 'absolute', top: 14, left: 14, padding: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20 },
  badge:        { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(98,43,20,0.85)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeTxt:     { color: '#fff', fontSize: 11, fontWeight: '600' },
  dbLoading:    { position: 'absolute', top: 60, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  dbLoadingTxt: { color: '#fff', fontSize: 12 },
  camActions:   { position: 'absolute', bottom: 18, width: '100%', alignItems: 'center' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: P.mahogany, borderRadius: 50,
    paddingVertical: 13, paddingHorizontal: 28,
    shadowColor: P.mahogany, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  actionTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  panel:   { flex: 1, padding: 16, gap: 8 },
  summary: { flexDirection: 'row', gap: 10 },
  summaryPill: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  summaryTxt:  { fontWeight: '700', fontSize: 13 },
  hint:    { fontSize: 13, color: P.muted, textAlign: 'center', marginTop: 8 },

  row:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: P.border },
  dot:     { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  name:    { flex: 1, fontSize: 14, color: P.text, fontWeight: '500' },
  pill:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  pillTxt: { fontSize: 12, fontWeight: '700' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: P.mahogany, borderRadius: 50, paddingVertical: 14, marginTop: 4,
    shadowColor: P.mahogany, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
