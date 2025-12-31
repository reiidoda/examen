import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  Category,
  PageResponse,
  Question,
  SessionAnswerRequest,
  SessionSummary
} from '../models/examination.model';

@Injectable({
  providedIn: 'root'
})
export class ExaminationService {
  private baseUrl = `${environment.apiUrl}/sessions`;
  private categoryUrl = `${environment.apiUrl}/categories`;
  private questionUrl = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {}

  getActiveSession(): Observable<SessionSummary | null> {
    return this.http.get<SessionSummary | null>(`${this.baseUrl}/active`);
  }

  startSession(): Observable<SessionSummary> {
    return this.http.post<SessionSummary>(`${this.baseUrl}/start`, {});
  }

  submitSession(
    sessionId: number,
    answers: SessionAnswerRequest[],
    notes?: string,
    moodScore?: number
  ): Observable<SessionSummary> {
    return this.http.post<SessionSummary>(`${this.baseUrl}/${sessionId}/submit`, {
      answers,
      notes,
      moodScore
    });
  }

  getHistory(page = 0, size = 10): Observable<PageResponse<SessionSummary>> {
    return this.http.get<PageResponse<SessionSummary>>(`${this.baseUrl}/me`, {
      params: { page, size }
    });
  }

  getCategories(size = 200): Observable<Category[]> {
    return this.http
      .get<PageResponse<Category>>(this.categoryUrl, { params: { page: 0, size } })
      .pipe(map(res => res.content));
  }

  getQuestionsByCategory(categoryId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.questionUrl}/category/${categoryId}`);
  }
}
