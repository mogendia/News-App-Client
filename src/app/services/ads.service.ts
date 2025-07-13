import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdsService {
  private apiUrl = 'https://localhost:7072/api/Ads';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAds(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAdById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAd(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  updateAd(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteAd(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  private getHeadersWithoutContentType(): HttpHeaders {
  const token = localStorage.getItem('token');
  let headers = new HttpHeaders();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  return headers; // DON'T manually set Content-Type
}
}
