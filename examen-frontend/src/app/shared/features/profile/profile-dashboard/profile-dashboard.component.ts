import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProfileService,
  ProfileSummary,
  ProgressPoint,
  ProgressResponse,
  PeriodSummary,
  ProfileAnalytics
} from '../services/profile.service';
import { SessionService, SessionResponse } from '../../../../core/services/session.service';
import { Router, RouterModule } from '@angular/router';
import { MotionDirective } from '../../../motion/motion.directive';
import { GrowthService, GratitudeEntry, HabitScoreEntry, WeeklySummary } from '../services/growth.service';
import { InsightsService, InsightsSummary, SessionInsight } from '../services/insights.service';
import { NotificationItem, NotificationService } from '../services/notification.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MotionDirective],
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.scss']
})
export class ProfileDashboardComponent implements OnInit {
  summary: ProfileSummary | null = null;
  loading = false;
  sessions: SessionResponse[] = [];
  progress: ProgressPoint[] = [];
  weekly?: PeriodSummary;
  monthly?: PeriodSummary;
  analytics?: ProfileAnalytics;
  weeklyGrowth?: WeeklySummary;
  gratitudeEntries: GratitudeEntry[] = [];
  habitScores: HabitScoreEntry[] = [];
  suggestions: string[] = [];
  gratitudeDraft = '';
  habitDraft = '';
  habitScore = 3;
  growthLoading = false;
  growthError = '';
  insightsSummary?: InsightsSummary;
  sessionInsight?: SessionInsight;
  suggestedQuestions: string[] = [];
  suggestionFocus = 'gratitude';
  insightsError = '';
  notifications: NotificationItem[] = [];
  notificationsError = '';
  notificationsLoading = false;

  constructor(
    private profileService: ProfileService,
    private sessionService: SessionService,
    private growthService: GrowthService,
    private insightsService: InsightsService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    // no-op
  }

  ngOnInit(): void {
    this.loading = true;
    this.profileService.refresh$.subscribe(() => this.reload());
    this.reload();
  }

  private reload(): void {
    this.loadGrowth();
    this.loadInsightsSummary();
    this.refreshQuestionSuggestions();
    this.loadNotifications();
    this.profileService.getSummaryForLast30Days().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: () => {
      },
      complete: () => {
        this.loading = false;
        this.loadSessions();
        this.loadProgress();
        this.loadPeriodSummaries();
        this.loadAnalytics();
      }
    });
  }

  private loadSessions(): void {
    this.sessionService.getMine(0, 5).subscribe({
      next: res => {
        this.sessions = res.content;
        this.loadSessionInsight();
      },
      error: () => (this.sessions = [])
    });
  }

  private loadProgress(): void {
    this.profileService.getProgress(14).subscribe({
      next: (res: ProgressResponse) => (this.progress = res.points || []),
      error: () => (this.progress = [])
    });
  }

  private loadPeriodSummaries(): void {
    this.profileService.getWeekly().subscribe({
      next: res => (this.weekly = res),
      error: () => {}
    });
    this.profileService.getMonthly().subscribe({
      next: res => (this.monthly = res),
      error: () => {}
    });
  }

  private loadAnalytics(): void {
    this.profileService.getAnalytics().subscribe({
      next: res => (this.analytics = res),
      error: () => (this.analytics = undefined)
    });
  }

  private loadGrowth(): void {
    this.growthLoading = true;
    this.growthError = '';

    forkJoin({
      weekly: this.growthService.getWeeklySummary().pipe(catchError(() => of(undefined))),
      gratitude: this.growthService.getGratitude().pipe(catchError(() => of([]))),
      habits: this.growthService.getHabits(30).pipe(catchError(() => of([]))),
      suggestions: this.growthService.getSuggestions().pipe(catchError(() => of([])))
    }).subscribe(res => {
      this.weeklyGrowth = res.weekly;
      this.gratitudeEntries = res.gratitude;
      this.habitScores = res.habits;
      this.suggestions = res.suggestions;
      this.growthLoading = false;
    });
  }

  addGratitude(): void {
    if (!this.gratitudeDraft.trim()) {
      return;
    }

    this.growthError = '';
    this.growthService.addGratitude(this.gratitudeDraft.trim()).subscribe({
      next: entry => {
        this.gratitudeEntries = [entry, ...this.gratitudeEntries];
        this.gratitudeDraft = '';
        if (this.weeklyGrowth) {
          this.weeklyGrowth.gratitudeCount += 1;
        }
      },
      error: () => {
        this.growthError = 'Could not save gratitude entry.';
      }
    });
  }

  addHabitScore(): void {
    if (!this.habitDraft.trim()) {
      return;
    }

    this.growthError = '';
    this.growthService.addHabitScore(this.habitDraft.trim(), this.habitScore).subscribe({
      next: entry => {
        this.habitScores = [entry, ...this.habitScores];
        this.habitDraft = '';
        this.habitScore = 3;
        if (this.weeklyGrowth) {
          const currentCount = this.weeklyGrowth.habitsScored;
          const currentTotal = this.weeklyGrowth.averageHabitScore * currentCount;
          const nextCount = currentCount + 1;
          this.weeklyGrowth.habitsScored = nextCount;
          this.weeklyGrowth.averageHabitScore = (currentTotal + entry.score) / nextCount;
        }
      },
      error: () => {
        this.growthError = 'Could not save habit score.';
      }
    });
  }

  downloadReport(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.growthError = '';
    this.growthService.exportPdf().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'examen-summary.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.growthError = 'Could not export the report.';
      }
    });
  }

  get gratitudePreview(): GratitudeEntry[] {
    return this.gratitudeEntries.slice(0, 4);
  }

  get habitPreview(): HabitScoreEntry[] {
    return this.habitScores.slice(0, 4);
  }

  refreshQuestionSuggestions(): void {
    const focus = this.suggestionFocus?.trim() || 'gratitude';
    this.insightsError = '';
    this.insightsService.suggestQuestions(focus, 5).subscribe({
      next: res => {
        this.suggestedQuestions = res.suggestions || [];
      },
      error: () => {
        this.suggestedQuestions = [];
        this.insightsError = 'Could not load question suggestions.';
      }
    });
  }

  markNotificationRead(notification: NotificationItem): void {
    if (notification.readAt) {
      return;
    }
    this.notificationService.markRead(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.map(item =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item
        );
      },
      error: () => {
        this.notificationsError = 'Could not mark notification as read.';
      }
    });
  }

  private loadInsightsSummary(): void {
    this.insightsError = '';
    this.insightsService.getSummary(30).subscribe({
      next: res => {
        this.insightsSummary = res;
      },
      error: () => {
        this.insightsSummary = undefined;
        this.insightsError = 'Could not load insights summary.';
      }
    });
  }

  private loadSessionInsight(): void {
    const latestCompleted = this.sessions.find(item => !!item.completedAt);
    if (!latestCompleted?.id) {
      this.sessionInsight = undefined;
      return;
    }
    this.insightsService.analyzeSession(latestCompleted.id).subscribe({
      next: res => {
        this.sessionInsight = res;
      },
      error: () => {
        this.sessionInsight = undefined;
      }
    });
  }

  private loadNotifications(): void {
    this.notificationsLoading = true;
    this.notificationsError = '';
    this.notificationService.list(false).subscribe({
      next: res => {
        this.notifications = res || [];
        this.notificationsLoading = false;
      },
      error: () => {
        this.notifications = [];
        this.notificationsLoading = false;
        this.notificationsError = 'Could not load notifications.';
      }
    });
  }
}
