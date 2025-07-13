import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SectionService {
  private apiUrl = 'https://localhost:7072/api/Sections';

  constructor(private http: HttpClient) {}

  getSections(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSectionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSection(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getAuthHeaders());
  }

  updateSection(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getAuthHeaders());
  }

  deleteSection(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    };
  }
}
