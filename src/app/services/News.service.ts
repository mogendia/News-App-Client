import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = 'https://localhost:7072/api/News';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token in headers:', token ? 'Token exists' : 'No token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getNews(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getNewsById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getNewsBySection(sectionId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/section/${sectionId}`);
}

searchNews(query: string): Observable<any[]> {
  return this.http.get<any[]>(`https://localhost:7072/api/News/search?query=${query}`);
}

  addNews(formData: FormData): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post(`${this.apiUrl}`, formData, { headers });
}

deleteNews(id: number): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.delete(`${this.apiUrl}/${id}`, { headers });
}

  updateNews(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

getHomePageNews(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/homepage`);
}
  addBreakingNews(text: string): Observable<any> {
    // For now, we'll create a regular news item with a special flag for breaking news
    const breakingNewsData = {
      title: `عاجل: ${text}`,
      content: text,
      imageUrl: '/assets/images/breaking-news.jpg',
      isBreaking: true
    };
    return this.http.post(this.apiUrl, breakingNewsData, { headers: this.getHeaders() });
  }
  getBreakingNews(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/breaking`);
}

createNewsWithFile(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}`, formData, { headers: this.getHeaders() });
}

  updateNewsWithFile(id: number, formData: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, formData, { headers: this.getHeaders() });
}
}
