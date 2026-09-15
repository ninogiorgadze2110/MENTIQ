import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalScore: number;
  sessions: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  grade: number;
  participants: number;
  myRank: number;
  myScore: number;
  entries: LeaderboardEntry[];
}

export interface CompetitionDto {
  id: string;
  title: string;
  grade: number;
  questionCount: number;
  quizSeconds: number;
  startsAtUtc: string;
  endsAtUtc: string;
  status: 'active' | 'upcoming' | 'ended';
  participants: number;
  played: boolean;
  myScore: number;
  createdByName: string;
}

export interface CompetitionEntryDto {
  rank: number;
  displayName: string;
  score: number;
  accuracy: number;
  isCurrentUser: boolean;
}

export interface CompetitionDetailDto {
  competition: CompetitionDto;
  entries: CompetitionEntryDto[];
}

export interface CreateCompetitionRequest {
  title: string;
  grade: number;
  durationHours: number;
  quizSeconds: number;
}

export interface SubmitEntryRequest {
  score: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  durationSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/competition`;

  getLeaderboard(): Observable<LeaderboardResponse> {
    return this.http.get<LeaderboardResponse>(`${this.baseUrl}/leaderboard`);
  }

  list(): Observable<CompetitionDto[]> {
    return this.http.get<CompetitionDto[]>(`${this.baseUrl}/list`);
  }

  create(request: CreateCompetitionRequest): Observable<CompetitionDto> {
    return this.http.post<CompetitionDto>(this.baseUrl, request);
  }

  getDetail(id: string): Observable<CompetitionDetailDto> {
    return this.http.get<CompetitionDetailDto>(`${this.baseUrl}/${id}`);
  }

  submit(id: string, request: SubmitEntryRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/submit`, request);
  }
}
