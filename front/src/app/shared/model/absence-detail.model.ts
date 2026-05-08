export interface AbsenceDetailDto {
  id?: number;
  absenceId?: number;
  studentId: number;
  studentFirstName?: string;
  studentLastName?: string;
  studentCne?: string;
  estAbsent: boolean;
}
