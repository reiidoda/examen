import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../services/todo.service';
import { MotionDirective } from '../../../motion/motion.directive';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MotionDirective],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  loading = false;
  draftTitle = '';
  draftDueAt = '';
  error = '';
  filterRange: 'all' | 'hour' | 'day' | 'month' = 'all';

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loading = true;
    this.todoService.getAll().subscribe({
      next: (data: Todo[]) => {
        this.todos = data;
        this.sortTodos();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleDone(todo: Todo): void {
    this.todoService.toggle(todo.id).subscribe({
      next: updated => {
        this.todos = this.todos.map(t => t.id === updated.id ? updated : t);
        this.sortTodos();
      }
    });
  }

  create(): void {
    this.error = '';
    if (!this.draftTitle.trim() || !this.draftDueAt) {
      this.error = 'Title and due time are required.';
      return;
    }
    this.todoService.create({ title: this.draftTitle, dueAt: this.draftDueAt }).subscribe({
      next: todo => {
        this.todos = [...this.todos, todo];
        this.sortTodos();
        this.draftTitle = '';
        this.draftDueAt = '';
      },
      error: () => this.error = 'Failed to create todo.'
    });
  }

  remove(todo: Todo, event: Event): void {
    event.stopPropagation();
    this.todoService.delete(todo.id).subscribe({
      next: () => {
        this.todos = this.todos.filter(t => t.id !== todo.id);
        this.sortTodos();
      }
    });
  }

  get totalCount(): number {
    return this.todos.length;
  }

  get completedCount(): number {
    return this.todos.filter(todo => todo.completed).length;
  }

  get pendingCount(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }

  get dueTodayCount(): number {
    const now = new Date();
    return this.todos.filter(todo => {
      if (todo.completed) return false;
      const due = new Date(todo.dueAt);
      return due.getFullYear() === now.getFullYear()
        && due.getMonth() === now.getMonth()
        && due.getDate() === now.getDate();
    }).length;
  }

  get overdueCount(): number {
    const now = Date.now();
    return this.todos.filter(todo => !todo.completed && new Date(todo.dueAt).getTime() < now).length;
  }

  get filteredTodos(): Todo[] {
    const now = new Date();
    const matchesRange = (t: Todo) => {
      const due = new Date(t.dueAt);
      if (this.filterRange === 'hour') {
        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diff <= 1;
      }
      if (this.filterRange === 'day') {
        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 1;
      }
      if (this.filterRange === 'month') {
        return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear();
      }
      return true;
    };
    return this.todos.filter(matchesRange);
  }

  private sortTodos(): void {
    this.todos = [...this.todos].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return a.dueAt.localeCompare(b.dueAt);
    });
  }
}
