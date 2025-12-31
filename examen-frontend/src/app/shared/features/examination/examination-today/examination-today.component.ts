import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ExaminationService } from '../services/examination.service';
import {
  Category,
  Question,
  SessionSummary
} from '../models/examination.model';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { ProfileService } from '../../profile/services/profile.service';

type QuestionStatus = 'incomplete' | 'completed';

interface QuestionCard {
  id: number;
  title: string;
  text: string;
  instruction: string;
  answer?: { text: string; rating: number; placedAt: string };
  status: QuestionStatus;
}

interface ComposerState {
  draftText: string;
  draftRating: number | null;
}

interface TokenState {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
}

const FALLBACK_DEFAULTS: QuestionCard[] = [
  { id: 10001, title: 'Question 1', text: 'Where did I notice gratitude most clearly today?', instruction: 'Name the moment and what you felt.', status: 'incomplete' },
  { id: 10002, title: 'Question 2', text: 'When did I act out of love versus fear?', instruction: 'Describe both the trigger and your response.', status: 'incomplete' },
  { id: 10003, title: 'Question 3', text: 'Which habit or vice surfaced today, and how did I respond?', instruction: 'Be concrete about the situation and your choice.', status: 'incomplete' },
  { id: 10004, title: 'Question 4', text: 'Where did I feel closest to God/meaning, and where did I feel distant?', instruction: 'Name the place/person/moment.', status: 'incomplete' },
  { id: 10005, title: 'Question 5', text: 'What is one concrete step I will take tomorrow to grow?', instruction: 'Keep it small, specific, and time-bound.', status: 'incomplete' }
];

