import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../../categories/category-list/services/category.service';

export interface Question {
  id?: number;
  text: string;
  orderNumber?: number;
  difficulty?: string;
  responseType?: 'YES_NO' | 'SCALE_1_5';
  category: Category;
  categoryId?: number;
  custom?: boolean;
  defaultQuestion?: boolean;
}

export interface QuestionPage {
  content: Question[];
  totalElements: number;
}

export interface QuestionRequest {
  text: string;
  orderNumber?: number;
  difficulty?: string;
  responseType?: 'YES_NO' | 'SCALE_1_5';
  categoryId: number;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private baseUrl = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {}

  getAll(size = 50): Observable<Question[]> {
    return this.http.get<QuestionPage>(`${this.baseUrl}`, { params: { page: 0, size } })
      .pipe(map(res => res.content ?? []));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMine(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/my`);
  }

  createCustom(payload: QuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/custom`, payload);
  }

  deleteCustom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/custom/${id}`);
  }
}
