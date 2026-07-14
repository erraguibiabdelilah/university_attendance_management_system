import { User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _item!: User;
  private _items: Array<User> = new Array<User>();

  private url = environment.apiUrl + 'auth/';

  constructor(private http: HttpClient ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  login(): Observable<string> {
    return this.http.post(this.url + 'sign-in/', this.item, { responseType: 'text' });
  }

  register(): Observable<User> {
    return this.http.post<User>(this.url + 'login/', this.item, { headers: this.getAuthHeaders() });
  }

  uploadStudentFace(file: File, userId: number): Observable<unknown> {
    const cloudName = 'dgxnjtmzq';
    const uploadPreset = 'student_photos';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'student_photos');

    return this.http.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    ).pipe(
      switchMap((res: any) => {
        const photoUrl = res.secure_url;
        return this.http.post(`${this.url}${userId}/photo-url`, { photoUrl });
      })
    );
  }

  gitAll(): Observable<Array<User>> {
    return this.http.get<Array<User>>(this.url);
  }

  public update(): Observable<User> {
    return this.http.put<User>(this.url + 'login/', this.item, { headers: this.getAuthHeaders() });
  }

  public delete(id: number): Observable<number> {
    return this.http.delete<number>(this.url + 'id/' + id);
  }

  loadUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(this.url + 'username/' + username, { headers: this.getAuthHeaders() });
  }

  findByUsername(username: string): Observable<User> {
    return this.http.get<User>(this.url + 'username/' + username);
  }

  getStudents(filiere: string, promo: string): Observable<Array<User>> {
    return this.http.get<Array<User>>(`${this.url}filier/${filiere}/promo/${promo}`);
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
