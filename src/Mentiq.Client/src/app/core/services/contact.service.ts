import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ContactListResponse, SubmitContactRequest } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/contact`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/contact`;

  submit(request: SubmitContactRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.baseUrl, request);
  }

  adminList(): Observable<ContactListResponse> {
    return this.http.get<ContactListResponse>(this.adminUrl);
  }

  adminMarkHandled(id: string, handled: boolean): Observable<void> {
    return this.http.post<void>(`${this.adminUrl}/${id}/handled?handled=${handled}`, {});
  }
}
