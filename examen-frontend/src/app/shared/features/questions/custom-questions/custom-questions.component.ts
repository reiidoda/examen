import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../../../categories/category-list/services/category.service';
import { Question, QuestionService } from '../../../../core/services/question.service';

@Component({
  selector: 'app-custom-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './custom-questions.component.html',
  styleUrls: ['./custom-questions.component.scss']
})
export class CustomQuestionsComponent implements OnInit {
  form!: FormGroup;
  categories: Category[] = [];
  questions: Question[] = [];
  loading = false;
  error = '';
  minRequired = 5;

  responseTypes = [
    { value: 'YES_NO', label: 'Yes / No' },
    { value: 'SCALE_1_5', label: 'Scale 1-5' }
  ];

  get totalCount(): number {
    return this.questions.length;
  }

  get defaultCount(): number {
    return this.questions.filter(q => !q.custom).length;
  }

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private questionService: QuestionService
  ) {
    this.form = this.fb.group({
      text: ['', [Validators.required, Validators.maxLength(500)]],
      categoryId: [null, Validators.required],
      responseType: ['YES_NO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadQuestions();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: res => (this.categories = res),
      error: () => (this.error = 'Failed to load categories')
    });
  }

  loadQuestions(): void {
    this.loading = true;
    this.questionService.getAll().subscribe({
      next: res => {
        this.questions = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load questions';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.questionService.createCustom(this.form.value).subscribe({
      next: q => {
        this.questions = [q, ...this.questions];
        this.form.reset({ responseType: 'YES_NO' });
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not create question';
        this.loading = false;
      }
    });
  }

  delete(question: Question): void {
    if (!question.id) return;
    if (this.questions.length <= this.minRequired) {
      this.error = `At least ${this.minRequired} questions must remain.`;
      return;
    }
    if (!question.custom) {
      this.error = 'Default questions cannot be deleted.';
      return;
    }

    const deleteCall = this.questionService.deleteCustom(question.id);

    deleteCall.subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.id !== question.id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not delete question';
      }
    });
  }
}
