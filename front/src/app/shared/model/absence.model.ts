import { AbsenceDetailDto } from './absence-detail.model';

export interface AbsenceDto {
  id?: number;
  teacherId: number;
  teacherFirstName?: string;
  teacherLastName?: string;
  nomModule: string;
  filiere: string;
  promo: string;
  typeSeance: string;
  date: string;        // ISO string "YYYY-MM-DD"
  createdAt?: string;  // ISO string datetime
  absenceDetails?: AbsenceDetailDto[];
}
