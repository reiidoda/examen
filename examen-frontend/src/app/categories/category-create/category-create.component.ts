import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../category-list/services/category.service';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.scss']
})
export class CategoryCreateComponent {

  form!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  createCategory(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.categoryService.create(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/categories']);
      },
      error: () => {
        this.errorMessage = 'Failed to create category';
        this.loading = false;
      }
    });
  }
}
