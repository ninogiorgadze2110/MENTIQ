import { Injectable, inject, signal } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { CompanionType, KIDS_COMPANIONS } from './kids-companions.data';

/**
 * Small per-child Kids profile (companion choice). Stored per user in
 * localStorage for now — cosmetic, per-device state; can move to the backend
 * later without touching callers.
 */
@Injectable({ providedIn: 'root' })
export class KidsProfileService {
  private readonly auth = inject(AuthService);

  readonly companion = signal<CompanionType | null>(this.read());
  readonly streak = signal<number>(this.readStreak());

  hasCompanion(): boolean {
    return this.companion() !== null;
  }

  /** Call when the child finishes a mission — advances the daily streak. */
  recordActiveDay(): void {
    const today = this.dayStr(0);
    const yesterday = this.dayStr(-1);
    let n = 1;
    try {
      const raw = localStorage.getItem(this.streakKey());
      const s = raw ? (JSON.parse(raw) as { n: number; last: string }) : null;
      if (s?.last === today) n = s.n;
      else if (s?.last === yesterday) n = s.n + 1;
      localStorage.setItem(this.streakKey(), JSON.stringify({ n, last: today }));
    } catch {
      /* storage unavailable */
    }
    this.streak.set(n);
  }

  private readStreak(): number {
    try {
      const raw = localStorage.getItem(this.streakKey());
      if (!raw) return 0;
      const s = JSON.parse(raw) as { n: number; last: string };
      // A streak only "counts" if the last active day was today or yesterday.
      return s.last === this.dayStr(0) || s.last === this.dayStr(-1) ? s.n : 0;
    } catch {
      return 0;
    }
  }

  private streakKey(): string {
    return `mentiq.kids.streak.${this.auth.user()?.id ?? 'anon'}`;
  }

  private dayStr(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  setCompanion(type: CompanionType): void {
    this.companion.set(type);
    try {
      localStorage.setItem(this.key(), type);
    } catch {
      /* storage unavailable */
    }
  }

  /** Companion display name (e.g. "ბუნი"), falling back to the bunny. */
  companionName(): string {
    const t = this.companion() ?? 'bunny';
    return KIDS_COMPANIONS.find((c) => c.type === t)?.name ?? 'ბუნი';
  }

  private key(): string {
    return `mentiq.kids.companion.${this.auth.user()?.id ?? 'anon'}`;
  }

  private read(): CompanionType | null {
    try {
      const v = localStorage.getItem(this.key());
      return v && ['bunny', 'fox', 'panda', 'koala'].includes(v) ? (v as CompanionType) : null;
    } catch {
      return null;
    }
  }
}