@Component({
  selector: 'app-examination-today',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './examination-today.component.html',
  styleUrls: ['./examination-today.component.scss']
})
export class ExaminationTodayComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  questions: QuestionCard[] = [];
  activeSession: SessionSummary | null = null;
  history: SessionSummary[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  cooldownMessage = '';
  notes = '';
  moodScore: number | null = null;
  composer: ComposerState = { draftText: '', draftRating: null };
  activeToken: TokenState | null = null;
  ui = {
    hoveredQuestionId: null as number | null,
    dragging: false
  };
  private progressKey = 'examen-active-session';
  showAutosave = false;
  private autosaveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private examService: ExaminationService,
    private storage: LocalStorageService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadActiveSession();
    this.loadQuestions();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout);
    }
  }

  startSession(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.examService.startSession().subscribe({
      next: session => {
        this.activeSession = session;
        this.resetResponses();
        this.persistProgress();
      },
      error: (err) => {
        if (err.status === 429) {
          this.cooldownMessage = err.error?.message || 'You can start a new examination after 24 hours.';
        } else if (err.status === 409) {
          this.errorMessage = 'You already have an active session.';
        } else {
          this.errorMessage = 'Failed to start a new session.';
        }
        this.loadActiveSession();
      }
    });
  }

  onAnswerChange(questionId: number, value: string): void {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;
    if (!question.answer) {
      question.answer = {
        text: value,
        rating: this.composer.draftRating ?? 0,
        placedAt: new Date().toISOString()
      };
    } else {
      question.answer.text = value;
    }
    this.updateQuestionStatus(questionId);
    this.persistProgress();
  }

  onNotesChange(value: string): void {
    this.notes = value;
    this.persistProgress();
  }

  onMoodChange(value: number | string): void {
    this.moodScore = Number(value);
    this.persistProgress();
  }

  selectRating(rating: number): void {
    this.composer.draftRating = rating;
  }

  generateToken(): void {
    this.errorMessage = '';
    if (this.activeToken) {
      this.errorMessage = 'Place the current token before generating another.';
      return;
    }
    const text = this.composer.draftText.trim();
    if (text.length < 3) {
      this.errorMessage = 'Please write an answer.';
      return;
    }
    if (!this.composer.draftRating) {
      this.errorMessage = 'Please select a rating.';
      return;
    }
    this.activeToken = {
      id: 'token-' + Date.now(),
      text,
      rating: this.composer.draftRating,
      createdAt: new Date().toISOString()
    };
  }

  handleDragStart(event: DragEvent): void {
    if (!this.activeToken) return;
    const dt = event.dataTransfer;
    if (!dt) return;
    dt.setData('text/plain', JSON.stringify(this.activeToken));
    dt.effectAllowed = 'move';
    this.ui.dragging = true;
    document.body.classList.add('dragging-card');
  }

  handleDragEnd(): void {
    this.ui.dragging = false;
    this.ui.hoveredQuestionId = null;
    document.body.classList.remove('dragging-card');
  }

  handleDragEnter(questionId: number): void {
    this.ui.hoveredQuestionId = questionId;
  }

  handleDragLeave(): void {
    this.ui.hoveredQuestionId = null;
  }

  handleDrop(event: DragEvent, questionId: number): void {
    event.preventDefault();
    const payload = event.dataTransfer?.getData('text/plain');
    const token: TokenState | null = payload ? JSON.parse(payload) : this.activeToken;
    if (!token) {
      this.handleDragEnd();
      return;
    }
    this.placeTokenOnQuestion(token, questionId);
    this.handleDragEnd();
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  placeTokenOnQuestion(token: TokenState, questionId: number): void {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;
    question.answer = {
      text: token.text,
      rating: token.rating,
      placedAt: new Date().toISOString()
    };
    this.updateQuestionStatus(questionId);
    this.activeToken = null;
    this.successMessage = `Placed on ${question.title}`;
    this.persistProgress();
    setTimeout(() => this.successMessage = '', 1200);
  }

  placeTokenKeyboard(questionId: number): void {
    if (!this.activeToken) {
      this.errorMessage = 'Generate an answer token first.';
      return;
    }
    this.placeTokenOnQuestion(this.activeToken, questionId);
  }

  submit(): void {
    if (!this.submitEnabled) {
      this.errorMessage = 'Complete all questions before submitting.';
      this.scrollToNextUnanswered();
      return;
    }
    const payload = {
      examId: this.activeSession?.id ?? 'examen-daily',
      questions: this.questions.map(q => ({
        questionId: q.id,
        answerText: q.answer?.text ?? '',
        rating: q.answer?.rating ?? 0,
        completedAt: q.answer?.placedAt ?? new Date().toISOString()
      }))
    };
    of(payload).pipe(delay(600)).subscribe({
      next: () => {
        this.successMessage = 'Exam submitted successfully.';
        this.storage.remove(this.progressKey);
        this.activeToken = null;
        this.loadHistory();
        this.profileService.getSummaryForLast30Days().subscribe(); // refresh profile cache
        this.profileService.getAnalytics().subscribe();
        this.profileService.getProgress(14).subscribe();
        this.profileService.refresh$.next();
        setTimeout(() => this.router.navigate(['/profile']), 300);
      },
      error: () => {
        this.errorMessage = 'Failed to submit the exam.';
      }
    });
  }

  trackByQuestionId(index: number, item: Question): number {
    return item?.id ?? index;
  }

  private loadQuestions(): void {
    this.loading = true;
    this.examService.getCategories().subscribe({
      next: categories => {
        this.categories = categories;
        const loaders = categories.map(category =>
          this.examService.getQuestionsByCategory(category.id)
        );

        let loaded = 0;
        if (loaders.length === 0) {
          this.loading = false;
        }

        loaders.forEach((obs, index) => {
          obs.subscribe({
            next: questions => {
              this.mergeQuestions(questions);
              loaded += 1;
              if (loaded === loaders.length) {
                this.ensureMinimumQuestions();
                this.loading = false;
              }
            },
            error: () => {
              this.errorMessage = 'Failed to load questions.';
              this.ensureMinimumQuestions();
              this.loading = false;
            }
          });
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load categories.';
        this.ensureMinimumQuestions();
        this.loading = false;
      }
    });
  }

  private loadHistory(): void {
    this.examService.getHistory().subscribe({
      next: res => {
        this.history = res.content;
      },
      error: () => {
        this.history = [];
      }
    });
  }

  private loadActiveSession(): void {
    this.examService.getActiveSession().subscribe({
      next: session => {
        this.activeSession = session;
        const saved = this.storage.get(this.progressKey);
        if (session && saved) {
          try {
            const parsed = JSON.parse(saved) as { sessionId: number; questions: QuestionCard[]; notes: string; moodScore: number | null };
            if (parsed.sessionId === session.id) {
              this.questions = parsed.questions || [];
              this.notes = parsed.notes || '';
              this.moodScore = parsed.moodScore ?? null;
            }
          } catch {
            this.storage.remove(this.progressKey);
          }
        } else {
          this.resetResponses();
        }
      },
      error: () => {
        this.activeSession = null;
      }
    });
  }

  private persistProgress(): void {
    if (!this.activeSession) {
      return;
    }
    const payload = {
      sessionId: this.activeSession.id,
      questions: this.questions,
      notes: this.notes,
      moodScore: this.moodScore
    };
    this.storage.set(this.progressKey, JSON.stringify(payload));
    this.showAutosave = true;
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout);
    }
    this.autosaveTimeout = setTimeout(() => {
      this.showAutosave = false;
    }, 1200);
  }

  private resetResponses(): void {
    this.questions = this.questions.map(q => ({
      ...q,
      answer: undefined,
      status: 'incomplete'
    }));
    this.notes = '';
    this.moodScore = null;
    this.activeToken = null;
    this.composer = { draftText: '', draftRating: null };
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get answeredCount(): number {
    return this.questions.filter(q => q.status === 'completed').length;
  }

  get progressPercent(): number {
    if (!this.totalQuestions) return 0;
    return Math.round((this.answeredCount / this.totalQuestions) * 100);
  }

  get unansweredQuestionId(): number | null {
    for (const q of this.questions) {
      if (q.status !== 'completed') return q.id;
    }
    return null;
  }

  scrollToNextUnanswered(): void {
    const id = this.unansweredQuestionId;
    if (id == null) {
      return;
    }
    const el = document.getElementById(`question-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 900);
    }
  }

  get trendSeries(): number[] {
    return (this.history || [])
      .filter(s => s.score !== undefined || s.moodScore !== undefined)
      .slice(0, 12)
      .map(s => s.score ?? ((s.moodScore ?? 0) * 20));
  }

  get submitEnabled(): boolean {
    return this.questions.length > 0 && this.questions.every(q => q.status === 'completed');
  }

  private mergeQuestions(questions: Question[]): void {
    const startIndex = this.questions.length;
    const mapped = questions.map((q, idx) => ({
      id: q.id,
      title: `Question ${startIndex + idx + 1}`,
      text: q.text,
      instruction: 'Write a concise reflection, then rate how strongly it applies.',
      status: 'incomplete' as QuestionStatus,
      defaultQuestion: !q.custom
    }));
    this.questions = [...this.questions, ...mapped];
  }

  private ensureMinimumQuestions(): void {
    if (this.questions.length === 0) {
      this.questions = FALLBACK_DEFAULTS.map((q, idx) => ({ ...q, title: `Question ${idx + 1}`, defaultQuestion: true }));
      return;
    }
    if (this.questions.length < 5) {
      const needed = 5 - this.questions.length;
      const filler = FALLBACK_DEFAULTS.slice(0, needed).map((q, idx) => ({
        ...q,
        id: q.id + idx + 100, // avoid collision
        title: `Question ${this.questions.length + idx + 1}`,
        defaultQuestion: true
      }));
      this.questions = [...this.questions, ...filler];
    }
  }

  private updateQuestionStatus(questionId: number): void {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;
    if (question.answer?.text && question.answer.text.trim().length > 0 && question.answer.rating) {
      question.status = 'completed';
    } else {
      question.status = 'incomplete';
    }
  }
}
