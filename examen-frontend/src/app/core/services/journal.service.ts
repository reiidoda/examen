import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JournalEntry {
  id: number;
  content: string;
  createdAt: string;
}

export interface JournalCreateRequest {
  content: string;
}

@Injectable({ providedIn: 'root' })
export class JournalService {
  private baseUrl = `${environment.apiUrl}/journal`;

  constructor(private http: HttpClient) {}

  create(payload: JournalCreateRequest): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(this.baseUrl, payload);
  }

  getRecent(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(this.baseUrl);
  }
}
