import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Absence, AbsenceDetail, CreateAbsencePayload, MarkAbsencePayload, StudentStats } from '../models/absence.model';

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/absences`;

  createAbsence(payload: CreateAbsencePayload): Observable<Absence> {
    return this.http.post<Absence>(this.baseUrl, payload).pipe(catchError(this.handleError));
  }

  markAbsences(absenceId: number, payload: MarkAbsencePayload): Observable<Absence> {
    return this.http.put<Absence>(`${this.baseUrl}/${absenceId}/mark`, payload).pipe(catchError(this.handleError));
  }

  getAbsencesByTeacher(teacherId: number): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.baseUrl}/teacher/${teacherId}`).pipe(catchError(this.handleError));
  }

  getAbsencesByFiliereAndPromo(filiere: string, promo: string): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.baseUrl}/filiere/${encodeURIComponent(filiere)}/promo/${encodeURIComponent(promo)}`).pipe(catchError(this.handleError));
  }

  getAbsenceDetails(absenceId: number): Observable<AbsenceDetail[]> {
    return this.http.get<AbsenceDetail[]>(`${this.baseUrl}/${absenceId}/details`).pipe(catchError(this.handleError));
  }

  getStudentStats(studentId: number): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.baseUrl}/student/${studentId}/stats`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message || error.error?.error || 'Unable to process attendance request.';
    return throwError(() => new Error(message));
  }
}
