import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://compass.runasp.net/api/Auth';
  isAdmin = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAdminState();
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          // Store user info if available
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          // Set admin to true since we logged in successfully
          this.isAdmin.set(true);
          console.log('Admin status set to true after login');

          this.router.navigate(['/']);
        }
      })
    );
  }

  register(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/register-admin`, credentials);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAdmin.set(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      console.log('Token expiry check:', { exp: payload.exp, now: now, expired: payload.exp < now });
      return payload.exp < now;
    } catch (error) {
      console.log('Error checking token expiry:', error);
      return true;
    }
  }

  // Initialize admin state on app start
  initializeAdminState(): void {
    const token = localStorage.getItem('token');
    console.log('initializeAdminState called with token:', token ? 'exists' : 'null');

    if (token) {
      if (!this.isTokenExpired()) {
        this.isAdmin.set(true);
        console.log('Admin state initialized: true (token valid)');
      } else {
        this.isAdmin.set(false);
        console.log('Admin state initialized: false (token expired)');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      this.isAdmin.set(false);
      console.log('Admin state initialized: false (no token)');
    }
  }

  getIsAdmin(): boolean {
    return this.isAdmin();
  }
}
