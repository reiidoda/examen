import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  constructor(
    private profileService: ProfileService,
    private sessionService: SessionService,
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
      next: res => (this.sessions = res.content),
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
}
