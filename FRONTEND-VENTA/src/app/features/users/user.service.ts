import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserDto, UpdateUserDto } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/email/${email}`);
  }

  create(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  update(id: string, user: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}`, user);
  }

  updatePassword(id: string, password: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/password`, { password });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  activate(id: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/activate`, {});
  }

  deactivate(id: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/deactivate`, {});
  }

  restore(id: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/restore`, {});
  }
}