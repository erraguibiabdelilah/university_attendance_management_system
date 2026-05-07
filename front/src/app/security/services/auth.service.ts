import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly authApi = `${environment.apiUrl}auth/`;

  private _item: User = new User();
  private _items: Array<User> = [];

  public login(): Observable<string> {
    return this.http.post(`${this.authApi}sign-in/`, this.item, {
      responseType: 'text'
    });
  }

  public register(): Observable<User> {
    return this.http.post<User>(`${this.authApi}login/`, this.item);
  }

  public loadUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.authApi}username/${username}`);
  }

  get item(): User {
    return this._item;
  }

  set item(value: User) {
    this._item = value;
  }

  get items(): Array<User> {
    return this._items;
  }

  set items(value: Array<User>) {
    this._items = value;
  }
}
