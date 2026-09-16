import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  DailyChallenge,
  DailyChallengeLeaderboard,
  SubmitDailyChallengeRequest
} from '../models/daily-challenge.model';

@Injectable({ providedIn: 'root' })
export class DailyChallengeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/daily-challenge`;

  getToday(): Observable<DailyChallenge> {
    return this.http.get<DailyChallenge>(`${this.baseUrl}/today`);
  }

  submit(request: SubmitDailyChallengeRequest): Observable<DailyChallenge> {
    return this.http.post<DailyChallenge>(`${this.baseUrl}/submit`, request);
  }

  getLeaderboard(): Observable<DailyChallengeLeaderboard> {
    return this.http.get<DailyChallengeLeaderboard>(`${this.baseUrl}/leaderboard`);
  }
}
