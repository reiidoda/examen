import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSettingsRequest, UserSettingsResponse, UserSettingsService } from './user-settings.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  settings: UserSettingsResponse | null = null;
  loading = false;
  error = '';

  timezones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC'];
  themes = ['light', 'dark', 'system'];

  constructor(private settingsService: UserSettingsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.settingsService.get().subscribe({
      next: res => {
        this.settings = {
          ...res,
          emailReminder: res.emailReminder ?? false,
          inAppReminder: res.inAppReminder ?? false
        };
      },
      error: () => (this.error = 'Failed to load settings')
    });
  }

  save(): void {
    if (!this.settings) return;
    this.loading = true;
    this.settingsService.update(this.settings as UserSettingsRequest).subscribe({
      next: res => {
        this.settings = {
          ...res,
          emailReminder: res.emailReminder ?? false,
          inAppReminder: res.inAppReminder ?? false
        };
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to save settings';
        this.loading = false;
      }
    });
  }
}
