import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbsenceDto } from '../model/absence.model';
import { AbsenceDetailDto } from '../model/absence-detail.model';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private readonly baseUrl = 'http://localhost:8080/api/uca';

  constructor(private readonly http: HttpClient) {}

  getByFiliereAndPromo(filiere: string, promo: string): Observable<AbsenceDto[]> {
    return this.http.get<AbsenceDto[]>(`${this.baseUrl}/absence/filiere-promo/${filiere}/${promo}`);
  }

  saveAbsence(absence: AbsenceDto): Observable<AbsenceDto> {
    return this.http.post<AbsenceDto>(`${this.baseUrl}/absence/save`, absence);
  }

  saveAbsenceDetail(detail: AbsenceDetailDto): Observable<AbsenceDetailDto> {
    return this.http.post<AbsenceDetailDto>(`${this.baseUrl}/absenceDetail/save`, detail);
  }

  getStudentsByFiliereAndPromo(filiere: string, promo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/students/${filiere}/${promo}`);
  }
}
