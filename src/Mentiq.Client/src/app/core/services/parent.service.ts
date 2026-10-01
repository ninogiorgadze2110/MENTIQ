import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ParentBelt {
  skillName: string;
  beltName: string;
  beltIndex: number;
}

export interface ParentSummary {
  childName: string;
  grade: number;
  daysThisWeek: number;
  sessionsThisWeek: number;
  questionsThisWeek: number;
  topBeltName: string;
  belts: ParentBelt[];
  tricksMastered: number;
  trickIds: string[];
  speedBeforeSeconds: number;
  speedAfterSeconds: number;
  speedImproved: boolean;
  accuracyThisWeek: number;
  accuracyPrevWeek: number;
  needsHelpSkillName: string | null;
  needsHelpAccuracy: number | null;
}

@Injectable({ providedIn: 'root' })
export class ParentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/parent`;

  getSummary(): Observable<ParentSummary> {
    return this.http.get<ParentSummary>(`${this.baseUrl}/summary`);
  }
}
