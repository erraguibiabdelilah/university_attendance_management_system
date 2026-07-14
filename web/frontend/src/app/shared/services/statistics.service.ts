import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatisticsDto {
  totalStudents: number;
  totalTeachers: number;
  tauxAbsence: number;
  absencesParMoisParFiliere: { [filiere: string]: number[] };
  absencesTotalParFiliere: { [filiere: string]: number };
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly baseUrl = 'http://localhost:8080/api/uca/statistics/';

  constructor(private http: HttpClient) { }

  getStatistics(): Observable<StatisticsDto> {
    return this.http.get<StatisticsDto>(this.baseUrl);
  }
}
