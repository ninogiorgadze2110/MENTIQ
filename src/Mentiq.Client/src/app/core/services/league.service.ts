import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface LeagueRankRow {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
  isMe: boolean;
  /** "up" (promotion), "down" (relegation) or "stay". */
  zone: 'up' | 'down' | 'stay';
}

export interface MyLeague {
  grade: number;
  tierIndex: number;
  tierId: string;
  tierName: string;
  weekStartUtc: string;
  weekEndUtc: string;
  myRank: number | null;
  myPoints: number;
  participantCount: number;
  promoteCount: number;
  relegateCount: number;
  entries: LeagueRankRow[];
}

export interface SubmitLeagueSessionRequest {
  correct: number;
  avgSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class LeagueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/leagues`;

  getMyLeague(): Observable<MyLeague> {
    return this.http.get<MyLeague>(`${this.baseUrl}/me`);
  }

  submitSession(request: SubmitLeagueSessionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/submit`, request);
  }
}
