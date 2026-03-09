import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InsightsService } from './insights.service';
import { ApiConfigService } from '../../../../core/services/api-config.service';

class ApiConfigStub {
  endpoint(path: string): string {
    return `http://test/api/${path}`;
  }
}

describe('InsightsService', () => {
  let service: InsightsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InsightsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiConfigService, useClass: ApiConfigStub }
      ]
    });

    service = TestBed.inject(InsightsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads summary', () => {
    service.getSummary(21).subscribe();

    const req = httpMock.expectOne(request => request.url === 'http://test/api/insights/summary');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('days')).toBe('21');
    req.flush({ summary: 'ok', highlights: [], periodDays: 21, sessionsCompleted: 0, averageFeeling: null, generatedAt: '2026-03-09T00:00:00Z' });
  });

  it('suggests questions', () => {
    service.suggestQuestions('gratitude', 3).subscribe();

    const req = httpMock.expectOne('http://test/api/insights/questions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.focus).toBe('gratitude');
    expect(req.request.body.count).toBe(3);
    req.flush({ focus: 'gratitude', suggestions: ['q1'], generatedAt: '2026-03-09T00:00:00Z' });
  });

  it('analyzes a session', () => {
    service.analyzeSession(9).subscribe();

    const req = httpMock.expectOne('http://test/api/insights/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.sessionId).toBe(9);
    req.flush({ sessionId: 9, summary: 'ok', insights: [], nextSteps: [], averageFeeling: 4, generatedAt: '2026-03-09T00:00:00Z' });
  });
});
