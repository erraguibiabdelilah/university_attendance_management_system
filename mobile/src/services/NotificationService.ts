import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BASE_URL = 'http://10.181.4.71:8080/api/uca';

// Vérifie les absences et affiche une alerte si ≥ 2 absences par module
export async function checkAndNotifyAbsences(): Promise<void> {
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
        const absences = await absRes.json();

        // Compter par module
        const moduleCount: Record<string, number> = {};
        absences.filter((a: any) => a.estAbsent).forEach((a: any) => {
            const module = a.nomModule || 'Module inconnu';
            moduleCount[module] = (moduleCount[module] || 0) + 1;
        });

        // Trouver les modules avec ≥ 2 absences
        const alerts = Object.entries(moduleCount)
            .filter(([_, count]) => count >= 2)
            .map(([module, count]) => `• ${module} : ${count} absences`);

        if (alerts.length > 0) {
            const sentKey = `notif_shown_${user.id}`;
            const sentRaw = await AsyncStorage.getItem(sentKey);
            const sent: Record<string, number> = sentRaw ? JSON.parse(sentRaw) : {};

            const newAlerts = Object.entries(moduleCount)
                .filter(([module, count]) => count >= 2 && sent[module] !== count)
                .map(([module, count]) => {
                    sent[module] = count;
                    return `• ${module} : ${count} absences`;
                });

            if (newAlerts.length > 0) {
                await AsyncStorage.setItem(sentKey, JSON.stringify(sent));
                Alert.alert(
                    '⚠️ Alerte Absences',
                    `Vous avez atteint le seuil d'absences dans :\n\n${newAlerts.join('\n')}\n\nPensez à justifier vos absences !`,
                    [{ text: 'OK' }]
                );
            }
        }
    } catch (e) {
        console.error('Erreur vérification absences:', e);
    }
}

export async function setupPushNotifications(_studentId: number): Promise<void> {
    // Push notifications désactivées pour Expo Go
    // Utilisation des alertes locales à la place
}
