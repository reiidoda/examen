import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProfileService } from './profile.service';
import { ApiConfigService } from '../../../../core/services/api-config.service';

class ApiConfigStub {
  endpoint(path: string): string {
    return `http://test/api/${path}`;
  }
}

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiConfigService, useClass: ApiConfigStub }
      ]
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads summary', () => {
    service.getSummaryForLast30Days().subscribe();

    const req = httpMock.expectOne('http://test/api/profile/summary');
    expect(req.request.method).toBe('GET');
    req.flush({ examinationsCompleted: 0, todosCompleted: 0, categoriesUsed: 0, streakDays: 0 });
  });

  it('loads progress with days parameter', () => {
    service.getProgress(10).subscribe();

    const req = httpMock.expectOne(request => request.url === 'http://test/api/profile/progress');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('days')).toBe('10');
    req.flush({ points: [] });
  });

  it('loads analytics', () => {
    service.getAnalytics().subscribe();

    const req = httpMock.expectOne('http://test/api/profile/analytics');
    expect(req.request.method).toBe('GET');
    req.flush({ overallAverageScore: null, overallMood: null, categories: [], weeklyTrend: [] });
  });
});
