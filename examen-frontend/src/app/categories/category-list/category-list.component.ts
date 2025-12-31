import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService, Category } from '../category-list/services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getAll().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  // 👇 Fix for TS2339: these methods must exist
  onCreate(): void {
    this.router.navigate(['/categories/create']);
  }

  onEdit(category: Category): void {
    if (!category.id) return;
    this.router.navigate(['/categories/edit', category.id]);
  }

  onDelete(category: Category): void {
    if (!category.id) return;
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== category.id);
      }
    });
  }
}
