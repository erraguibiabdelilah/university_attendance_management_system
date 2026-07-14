import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Absence, AbsenceDetail, RefData, SaveAbsencePayload } from '../models/absence.model';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private readonly base = 'http://localhost:8080/api/uca/absence';

  item: User = new User();

  constructor(private http: HttpClient) { }

  getAll(): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.base}/`);
  }

  getById(id: number): Observable<Absence> {
    return this.http.get<Absence>(`${this.base}/${id}`);
  }

  saveAbsenceWithDetails(payload: SaveAbsencePayload): Observable<number> {
    return this.http.post<number>(`${this.base}/`, payload);
  }

  updateAbsenceWithDetails(id: number, payload: SaveAbsencePayload): Observable<Absence> {
    return this.http.put<Absence>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }

  getDetailsByAbsenceId(absenceId: number): Observable<AbsenceDetail[]> {
    return this.http.get<AbsenceDetail[]>(`http://localhost:8080/api/uca/absenceDetail/absence/${absenceId}`);
  }

  saveDetail(detail: AbsenceDetail): Observable<AbsenceDetail> {
    return this.http.post<AbsenceDetail>(`http://localhost:8080/api/uca/absenceDetail/`, detail);
  }

  updateDetail(id: number, detail: AbsenceDetail): Observable<AbsenceDetail> {
    return this.http.put<AbsenceDetail>(`http://localhost:8080/api/uca/absenceDetail/${id}`, detail);
  }

  deleteDetail(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/uca/absenceDetail/${id}`);
  }

  getRefData(): Observable<RefData> {
    return of({
      filieres: ['IRISI', 'SIT', 'GI', 'GC'],
      promos: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
      typeSeances: [
        { value: 'COURS', label: 'Cours' },
        { value: 'TD', label: 'TD' },
        { value: 'TP', label: 'TP' }
      ]
    });
  }
}
