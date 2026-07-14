import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.181.4.71:8080/api/uca/justification';

export interface Justification {
    id: number;
    absenceDetailId: number;
    studentId: number;
    studentFirstName: string;
    studentLastName: string;
    fichierUrl: string;
    motif: string;
    commentaire: string;
    dateDepot: string;
    statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
    motifRefus: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getJustificationsByStudent(studentId: number): Promise<Justification[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/student/${studentId}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function submitJustification(
    absenceDetailId: number,
    studentId: number,
    motif: string,
    commentaire: string,
    fileUri: string,
    fileName: string,
    fileType: string
): Promise<Justification> {
    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();
    formData.append('absenceDetailId', String(absenceDetailId));
    formData.append('studentId', String(studentId));
    formData.append('motif', motif);
    if (commentaire) formData.append('commentaire', commentaire);
    formData.append('file', { uri: fileUri, name: fileName, type: fileType } as any);

    const res = await fetch(BASE_URL + '/', {
        method: 'POST',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
