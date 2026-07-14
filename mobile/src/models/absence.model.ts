export interface Absence {
  id?: number;
  teacherId: number;
  teacherFirstName: string;
  teacherLastName: string;
  nomModule: string;
  filiere: string;
  promo: string;
  typeSeance: string;
  date?: string;
  createdAt?: string;
  absenceDetails?: AbsenceDetail[];
}

export interface AbsenceDetail {
  id?: number;
  absenceId?: number;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  studentCne: string;
  estAbsent: boolean;
}

export interface SaveAbsencePayload {
  absence: Absence;
  details: AbsenceDetail[];
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  cne: string;
  filiere?: string;
  promo?: string;
}
