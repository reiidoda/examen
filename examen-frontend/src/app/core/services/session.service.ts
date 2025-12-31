import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SessionResponse {
  id: number;
  startedAt: string;
  completedAt: string;
  notes?: string;
  score?: number;
}

export interface PageResponse<T> {
  content: T[];
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private baseUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  getMine(page = 0, size = 5): Observable<PageResponse<SessionResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<SessionResponse>>(`${this.baseUrl}/me`, { params });
  }
}
