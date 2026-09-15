import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface SaveSessionPayload {
  title: string;
  mode: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  longestStreak: number;
  accuracy: number;
  avgSeconds: number;
  durationSeconds: number;
  startedAtUtc: string;
}

export interface RecentSession {
  title: string;
  accuracy: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAtUtc: string;
}

export interface ProgressResponse {
  dayStreak: number;
  totalSessions: number;
  totalQuestions: number;
  avgAccuracy: number;
  avgSeconds: number;
  bestStreak: number;
  weeklyActivity: number[];
  accuracyTrend: number[];
  recentSessions: RecentSession[];
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/practice`;

  saveSession(payload: SaveSessionPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sessions`, payload);
  }

  getProgress(): Observable<ProgressResponse> {
    return this.http.get<ProgressResponse>(`${this.baseUrl}/progress`);
  }
}
