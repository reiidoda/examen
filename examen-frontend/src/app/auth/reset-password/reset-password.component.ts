import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  email = '';
  token = '';
  newPassword = '';
  step: 'request' | 'confirm' = 'request';
  message = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService) {}

  request(): void {
    if (!this.email) return;
    this.loading = true;
    this.error = '';
    this.authService.requestPasswordReset({ email: this.email }).subscribe({
      next: t => {
        this.token = t;
        this.message = 'Reset token generated. Use it below.';
        this.step = 'confirm';
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not generate reset token';
        this.loading = false;
      }
    });
  }

  confirm(): void {
    if (!this.token || !this.newPassword) return;
    this.loading = true;
    this.error = '';
    this.authService.confirmPasswordReset({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.message = 'Password reset successful. You can log in now.';
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not reset password';
        this.loading = false;
      }
    });
  }
}
