import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://compass.runasp.net/api/Auth';
  isAdmin = signal(false);
  isSuperAdmin = signal(false);
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuthState();
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }
  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        console.log('Login response:', response);
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.updateAuthState(response.token);
          this.router.navigate(['/']);
        }
      })
    );
  }

  register(credentials: any) {
    return this.http
      .post<any>(`${this.apiUrl}/register-admin`, credentials, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (response) => {
            console.log('Register response:', response);
            if (response && response.token) {
              localStorage.setItem('token', response.token);
              this.updateAuthState(response.token);
              this.router.navigate(['/']);
            }
          },
          error: (error) => {
            console.error('Register error:', error.status, error.error);
            throw error; // للسماح بمعالجة الخطأ في المكون
          },
        })
      );
  }
  registerSuperAdmin(credentials: any) {
    return this.http.post<any>(
      `${this.apiUrl}/register-superadmin`,
      credentials,
      { headers: this.getHeaders() }
    );
  }

  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admins`, {
      headers: this.getHeaders(),
    });
  }

  updateAdmin(id: string, data: { email: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-admin/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-admin/${id}`, {
      headers: this.getHeaders(),
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAdmin.set(false);
    this.isSuperAdmin.set(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      console.log('Token expiry check:', {
        exp: payload.exp,
        now,
        expired: payload.exp < now,
      });
      return payload.exp < now;
    } catch (error) {
      console.log('Error checking token expiry:', error);
      return true;
    }
  }

  initializeAuthState(): void {
    const token = localStorage.getItem('token');
    console.log(
      'initializeAuthState called with token:',
      token ? 'exists' : 'null'
    );

    if (token && !this.isTokenExpired()) {
      this.updateAuthState(token);
    } else {
      this.isAdmin.set(false);
      this.isSuperAdmin.set(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  private updateAuthState(token: string): void {
    const decodedToken = this.jwtHelper.decodeToken(token);
    const roles =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ] || [];
    const roleArray = Array.isArray(roles) ? roles : [roles];

    this.isAdmin.set(
      roleArray.includes('Admin') || roleArray.includes('SuperAdmin')
    );
    this.isSuperAdmin.set(roleArray.includes('SuperAdmin'));
    console.log('Auth state updated:', {
      isAdmin: this.isAdmin(),
      isSuperAdmin: this.isSuperAdmin(),
    });
  }

  getIsAdmin(): boolean {
    return this.isAdmin();
  }

  getIsSuperAdmin(): boolean {
    console.log(this.isSuperAdmin());

    return this.isSuperAdmin();
  }
}
