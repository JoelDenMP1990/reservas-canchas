import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginDto, LoginResponse, RegisterDto } from '../models/auth.model';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/auth`;

  private currentUserSubject!: BehaviorSubject<User | null>;
  public currentUser$!: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    // ✅ AQUÍ ya existe storageService
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.storageService.getUser()
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(credentials: LoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.storageService.setToken(response.access_token);
        this.storageService.setRefreshToken(response.refresh_token);
        this.storageService.setUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(data: RegisterDto): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.storageService.getRefreshToken();
    return this.http.post(`${this.API_URL}/refresh`, { refresh_token: refreshToken }).pipe(
      tap((response: any) => {
        this.storageService.setToken(response.access_token);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.storageService.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}
