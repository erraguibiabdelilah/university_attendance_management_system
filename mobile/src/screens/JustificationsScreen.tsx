import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Modal, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getJustificationsByStudent,
  submitJustification,
  Justification
} from '../services/JustificationService';

const BROWN = '#622B14';
const BG = '#f5f0eb';
const MOTIFS = ['Maladie', 'Décès familial', 'Convocation officielle', 'Accident', 'Autre'];

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  EN_ATTENTE: { color: '#e65100', label: 'EN ATTENTE' },
  VALIDE: { color: '#2e7d32', label: 'ACCEPTÉ' },
  REFUSE: { color: '#c62828', label: 'REFUSÉ' },
};

interface AbsenceDetail {
  id: number;
  nomModule: string;
  date: string;
  estAbsent: boolean;
}

export default function JustificationsScreen({ onProfilePress }: { onProfilePress?: () => void }) {
  const insets = useSafeAreaInsets();
  const [motif, setMotif] = useState('Maladie');
  const [commentaire, setCommentaire] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [showMotifPicker, setShowMotifPicker] = useState(false);
  const [showAbsencePicker, setShowAbsencePicker] = useState(false);
  const [absences, setAbsences] = useState<AbsenceDetail[]>([]);
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceDetail | null>(null);
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const username = await AsyncStorage.getItem('username');
      if (!token || !username) return;

      const userRes = await fetch(`http://10.181.4.71:8080/api/uca/auth/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) return;
      const user = await userRes.json();
      setStudentId(user.id);

      const absRes = await fetch(`http://10.181.4.71:8080/api/uca/absenceDetail/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (absRes.ok) {
        const data = await absRes.json();
        const justs = await getJustificationsByStudent(user.id);
        setJustifications(justs);
        const justifiedIds = new Set(justs.map((j: any) => j.absenceDetailId));
        setAbsences(data.filter((a: any) => a.estAbsent && !justifiedIds.has(a.id)));
        return;
      }
      const justs = await getJustificationsByStudent(user.id);
      setJustifications(justs);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({ uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' });
      }
    } catch { Alert.alert('Erreur', 'Impossible de sélectionner le fichier.'); }
  };

  const handleSubmit = async () => {
    if (!selectedAbsence) { Alert.alert('Erreur', 'Veuillez sélectionner une absence.'); return; }
    if (!selectedFile) { Alert.alert('Erreur', 'Veuillez joindre un document justificatif.'); return; }
    if (!studentId) { Alert.alert('Erreur', 'Session expirée.'); return; }
    setIsSending(true);
    try {
      await submitJustification(selectedAbsence.id, studentId, motif, commentaire, selectedFile.uri, selectedFile.name, selectedFile.type);
      Alert.alert('Succès', 'Justification envoyée avec succès.');
      setCommentaire(''); setSelectedFile(null); setSelectedAbsence(null); setMotif('Maladie');
      await loadData();
    } catch { Alert.alert('Erreur', 'Impossible d\'envoyer la justification.'); }
    finally { setIsSending(false); }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Justifications</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity><Ionicons name="notifications-outline" size={24} color="#333" /></TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress}>
            <Ionicons name="person" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* FORMULAIRE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nouvelle Demande</Text>

          <Text style={styles.label}>ABSENCE CONCERNÉE</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowAbsencePicker(true)}>
            <Text style={{ color: selectedAbsence ? '#1a1a1a' : '#aaa', flex: 1 }}>
              {selectedAbsence ? `${selectedAbsence.nomModule} — ${formatDate(selectedAbsence.date)}` : 'Sélectionner un cours...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#aaa" />
          </TouchableOpacity>

          <Text style={styles.label}>MOTIF D'ABSENCE</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowMotifPicker(true)}>
            <Text style={{ color: '#1a1a1a', flex: 1 }}>{motif}</Text>
            <Ionicons name="briefcase-outline" size={18} color="#aaa" />
          </TouchableOpacity>

          <Text style={styles.label}>COMMENTAIRE</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Précisez les détails de votre absence..."
            placeholderTextColor="#bbb"
            value={commentaire}
            onChangeText={setCommentaire}
          />

          <Text style={styles.label}>JUSTIFICATIF</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
            <Ionicons name="cloud-upload-outline" size={28} color={BROWN} />
            <Text style={styles.uploadText}>
              {selectedFile ? selectedFile.name : 'Joindre un document (PDF, JPG)'}
            </Text>
          </TouchableOpacity>
          {selectedFile && (
            <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.removeFile}>
              <Ionicons name="close-circle" size={14} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 12, marginLeft: 4 }}>Supprimer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.submitBtn, isSending && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isSending}>
            {isSending
              ? <ActivityIndicator color="#fff" />
              : <><Text style={styles.submitText}>Envoyer la demande</Text><Text style={{ color: '#fff', fontSize: 16, marginLeft: 6 }}>▶</Text></>
            }
          </TouchableOpacity>
        </View>

        {/* HISTORIQUE */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Historique des demandes</Text>
          <Ionicons name="time-outline" size={20} color="#888" />
        </View>

        {isLoading ? (
          <ActivityIndicator color={BROWN} style={{ marginTop: 20 }} />
        ) : justifications.length === 0 ? (
          <Text style={styles.emptyText}>Aucune justification soumise.</Text>
        ) : (
          justifications.map(j => {
            const s = STATUS_STYLE[j.statut] || { color: '#888', label: j.statut };
            return (
              <View key={j.id} style={styles.historyCard}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyDate}>{formatDate(j.dateDepot)}</Text>
                  <Text style={[styles.historyStatus, { color: s.color }]}>{s.label}</Text>
                </View>
                <Text style={styles.historyMotif}>{j.motif}</Text>
                {j.fichierUrl && (
                  <View style={styles.fileRow}>
                    <Ionicons name="document-outline" size={14} color="#888" />
                    <Text style={styles.fileName} numberOfLines={1}>{j.fichierUrl.split('/').pop()}</Text>
                  </View>
                )}
                {j.statut === 'REFUSE' && j.motifRefus && (
                  <Text style={styles.refusText}>{j.motifRefus}</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* MODAL MOTIF */}
      <Modal visible={showMotifPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowMotifPicker(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choisir un motif</Text>
            {MOTIFS.map(m => (
              <TouchableOpacity key={m} style={styles.modalItem} onPress={() => { setMotif(m); setShowMotifPicker(false); }}>
                <Text style={[styles.modalItemText, motif === m && { color: BROWN, fontWeight: '700' }]}>{m}</Text>
                {motif === m && <Ionicons name="checkmark" size={18} color={BROWN} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL ABSENCE */}
      <Modal visible={showAbsencePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowAbsencePicker(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sélectionner une absence</Text>
            {absences.length === 0
              ? <Text style={styles.emptyText}>Aucune absence disponible.</Text>
              : absences.map(a => (
                <TouchableOpacity key={a.id} style={styles.modalItem} onPress={() => { setSelectedAbsence(a); setShowAbsencePicker(false); }}>
                  <View>
                    <Text style={styles.modalItemText}>{a.nomModule}</Text>
                    <Text style={{ color: '#888', fontSize: 12 }}>{formatDate(a.date)}</Text>
                  </View>
                  {selectedAbsence?.id === a.id && <Ionicons name="checkmark" size={18} color={BROWN} />}
                </TouchableOpacity>
              ))
            }
          </View>
        </TouchableOpacity>
      </Modal>
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
  avatarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#aaa', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: BROWN },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 24, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8, marginBottom: 6, marginTop: 4 },
  picker: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0d6cc',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, backgroundColor: '#faf8f5',
  },
  textArea: {
    borderWidth: 1, borderColor: '#e0d6cc', borderRadius: 10, padding: 12,
    height: 90, textAlignVertical: 'top', marginBottom: 14, backgroundColor: '#faf8f5', color: '#1a1a1a',
  },
  uploadBtn: {
    borderWidth: 1.5, borderColor: BROWN, borderStyle: 'dashed', borderRadius: 10,
    padding: 18, alignItems: 'center', marginBottom: 8, backgroundColor: '#fdf6f2',
  },
  uploadText: { color: BROWN, marginTop: 6, fontSize: 13, fontWeight: '600' },
  removeFile: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  submitBtn: {
    backgroundColor: BROWN, borderRadius: 30, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  historyCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1,
  },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyDate: { fontSize: 11, color: '#888', fontWeight: '600' },
  historyStatus: { fontSize: 11, fontWeight: '700' },
  historyMotif: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fileName: { fontSize: 12, color: '#888', flex: 1 },
  refusText: { color: '#c62828', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0e8e0' },
  modalItemText: { fontSize: 14, color: '#1a1a1a' },
});
