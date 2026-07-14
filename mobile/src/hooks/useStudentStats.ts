import { useState, useEffect, useCallback } from 'react';
import { absenceApi } from '../services/absenceApi';

interface StudentStats {
  totalAbsences: number;
  totalPresent: number;
  attendanceRate: number;
  absencesByModule: Record<string, number>;
  recentAbsences: { module: string; date: string; absent: boolean }[];
  firstName: string | null;
  filier: string | null;
  promo: string | null;
}

export const useStudentStats = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await absenceApi.getStudentStats();
      setStats(data);
    } catch {
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};
