import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_URL = 'http://10.181.4.71:8080/api/uca';

interface StudentProfile {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    cne: string;
    cni: string;
    filier: string;
    promo: string;
}

export default function ProfileScreen({ onLogout, onBack, onSettings }: { onLogout?: () => void; onBack?: () => void; onSettings?: () => void }) {
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [absenceCount, setAbsenceCount] = useState(0);
    const [justifiedCount, setJustifiedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const username = await AsyncStorage.getItem('username');
            if (!token || !username) return;

            const userRes = await fetch(`${BASE_URL}/auth/username/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!userRes.ok) return;
            const user = await userRes.json();
            setProfile(user);

            // Absences
            const absRes = await fetch(`${BASE_URL}/absenceDetail/student/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (absRes.ok) {
                const abs = await absRes.json();
                const absent = abs.filter((a: any) => a.estAbsent);
                setAbsenceCount(absent.length);
            }

            // Justifications validées
            const justRes = await fetch(`${BASE_URL}/justification/student/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (justRes.ok) {
                const justs = await justRes.json();
                setJustifiedCount(justs.filter((j: any) => j.statut === 'VALIDE').length);
            }
        } catch (e) {
            console.error('Erreur profil:', e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <ActivityIndicator color={COLORS.primary} style={{ flex: 1 }} />;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header marron */}
            <View style={[styles.headerBg, { paddingTop: insets.top + 16 }]}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={onBack}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>Student Profile</Text>
                    <TouchableOpacity onPress={onSettings}>
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={50} color="#fff" />
                    </View>
                </View>
                <Text style={styles.name}>{profile?.firstName} {profile?.lastName}</Text>
                <Text style={styles.cne}>{profile?.cne}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{profile?.filier} | {profile?.promo}</Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Ionicons name="book-outline" size={22} color={COLORS.primary} />
                    <Text style={styles.statNum}>{absenceCount}</Text>
                    <Text style={styles.statLbl}>Absences</Text>
                </View>
                <View style={[styles.statBox, styles.statBorder]}>
                    <Ionicons name="checkmark-circle-outline" size={22} color="#10b981" />
                    <Text style={styles.statNum}>{justifiedCount}</Text>
                    <Text style={styles.statLbl}>Justifiées</Text>
                </View>
                <View style={styles.statBox}>
                    <Ionicons name="school-outline" size={22} color="#f59e0b" />
                    <Text style={styles.statNum}>{absenceCount - justifiedCount}</Text>
                    <Text style={styles.statLbl}>Non just.</Text>
                </View>
            </View>

            {/* Infos de contact */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Informations</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={18} color={COLORS.subtitle} />
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoValue}>{profile?.username}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="card-outline" size={18} color={COLORS.subtitle} />
                    <Text style={styles.infoLabel}>CNE</Text>
                    <Text style={styles.infoValue}>{profile?.cne || '—'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="id-card-outline" size={18} color={COLORS.subtitle} />
                    <Text style={styles.infoLabel}>CNI</Text>
                    <Text style={styles.infoValue}>{profile?.cni || '—'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="school-outline" size={18} color={COLORS.subtitle} />
                    <Text style={styles.infoLabel}>Filière</Text>
                    <Text style={styles.infoValue}>{profile?.filier} — {profile?.promo}</Text>
                </View>
            </View>

            {/* Bouton déconnexion */}
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    headerBg: {
        backgroundColor: '#5c3d2e', alignItems: 'center',
        paddingBottom: 30, paddingHorizontal: 20,
    },
    pageTitle: { color: '#fff', fontSize: 18, fontWeight: FONTS.bold },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 },
    avatarContainer: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center',
        alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#fff',
    },
    avatar: { justifyContent: 'center', alignItems: 'center' },
    name: { color: '#fff', fontSize: 20, fontWeight: FONTS.bold, marginBottom: 4 },
    cne: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14,
        paddingVertical: 4, borderRadius: 20,
    },
    badgeText: { color: '#fff', fontSize: 12 },
    statsRow: {
        flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16,
        marginTop: -20, borderRadius: 12, elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    },
    statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f0f0f0' },
    statNum: { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.text, marginTop: 4 },
    statLbl: { fontSize: 11, color: COLORS.subtitle, marginTop: 2 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16,
        marginTop: 16, padding: 16, elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: 12 },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 10,
    },
    infoLabel: { flex: 1, color: COLORS.subtitle, fontSize: 13 },
    infoValue: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
    logoutBtn: { alignItems: 'center', marginTop: 24 },
    logoutText: { color: '#e53e3e', fontSize: 16, fontWeight: FONTS.bold },
});
