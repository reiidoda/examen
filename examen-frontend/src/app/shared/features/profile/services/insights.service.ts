import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../../core/services/api-config.service';

export interface InsightsSummary {
  summary: string;
  highlights: string[];
  periodDays: number;
  sessionsCompleted: number;
  averageFeeling: number | null;
  generatedAt: string;
}

export interface QuestionSuggestions {
  focus: string;
  suggestions: string[];
  generatedAt: string;
}

export interface SessionInsight {
  sessionId: number;
  summary: string;
  insights: string[];
  nextSteps: string[];
  averageFeeling: number | null;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class InsightsService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private api: ApiConfigService
  ) {
    this.baseUrl = this.api.endpoint('insights');
  }

  getSummary(days = 30): Observable<InsightsSummary> {
    return this.http.get<InsightsSummary>(`${this.baseUrl}/summary`, { params: { days } });
  }

  suggestQuestions(focus: string, count = 5): Observable<QuestionSuggestions> {
    return this.http.post<QuestionSuggestions>(`${this.baseUrl}/questions`, { focus, count });
  }

  analyzeSession(sessionId: number): Observable<SessionInsight> {
    return this.http.post<SessionInsight>(`${this.baseUrl}/session`, { sessionId });
  }
}
