import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../services/todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        if (updated.completed) {
          // fade out then remove
          setTimeout(() => {
            this.todos = this.todos.filter(t => t.id !== updated.id);
          }, 850);
        } else {
          this.todos = this.todos.map(t => t.id === updated.id ? updated : t);
        }
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
        this.todos = [...this.todos, todo].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
        this.draftTitle = '';
        this.draftDueAt = '';
      },
      error: () => this.error = 'Failed to create todo.'
    });
  }

  remove(todo: Todo, event: Event): void {
    event.stopPropagation();
    this.todoService.delete(todo.id).subscribe({
      next: () => this.todos = this.todos.filter(t => t.id !== todo.id)
    });
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
}
