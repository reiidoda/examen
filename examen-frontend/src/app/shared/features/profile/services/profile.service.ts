import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ProfileSummary {
  examinationsCompleted: number;
  todosCompleted: number;
  categoriesUsed: number;
  streakDays: number;
  averageMoodLast30Days?: number | null;
  todayMood?: number | null;
  sessionsThisWeek?: number;
  sessionsThisMonth?: number;
  todayCompleted?: boolean;
  recentMoodTrend?: MoodPoint[];
}

export interface MoodPoint {
  date: string;
  mood: number | null;
}

export interface ProgressPoint {
  date: string;
  completed: boolean;
  mood: number | null;
}

export interface ProgressResponse {
  points: ProgressPoint[];
}

export interface PeriodSummary {
  period: string;
  sessions: number;
  completedDays: number;
  averageMood: number | null;
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  answers: number;
  averageScore: number | null;
  yesRate: number | null;
}

export interface WeeklyTrendPoint {
  weekStart: string;
  sessions: number;
  averageMood: number | null;
}

export interface ProfileAnalytics {
  overallAverageScore: number | null;
  overallMood: number | null;
  categories: CategoryBreakdown[];
  weeklyTrend: WeeklyTrendPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = `${environment.apiUrl}/profile`;
  refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  /**
   * Loads summary for the last 30 days (as your backend does).
   */
  getSummaryForLast30Days(): Observable<ProfileSummary> {
    return this.http.get<ProfileSummary>(`${this.baseUrl}/summary`);
  }

  getProgress(days = 14): Observable<ProgressResponse> {
    return this.http.get<ProgressResponse>(`${this.baseUrl}/progress`, { params: { days } });
  }

  getWeekly(): Observable<PeriodSummary> {
    return this.http.get<PeriodSummary>(`${this.baseUrl}/summary/weekly`);
  }

  getMonthly(): Observable<PeriodSummary> {
    return this.http.get<PeriodSummary>(`${this.baseUrl}/summary/monthly`);
  }

  getAnalytics(): Observable<ProfileAnalytics> {
    return this.http.get<ProfileAnalytics>(`${this.baseUrl}/analytics`);
  }
}
