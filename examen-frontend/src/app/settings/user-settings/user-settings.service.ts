import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSettingsRequest {
  timeZone: string;
  reminderTime?: string | null;
  theme?: string | null;
  emailReminder?: boolean | null;
  inAppReminder?: boolean | null;
}

export interface UserSettingsResponse extends UserSettingsRequest {}

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private baseUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  get(): Observable<UserSettingsResponse> {
    return this.http.get<UserSettingsResponse>(this.baseUrl);
  }

  update(payload: UserSettingsRequest): Observable<UserSettingsResponse> {
    return this.http.put<UserSettingsResponse>(this.baseUrl, payload);
  }
}
