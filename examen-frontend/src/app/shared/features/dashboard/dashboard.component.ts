import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfileService, ProfileSummary } from '../profile/services/profile.service';
import { ExaminationService } from '../examination/services/examination.service';
import { SessionSummary } from '../examination/models/examination.model';
import { Todo, TodoService } from '../todos/services/todo.service';
import { QuestionService } from '../../../core/services/question.service';
import { CategoryService } from '../../../categories/category-list/services/category.service';
import { MotionDirective } from '../../motion/motion.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MotionDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  summary: ProfileSummary | null = null;
  activeSession: SessionSummary | null = null;
  upcomingTodos: Todo[] = [];
  overdueCount = 0;
  aiQuestionCount = 0;
  customQuestionCount = 0;
  categoryCount = 0;

  constructor(
    private profileService: ProfileService,
    private examinationService: ExaminationService,
    private todoService: TodoService,
    private questionService: QuestionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get todayStatus(): string {
    if (this.activeSession) {
      return 'Session in progress';
    }
    if (this.summary?.todayCompleted) {
      return 'Completed today';
    }
    return 'Not started';
  }

  get feelingDisplay(): string {
    const feeling = this.summary?.todayMood;
    return feeling != null ? `${feeling}/5` : '-';
  }

  private load(): void {
    this.loading = true;

    forkJoin({
      summary: this.profileService.getSummaryForLast30Days().pipe(catchError(() => of(null))),
      activeSession: this.examinationService.getActiveSession().pipe(catchError(() => of(null))),
      todos: this.todoService.getAll().pipe(catchError(() => of([]))),
      allQuestions: this.questionService.getAll(200).pipe(catchError(() => of([]))),
      customQuestions: this.questionService.getMine().pipe(catchError(() => of([]))),
      categories: this.categoryService.getAll().pipe(catchError(() => of([])))
    }).subscribe(({ summary, activeSession, todos, allQuestions, customQuestions, categories }) => {
      this.summary = summary;
      this.activeSession = activeSession;
      this.customQuestionCount = customQuestions.length;
      this.aiQuestionCount = allQuestions.filter(q => !q.custom).length;
      this.categoryCount = categories.length;

      const now = Date.now();
      this.overdueCount = todos.filter(todo => !todo.completed && new Date(todo.dueAt).getTime() < now).length;
      this.upcomingTodos = [...todos]
        .filter(todo => !todo.completed)
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
        .slice(0, 4);

      this.loading = false;
    });
  }
}
