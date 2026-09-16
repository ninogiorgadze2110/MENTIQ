import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ContactService } from '../../core/services/contact.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="top">
      <div>
        <div style="font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--gold);">— კონტაქტი</div>
        <h2>დაგვიკავშირდი</h2>
      </div>
      <div class="spacer"></div>
    </div>

    <div style="max-width:620px;">
      <p style="font-size:14px; line-height:1.6; color:color-mix(in srgb, var(--ink) 68%, transparent); margin:0 0 24px;">
        დაგვიტოვე კომენტარი — რჩევა აპლიკაციის გასაუმჯობესებლად, უკუკავშირი, შენიშვნა ან შეკითხვა.
        სახელი და მეილი არასავალდებულოა (მეილს მივუთითებთ, თუ პასუხი დაგჭირდება).
      </p>

      @if (sent()) {
        <div style="border:1px solid var(--gold); background:color-mix(in srgb, var(--gold) 7%, transparent); padding:24px; text-align:center;">
          <div style="font-size:32px;">✓</div>
          <div style="font-family:var(--ge-serif); font-size:20px; margin:8px 0 6px;">მადლობა შენი კომენტარისთვის!</div>
          <div style="font-size:13px; color:color-mix(in srgb, var(--ink) 62%, transparent);">მიღებულია. ვამოწმებთ ყველა შემოსულ შეტყობინებას.</div>
          <button type="button" class="btn btn-secondary" style="margin-top:16px; padding:10px 20px;" (click)="reset()">ახალი კომენტარი</button>
        </div>
      } @else {
        <div style="border:1px solid var(--hair); background:#fff; padding:26px;">
          <div class="field" style="margin-bottom:14px;">
            <label>კომენტარი <span style="color:#b22;">*</span></label>
            <textarea class="input" style="min-height:130px; resize:vertical; line-height:1.55;"
                      maxlength="2000" [(ngModel)]="comment"
                      placeholder="დაწერე შენი აზრი, რჩევა ან შენიშვნა…"></textarea>
            <div style="font-size:11px; color:color-mix(in srgb, var(--ink) 45%, transparent); margin-top:4px; text-align:right;">{{ comment.length }} / 2000</div>
          </div>

          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <div class="field" style="flex:1; min-width:200px;">
              <label>სახელი <span style="color:color-mix(in srgb, var(--ink) 45%, transparent);">(არასავალდებულო)</span></label>
              <input class="input" maxlength="128" [(ngModel)]="name" placeholder="შენი სახელი" />
            </div>
            <div class="field" style="flex:1; min-width:200px;">
              <label>მეილი <span style="color:color-mix(in srgb, var(--ink) 45%, transparent);">(არასავალდებულო)</span></label>
              <input class="input" type="email" maxlength="256" [(ngModel)]="email" placeholder="name@example.com" />
            </div>
          </div>

          <button type="button" class="btn btn-primary" style="margin-top:18px; padding:12px 26px;"
                  [disabled]="!canSend() || busy()" (click)="send()">
            {{ busy() ? 'იგზავნება…' : 'გაგზავნა' }}
          </button>
        </div>
      }
    </div>
  `
})
export class ContactComponent {
  private readonly contact = inject(ContactService);
  private readonly notify = inject(NotificationService);

  comment = '';
  name = '';
  email = '';

  readonly busy = signal(false);
  readonly sent = signal(false);

  // A method (not a computed) so it re-evaluates on every change-detection pass —
  // `comment` is a plain ngModel field, not a signal.
  canSend(): boolean {
    return this.comment.trim().length > 0;
  }

  send(): void {
    const comment = this.comment.trim();
    if (!comment) {
      this.notify.error('კომენტარი სავალდებულოა.');
      return;
    }
    this.busy.set(true);
    this.contact
      .submit({ comment, name: this.name.trim() || null, email: this.email.trim() || null })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.sent.set(true);
        },
        error: () => this.busy.set(false)
      });
  }

  reset(): void {
    this.comment = '';
    this.name = '';
    this.email = '';
    this.sent.set(false);
  }
}
