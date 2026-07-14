
export interface Absence {
  id?: number;
  teacherId: number;
  teacherFirstName: string;
  teacherLastName: string;
  nomModule: string;
  filiere: string;
  promo: string;
  typeSeance: string;
  date?: string; // "YYYY-MM-DD"  — auto
  createdAt?: string; // ISO string    — auto
}

// ── Mirrors AbsenceDetailDto (Spring Boot backend) ────────────────────
export interface AbsenceDetail {
  id?: number;
  absenceId?: number;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  studentCne: string;
  estAbsent: boolean;
}

// ── Payload envoyé en une seule requête POST ──────────────────────────
export interface SaveAbsencePayload {
  absence: Absence;
  details: AbsenceDetail[];
}

// ── Données de référence (data.json) ─────────────────────────────────
export interface RefData {
  filieres: string[];
  promos: string[];
  typeSeances: { value: string; label: string }[];
}
