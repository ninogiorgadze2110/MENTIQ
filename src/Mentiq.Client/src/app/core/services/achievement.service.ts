import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Achievement {
  code: string;
  category: string;
  emoji: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  unlocked: boolean;
  secret: boolean;
  unlockedAtUtc: string | null;
}

export interface AchievementsResponse {
  unlockedCount: number;
  total: number;
  achievements: Achievement[];
  newlyUnlocked: string[];
}

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly http = inject(HttpClient);

  get(): Observable<AchievementsResponse> {
    return this.http.get<AchievementsResponse>(`${environment.apiBaseUrl}/achievements`);
  }
}
