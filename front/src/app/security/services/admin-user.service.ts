import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/shared/models/user';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = `${environment.apiUrl}admin/users`;

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.adminApi);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.adminApi, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${id}`);
  }
}
