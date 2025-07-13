import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreakingNewsService {
  private apiUrl = 'https://localhost:7072/api/News/breaking';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getBreakingNews(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

createBreakingNews(data: any): Observable<any> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('sectionId', data.sectionId.toString());
  formData.append('isImportant', 'true'); // ✅ خبر عاجل
  formData.append('isHomePage', data.isHomePage ? 'true' : 'false');

  if (data.image) {
    formData.append('image', data.image);
  }

  if (data.mediaFiles && data.mediaFiles.length > 0) {
    for (let file of data.mediaFiles) {
      formData.append('mediaFiles', file);
    }
  }

  return this.http.post(this.apiUrl, formData, { headers });
}


  updateBreakingNews(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteBreakingNews(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
