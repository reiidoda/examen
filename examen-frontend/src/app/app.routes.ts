import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then(m => m.LandingComponent),
    title: 'Examen'
  },

  // AUTH
  {
    path: 'auth',
    title: 'Authentication',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login'
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Register'
      },
      {
        path: 'reset',
        loadComponent: () =>
          import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Reset Password'
      }
    ]
  },

  // EXAMINATION
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    title: 'Dashboard'
  },
  {
    path: 'examination',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/features/examination/examination-today/examination-today.component')
        .then(m => m.ExaminationTodayComponent),
    title: 'Examination of Conscience'
  },

  // TODOS
  {
    path: 'todos',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/features/todos/todo-list/todo-list.component')
        .then(m => m.TodoListComponent),
    title: 'Todos'
  },

  // CATEGORIES
  {
    path: 'categories',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./categories/category-list/category-list.component')
            .then(m => m.CategoryListComponent),
        title: 'Categories'
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./categories/category-create/category-create.component')
            .then(m => m.CategoryCreateComponent),
        title: 'Create Category'
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./categories/category-edit/category-edit.component')
            .then(m => m.CategoryEditComponent),
        title: 'Edit Category'
      }
    ]
  },

  // PROFILE
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/features/profile/profile-dashboard/profile-dashboard.component')
        .then(m => m.ProfileDashboardComponent),
    title: 'Profile'
  },
  {
    path: 'questions',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/features/questions/custom-questions/custom-questions.component')
        .then(m => m.CustomQuestionsComponent),
    title: 'Questions'
  },
  {
    path: 'journal',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/features/journal/journal.component')
        .then(m => m.JournalComponent),
    title: 'Journal'
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./settings/user-settings/user-settings.component')
        .then(m => m.UserSettingsComponent),
    title: 'Settings'
  },

  // WILDCARD
  { path: '**', redirectTo: '' }
]; // <-- 🔥 THIS WAS MISSING
