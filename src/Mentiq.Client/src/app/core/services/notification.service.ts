import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'info' | 'success' | 'error';

export interface Notification {
  id: number;
  kind: NotificationKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  private readonly _notifications = signal<Notification[]>([]);

  readonly notifications = this._notifications.asReadonly();

  show(message: string, kind: NotificationKind = 'info'): void {
    const notification: Notification = { id: this.nextId++, kind, message };
    this._notifications.update((list) => [...list, notification]);

    setTimeout(() => this.dismiss(notification.id), 5000);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }
}
