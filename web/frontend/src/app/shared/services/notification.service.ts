import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface AbsenceNotification {
  nomModule: string;
  count: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = 'http://localhost:8080/api/uca';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getAbsenceNotifications(): Observable<AbsenceNotification[]> {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return of([]);
    const user = JSON.parse(userRaw);
    if (!user?.id) return of([]);

    return this.http
      .get<any[]>(`${this.base}/absenceDetail/student/${user.id}`, { headers: this.getHeaders() })
      .pipe(
        map((details) => {
          const map: Record<string, { count: number; date: string }> = {};
          details.filter((d) => d.estAbsent).forEach((d) => {
            const key = d.nomModule || 'Module inconnu';
            if (!map[key]) map[key] = { count: 0, date: d.date || '' };
            map[key].count++;
          });
          return Object.entries(map).map(([nomModule, v]) => ({ nomModule, ...v }));
        }),
        catchError(() => of([]))
      );
  }
}
