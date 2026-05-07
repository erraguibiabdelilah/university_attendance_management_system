export interface AbsenceDetail {
  id?: number;
  studentId: number;
  studentNom?: string;
  studentPrenom?: string;
  studentCNE?: string;
  estAbsent: boolean;
}

export interface Absence {
  id?: number;
  teacherId: number;
  teacherNom?: string;
  teacherPrenom?: string;
  nomModule: string;
  filiere: string;
  promo: string;
  typeSeance: string;
  date: string;
  createdAt?: string;
  details: AbsenceDetail[];
}

export interface CreateAbsencePayload {
  teacherId: number;
  nomModule: string;
  filiere: string;
  promo: string;
  typeSeance: string;
  date: string;
  studentIds: number[];
}

export interface MarkAbsencePayload {
  absentStudentIds: number[];
}

export interface StudentStats {
  totalSessions: number;
  totalAbsences: number;
}
