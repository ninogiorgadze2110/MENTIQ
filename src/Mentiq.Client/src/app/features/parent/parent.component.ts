import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ParentService, ParentSummary } from '../../core/services/parent.service';
import { LESSON_TITLES } from '../../core/data/lesson-titles';

const PIN_KEY = 'mentiq.parentPin';
const EMAIL_KEY = 'mentiq.parentWeeklyEmail';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      .p-card { max-width: 760px; }
      .pin-input {
        font-family: var(--ge-serif); font-size: 32px; letter-spacing: .4em; text-align: center;
        width: 180px; padding: 10px 14px; border: 1px solid var(--hair); border-radius: var(--radius-card);
        background: #fff;
      }
      .big { font-family: var(--ge-serif); font-size: 44px; line-height: 1; }
      .row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid var(--hair); }
      .row:first-child { border-top: 0; }
      .ic { font-size: 24px; width: 34px; text-align: center; flex: none; }
      .toggle {
        width: 46px; height: 26px; border-radius: 999px; border: none; cursor: pointer; position: relative;
        background: color-mix(in srgb, var(--ink) 18%, transparent); transition: background .15s ease; flex: none;
      }
      .toggle.on { background: var(--gold); }
      .toggle .knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left .15s ease; }
      .toggle.on .knob { left: 23px; }
    `
  ],
  template: `
    <div class="top">
      <div>
        <div class="ge-label">მშობლისთვის</div>
        <h2>კვირის შეჯამება</h2>
      </div>
    </div>

    @if (!unlocked()) {
      <!-- PIN gate -->
      <div class="ui-card card-secondary p-card" style="max-width:440px;">
        @if (hasPin()) {
          <div class="ge-label" style="color:var(--gold);">— დაცული გვერდი</div>
          <h3 style="font-family:var(--ge-serif); font-size:24px; margin:8px 0 6px; font-weight:500;">შეიყვანე PIN</h3>
          <p style="font-size:14px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0 0 16px;">ეს გვერდი მშობლისთვისაა.</p>
          <input class="pin-input" inputmode="numeric" maxlength="4" [value]="pinInput()" (input)="onPinInput($event)" (keyup.enter)="unlock()" />
          @if (pinError()) {
            <p style="color:#b22; font-size:13px; margin:12px 0 0;">არასწორი PIN. სცადე თავიდან.</p>
          }
          <div style="display:flex; align-items:center; gap:16px; margin-top:18px;">
            <button type="button" class="btn btn-primary" style="padding:11px 24px;" (click)="unlock()">გახსნა</button>
            <a href="javascript:void(0)" (click)="forgotPin()" style="font-size:12.5px; color:color-mix(in srgb, var(--ink) 55%, transparent);">დაგავიწყდა? ახლის დაყენება</a>
          </div>
        } @else {
          <div class="ge-label" style="color:var(--gold);">— პირველი შესვლა</div>
          <h3 style="font-family:var(--ge-serif); font-size:24px; margin:8px 0 6px; font-weight:500;">დააყენე PIN</h3>
          <p style="font-size:14px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:0 0 16px; line-height:1.6;">
            ეს გვერდი მშობლისთვისაა. დააყენე 4-ნიშნა კოდი, რომ ბავშვი შემთხვევით ვერ შემოვიდეს.
          </p>
          <input class="pin-input" inputmode="numeric" maxlength="4" [value]="pinInput()" (input)="onPinInput($event)" (keyup.enter)="savePin()" />
          <div style="margin-top:18px;">
            <button type="button" class="btn btn-primary" style="padding:11px 24px;" [disabled]="pinInput().length < 4" (click)="savePin()">დაყენება</button>
          </div>
        }
      </div>
    } @else {
      @if (loading()) {
        <p class="muted">იტვირთება…</p>
      } @else {
        @if (summary(); as s) {
        <!-- This week at a glance -->
        <div class="ui-card card-primary p-card" style="margin-bottom:20px;">
          <div class="ge-label on-belt">— {{ s.childName }}ს კვირა</div>
          <div style="display:flex; align-items:baseline; gap:12px; margin-top:6px; flex-wrap:wrap;">
            <span class="big">{{ s.daysThisWeek }}</span>
            <span style="font-family:var(--ge-serif); font-size:20px;">დღე ივარჯიშა ამ კვირაში</span>
          </div>
          <p style="font-size:14px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin:8px 0 0;">
            {{ weekWord(s.daysThisWeek) }} · {{ s.sessionsThisWeek }} ვარჯიში · {{ s.questionsThisWeek }} მაგალითი.
          </p>
        </div>

        <div class="ui-card card-secondary p-card" style="margin-bottom:20px;">
          <!-- Belts -->
          <div class="row">
            <span class="ic">🥋</span>
            <div style="flex:1; min-width:0;">
              <div style="font-family:var(--ge-serif); font-size:17px;">ქამრები</div>
              @if (s.belts.length) {
                <div style="font-size:14px; color:color-mix(in srgb, var(--ink) 70%, transparent); margin-top:2px;">
                  აიღო: {{ beltsText(s) }}.
                </div>
              } @else {
                <div style="font-size:14px; color:color-mix(in srgb, var(--ink) 65%, transparent); margin-top:2px;">
                  ჯერ ქამარი არ აუღია — ეს ნორმალურია, ახლა იწყებს.
                </div>
              }
            </div>
          </div>

          <!-- Tricks -->
          <div class="row">
            <span class="ic">🎩</span>
            <div style="flex:1; min-width:0;">
              <div style="font-family:var(--ge-serif); font-size:17px;">ხრიკები</div>
              <div style="font-size:14px; color:color-mix(in srgb, var(--ink) 70%, transparent); margin-top:2px;">
                @if (s.tricksMastered > 0) {
                  ისწავლა {{ s.tricksMastered }} ხრიკი{{ trickNames(s) ? ': ' + trickNames(s) : '' }}.
                } @else {
                  ჯერ ხრიკი არ უსწავლია — მალე დაიწყებს.
                }
              </div>
            </div>
          </div>

          <!-- Speed -->
          <div class="row">
            <span class="ic">⚡</span>
            <div style="flex:1; min-width:0;">
              <div style="font-family:var(--ge-serif); font-size:17px;">სიჩქარე</div>
              <div style="font-size:14px; color:color-mix(in srgb, var(--ink) 70%, transparent); margin-top:2px;">
                @if (s.speedImproved) {
                  <span style="color:#2f8f57;">უფრო სწრაფი გახდა</span> — ერთ მაგალითზე საშუალოდ {{ s.speedBeforeSeconds }} წამიდან {{ s.speedAfterSeconds }} წამამდე.
                } @else if (s.speedAfterSeconds > 0 && s.speedBeforeSeconds > 0) {
                  ამ კვირას საშუალოდ {{ s.speedAfterSeconds }} წამი ერთ მაგალითზე (წინა კვირას {{ s.speedBeforeSeconds }} წამი).
                } @else if (s.speedAfterSeconds > 0) {
                  ამ კვირას საშუალოდ {{ s.speedAfterSeconds }} წამი ერთ მაგალითზე. შესადარებლად მეტი ვარჯიშია საჭირო.
                } @else {
                  ჯერ საკმარისი მონაცემი არ არის სიჩქარის საჩვენებლად.
                }
              </div>
            </div>
          </div>

          <!-- Needs help -->
          <div class="row">
            <span class="ic">🤝</span>
            <div style="flex:1; min-width:0;">
              <div style="font-family:var(--ge-serif); font-size:17px;">სად სჭირდება დახმარება</div>
              <div style="font-size:14px; color:color-mix(in srgb, var(--ink) 70%, transparent); margin-top:2px;">
                @if (s.needsHelpSkillName) {
                  „{{ s.needsHelpSkillName }}" — აქ ჯერ {{ s.needsHelpAccuracy }}% სწორი პასუხია. კარგი იქნება, თუ ამ თემაზე ერთად ივარჯიშებთ.
                } @else {
                  ამ კვირას სუსტი წერტილი არ ჩანს — ყველაფერი კარგად მიდის.
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly email opt-in -->
        <div class="ui-card card-muted p-card" style="display:flex; align-items:center; gap:16px;">
          <span class="ic">✉️</span>
          <div style="flex:1; min-width:0;">
            <div style="font-family:var(--ge-serif); font-size:16px;">კვირეული შეჯამება იმეილზე</div>
            <div style="font-size:13px; color:color-mix(in srgb, var(--ink) 62%, transparent); margin-top:2px;">
              ყოველ კვირას მოგივა ეს შეჯამება. {{ emailOptIn() ? 'ჩართულია.' : 'ახლა გამორთულია.' }}
            </div>
          </div>
          <button type="button" class="toggle" [class.on]="emailOptIn()" (click)="toggleEmail()" [attr.aria-pressed]="emailOptIn()" aria-label="კვირეული იმეილი">
            <span class="knob"></span>
          </button>
        </div>
        <p style="font-size:12px; color:color-mix(in srgb, var(--ink) 50%, transparent); margin:10px 0 0; max-width:760px;">
          იმეილით გაგზავნა ჩაირთვება, როგორც კი საფოსტო სერვისი დაკონფიგურდება. არჩევანი შენახულია.
        </p>
      } @else {
        <p class="muted">ვერ ჩაიტვირთა.</p>
      }
      }
    }
  `
})
export class ParentComponent {
  private readonly service = inject(ParentService);

  readonly unlocked = signal(false);
  readonly hasPin = signal(this.readPin() !== null);
  readonly pinInput = signal('');
  readonly pinError = signal(false);

  readonly loading = signal(false);
  readonly summary = signal<ParentSummary | null>(null);

  readonly emailOptIn = signal(this.readEmail());

  onPinInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
    this.pinInput.set(v);
    this.pinError.set(false);
  }

  savePin(): void {
    const pin = this.pinInput();
    if (pin.length < 4) return;
    this.writePin(pin);
    this.hasPin.set(true);
    this.pinInput.set('');
    this.openSummary();
  }

  unlock(): void {
    if (this.pinInput() === this.readPin()) {
      this.pinInput.set('');
      this.openSummary();
    } else {
      this.pinError.set(true);
    }
  }

  forgotPin(): void {
    try { localStorage.removeItem(PIN_KEY); } catch { /* ignore */ }
    this.hasPin.set(false);
    this.pinInput.set('');
    this.pinError.set(false);
  }

  private openSummary(): void {
    this.unlocked.set(true);
    this.loading.set(true);
    this.service.getSummary().subscribe({
      next: (s) => { this.summary.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleEmail(): void {
    const next = !this.emailOptIn();
    this.emailOptIn.set(next);
    try { localStorage.setItem(EMAIL_KEY, next ? '1' : '0'); } catch { /* ignore */ }
  }

  beltsText(s: ParentSummary): string {
    return s.belts.map((b) => `${b.skillName} (${b.beltName})`).join(', ');
  }

  trickNames(s: ParentSummary): string {
    const names = s.trickIds.map((id) => LESSON_TITLES[id] ?? id);
    if (names.length <= 3) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
  }

  weekWord(days: number): string {
    if (days >= 5) return 'შესანიშნავი რიტმი';
    if (days >= 3) return 'კარგი რიტმი';
    if (days >= 1) return 'დასაწყისია';
    return 'ამ კვირას ჯერ არ უვარჯიშია';
  }

  private readPin(): string | null {
    try { return localStorage.getItem(PIN_KEY); } catch { return null; }
  }
  private writePin(pin: string): void {
    try { localStorage.setItem(PIN_KEY, pin); } catch { /* ignore */ }
  }
  private readEmail(): boolean {
    try { return localStorage.getItem(EMAIL_KEY) === '1'; } catch { return false; }
  }
}
