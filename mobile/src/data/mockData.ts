export type AbsenceStatus = 'JUSTIFIÉE' | 'NON JUSTIFIÉE' | 'EN ATTENTE';

export interface AbsenceRecord {
  id: string;
  name: string;
  level: string;
  date: string;
  professor: string;
  status: AbsenceStatus;
}

export const mockAbsences: AbsenceRecord[] = [
  {
    id: '1',
    name: 'Algorithmique Avancée',
    level: 'Licence 3',
    date: 'Aujourd\'hui 09:00',
    professor: 'Dr. Youssef',
    status: 'EN ATTENTE',
  },
  {
    id: '2',
    name: 'Intelligence Artificielle',
    level: 'Master 1',
    date: '24 Mai 2026',
    professor: 'Prof. Amrani',
    status: 'NON JUSTIFIÉE',
  },
  {
    id: '3',
    name: 'Réseaux & Systèmes',
    level: 'Licence 3',
    date: '23 Mai 2026',
    professor: 'Dr. Idrissi',
    status: 'JUSTIFIÉE',
  },
  {
    id: '4',
    name: 'Base de Données',
    level: 'Licence 3',
    date: '10 Mai 2026',
    professor: 'Prof. Benali',
    status: 'JUSTIFIÉE',
  },
];
