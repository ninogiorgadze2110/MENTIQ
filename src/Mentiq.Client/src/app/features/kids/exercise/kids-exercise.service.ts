import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Exercise,
  SkillProgress,
  SubmitExerciseRequest,
  SubmitExerciseResult
} from './exercise.models';

@Injectable({ providedIn: 'root' })
export class KidsExerciseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/kids`;

  next(world: string | null): Observable<Exercise> {
    const q = world ? `?world=${encodeURIComponent(world)}` : '';
    return this.http.get<Exercise>(`${this.baseUrl}/exercises/next${q}`);
  }

  submit(request: SubmitExerciseRequest): Observable<SubmitExerciseResult> {
    return this.http.post<SubmitExerciseResult>(`${this.baseUrl}/exercises/submit`, request);
  }

  progress(): Observable<SkillProgress[]> {
    return this.http.get<SkillProgress[]>(`${this.baseUrl}/progress`);
  }
}
