import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = 'http://10.181.4.71:8080/api/uca';

async function authHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const absenceApi = {
  // Stats étudiant connecté — endpoint principal du dashboard
  getStudentStats: async (): Promise<{
    totalAbsences: number;
    totalPresent: number;
    attendanceRate: number;
    absencesByModule: Record<string, number>;
    recentAbsences: { module: string; date: string; absent: boolean }[];
    firstName: string | null;
    filier: string | null;
    promo: string | null;
  }> => {
    const headers = await authHeaders();
    const res = await fetch(`${BASE}/statistics/student/stats`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
