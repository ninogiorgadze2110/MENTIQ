import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * MENTIQ landing (public marketing page).
 *
 * Colorful, modern face of the product — intentionally OFF the global warm
 * "classical" theme. Every class is `lp-*` prefixed and the palette is scoped
 * to `.lp` so the global stylesheet (beige + gold, serif headings) never
 * leaks in and this page never leaks out into the school/kids experiences.
 *
 * Design goal: keep the friendly, colorful reference direction but ~25–30%
 * lighter on decoration — fewer shapes, restrained shadows, clear hierarchy,
 * easy to read. Georgian-only copy.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="lp">
      <!-- ===== Header (compact) ===== -->
      <header class="lp-hdr">
        <div class="lp-hdr__inner">
          <a class="lp-brand" href="#home" aria-label="MENTIQ — მთავარი">
            <span class="lp-brand__mark" aria-hidden="true">M</span>
            <span class="lp-brand__word">MENTIQ</span>
          </a>

          <nav class="lp-nav" aria-label="მთავარი ნავიგაცია">
            <a href="#home">მთავარი</a>
            <a href="#features">ვარჯიშები</a>
            <a href="#books">წიგნები</a>
            <a href="#features">პროგრესი</a>
            <a href="#about">ჩვენს შესახებ</a>
          </nav>

          <div class="lp-hdr__cta">
            <a routerLink="/login" class="lp-login">შესვლა</a>
            <a routerLink="/login" [queryParams]="{ register: 1 }" class="lp-btn lp-btn--primary">რეგისტრაცია</a>
          </div>
        </div>
      </header>

      <!-- ===== Hero ===== -->
      <section id="home" class="lp-hero">
        <div class="lp-hero__copy">
          <p class="lp-eyebrow" aria-label="იფიქრე სწრაფად, გამოთვალე ჭკვიანურად">
            <span class="lp-eyebrow__tick" aria-hidden="true"></span>
            იფიქრე სწრაფად · გამოთვალე ჭკვიანურად
            <span class="lp-eyebrow__tick" aria-hidden="true"></span>
          </p>
          <h1 class="lp-hero__title">
            მათემატიკა, <span class="lp-hl">რომელიც აზროვნებას</span> ავითარებს.
          </h1>
          <p class="lp-hero__lead">
            ისწავლე მათემატიკა ინტერაქტიული წიგნებით, სახალისო გამოწვევებით და
            სწრაფი გამოთვლის ვარჯიშებით.
          </p>
          <div class="lp-hero__actions">
            <a routerLink="/login" [queryParams]="{ register: 1 }" class="lp-btn lp-btn--primary lp-btn--lg">
              დაიწყე უფასოდ <span class="lp-btn__ico" aria-hidden="true">→</span>
            </a>
            <a href="#books" class="lp-btn lp-btn--ghost lp-btn--lg">
              დაათვალიერე წიგნები <span class="lp-btn__ico" aria-hidden="true">📖</span>
            </a>
          </div>
          <span class="lp-doodle" aria-hidden="true">1 + 2 = 3</span>
        </div>

        <!-- visual stage: card + stats + mascot + playful numbers -->
        <div class="lp-stage">
          <!-- green play pointer -->
          <svg class="lp-pointer" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M14 8 L40 24 L14 40 Q10 42 10 37 L10 11 Q10 6 14 8 Z" fill="#36B88A"/>
          </svg>

          <!-- interactive math card -->
          <div class="lp-card" role="group" aria-label="სავარჯიშოს მაგალითი">
            <div class="lp-card__top">
              <span class="lp-card__lvl">
                <span class="lp-bolt" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M13 2 L4 14 h6 l-1 8 L19 9 h-6 Z" fill="currentColor"/></svg>
                </span>
                სწრაფი გამოთვლა
              </span>
              <span class="lp-card__prog">{{ step() }}/10</span>
            </div>

            <div class="lp-card__bar" aria-hidden="true">
              <span class="lp-card__bar-fill" [style.width.%]="step() * 10"></span>
            </div>

            <p class="lp-card__q">47 + 28</p>

            <div class="lp-card__choices">
              @for (c of choices; track c.value) {
                <button
                  type="button"
                  class="lp-choice"
                  [attr.data-tone]="c.tone"
                  [class.is-selected]="picked() === c.value"
                  [class.is-wrong]="picked() === c.value && c.value !== answer"
                  (click)="pick(c.value)">
                  {{ c.value }}
                  @if (picked() === c.value && c.value === answer) {
                    <span class="lp-choice__check" aria-hidden="true">✓</span>
                  }
                </button>
              }
            </div>

            @if (solved()) {
              <div class="lp-card__ok" role="status">
                <span class="lp-card__ok-left">
                  <span class="lp-card__ok-ico" aria-hidden="true">✓</span>
                  <span>სწორია! 47 + 28 = 75</span>
                </span>
                <span class="lp-card__ok-pts">★ +10 ქულა</span>
              </div>
            } @else {
              <div class="lp-card__retry" role="status">სცადე თავიდან 🙂</div>
            }
          </div>

          <!-- floating stats -->
          <div class="lp-stats" aria-hidden="true">
            <div class="lp-stat">
              <span class="lp-ring" style="--p:80">
                <svg viewBox="0 0 36 36">
                  <circle class="lp-ring__bg" cx="18" cy="18" r="15.5"/>
                  <circle class="lp-ring__fg" cx="18" cy="18" r="15.5"/>
                </svg>
                <b>80%</b>
              </span>
              <span class="lp-stat__label">სიზუსტე</span>
            </div>
            <div class="lp-stat lp-stat--row">
              <span class="lp-chip lp-chip--fire">🔥</span>
              <span><b>7</b><small>დღე streak</small></span>
            </div>
            <div class="lp-stat lp-stat--row">
              <span class="lp-chip lp-chip--star">⭐</span>
              <span><b>120</b><small>ქულა</small></span>
            </div>
          </div>

          <!-- cactus mascot -->
          <svg class="lp-mascot" viewBox="0 0 120 150" aria-hidden="true">
            <!-- arms -->
            <rect x="22" y="56" width="15" height="34" rx="7.5" fill="#36B88A" transform="rotate(32 29 73)"/>
            <rect x="83" y="40" width="15" height="34" rx="7.5" fill="#36B88A" transform="rotate(18 90 57)"/>
            <!-- body -->
            <rect x="43" y="26" width="34" height="86" rx="17" fill="#3fc295"/>
            <!-- pot -->
            <rect x="33" y="104" width="54" height="12" rx="5" fill="#ff8468"/>
            <path d="M37 116 L83 116 L77 142 Q76 146 72 146 L48 146 Q44 146 43 142 Z" fill="#FF927A"/>
            <!-- face -->
            <circle cx="53" cy="56" r="3.6" fill="#102A56"/>
            <circle cx="67" cy="56" r="3.6" fill="#102A56"/>
            <circle cx="48" cy="64" r="3.2" fill="#ffc2b4"/>
            <circle cx="72" cy="64" r="3.2" fill="#ffc2b4"/>
            <path d="M54 65 q6 6 12 0" stroke="#102A56" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          </svg>

          <!-- playful 3D numbers -->
          <span class="lp-num lp-num--8" aria-hidden="true">8</span>
          <span class="lp-num lp-num--plus" aria-hidden="true">+</span>
          <span class="lp-num lp-num--3" aria-hidden="true">3</span>
          <span class="lp-spark lp-spark--a" aria-hidden="true"></span>
          <span class="lp-spark lp-spark--b" aria-hidden="true"></span>
        </div>
      </section>

      <!-- ===== Features (3 compact cards) ===== -->
      <section id="features" class="lp-section">
        <div class="lp-head">
          <h2>რატომ MENTIQ</h2>
          <p>სამი რამ, რაც ყოველდღიურ ვარჯიშს ამარტივებს.</p>
        </div>

        <div class="lp-feat-grid">
          <article class="lp-feat">
            <span class="lp-feat__ico lp-feat__ico--blue" aria-hidden="true">✦</span>
            <h3>ინტერაქტიული გაკვეთილები</h3>
            <p>პატარა, ფოკუსირებული ნაბიჯები — ბავშვი სწავლობს კეთებით, არა დაზეპირებით.</p>
          </article>

          <article class="lp-feat">
            <span class="lp-feat__ico lp-feat__ico--green" aria-hidden="true">◆</span>
            <h3>სახალისო გამოწვევები</h3>
            <p>ყოველდღიური გამოწვევა სიჩქარესა და სიზუსტეზე — სწავლა თამაშად იქცევა.</p>
          </article>

          <article class="lp-feat">
            <span class="lp-feat__ico lp-feat__ico--coral" aria-hidden="true">●</span>
            <h3>შენი პროგრესი</h3>
            <p>ცხადი სურათი — სად ხარ ახლა და რა არის შემდეგი ნაბიჯი.</p>
          </article>
        </div>
      </section>

      <!-- ===== MENTIQ Book (coming soon) ===== -->
      <section id="books" class="lp-section">
        <div class="lp-head">
          <h2>MENTIQ Book</h2>
          <p>აღმოაჩინე მათემატიკა კლასის მიხედვით.</p>
        </div>

        <div class="lp-soon">
          <span class="lp-soon__ico" aria-hidden="true">📚</span>
          <h3 class="lp-soon__title">დაემატება მალე</h3>
          <p class="lp-soon__text">MENTIQ Book-ის ინტერაქტიული წიგნები I–IV კლასისთვის მზადდება.</p>
        </div>
      </section>

      <!-- ===== About / closing ===== -->
      <section id="about" class="lp-about">
        <h2>სიზუსტე. სიჩქარე. სიმარტივე.</h2>
        <p>
          MENTIQ არ არის მხოლოდ სწორი პასუხი — მთავარია, როგორ ფიქრობ, რამდენად
          სწრაფად და მარტივად. ავაშენოთ აზროვნება, ნაბიჯ-ნაბიჯ.
        </p>
        <a routerLink="/login" [queryParams]="{ register: 1 }" class="lp-btn lp-btn--primary lp-btn--lg">დაიწყე უფასოდ</a>
      </section>

      <!-- ===== Footer ===== -->
      <footer class="lp-ftr">
        <span class="lp-brand__word">MENTIQ</span>
        <span class="lp-ftr__copy">© 2026 · თბილისი</span>
      </footer>
    </div>
  `,
  styles: [`
    /* Palette scoped to the landing page only — does not touch the app theme. */
    .lp {
      --navy: #102A56;
      --blue: #2864E8;
      --teal: #36B88A;
      --coral: #FF927A;
      --bg: #FAFAF7;
      --surface: #FFFFFF;
      --line: #ECEAE3;

      font-family: var(--ge);
      color: var(--navy);
      background: var(--bg);
      min-height: 100vh;
      line-height: 1.6;
    }
    .lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
    .lp h1, .lp h2, .lp h3 { font-family: var(--ge); letter-spacing: -.01em; margin: 0; }
    .lp p { margin: 0; }

    /* ---- buttons ---- */
    .lp-btn {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 12px; font-family: var(--ge); font-weight: 600;
      font-size: 15px; padding: 11px 20px; cursor: pointer;
      text-decoration: none; border: 1px solid transparent; line-height: 1;
      transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
    }
    .lp-btn--lg { padding: 15px 26px; font-size: 16px; }
    .lp-btn--primary { background: var(--blue); color: #fff; box-shadow: 0 6px 16px -8px rgba(40,100,232,.6); }
    .lp-btn--primary:hover { background: #1d54cf; transform: translateY(-1px); }
    .lp-btn--ghost { background: #fff; color: var(--navy); border-color: var(--line); }
    .lp-btn--ghost:hover { border-color: var(--blue); color: var(--blue); }
    .lp-btn:focus-visible, .lp a:focus-visible, .lp-choice:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--blue) 45%, transparent); outline-offset: 2px;
    }

    /* ---- brand ---- */
    .lp-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--navy); }
    .lp-brand__mark {
      width: 32px; height: 32px; border-radius: 9px; background: var(--blue); color: #fff;
      display: grid; place-items: center; font-weight: 700; font-size: 18px;
    }
    .lp-brand__word { font-weight: 700; font-size: 20px; letter-spacing: .01em; color: var(--navy); }

    /* ---- section head ---- */
    .lp-head { text-align: center; max-width: 640px; margin: 0 auto 40px; }
    .lp-head h2 { font-size: 34px; font-weight: 700; line-height: 1.15; margin: 0 0 10px; }
    .lp-head p { font-size: 17px; color: color-mix(in srgb, var(--navy) 62%, transparent); }

    /* ---- header ---- */
    .lp-hdr {
      position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--bg) 88%, transparent);
      backdrop-filter: blur(8px); border-bottom: 1px solid var(--line);
    }
    .lp-hdr__inner {
      max-width: 1240px; margin: 0 auto; height: 72px; padding: 0 24px;
      display: flex; align-items: center; gap: 24px;
    }
    .lp-nav { display: flex; gap: 26px; margin-left: 18px; }
    .lp-nav a { text-decoration: none; color: color-mix(in srgb, var(--navy) 72%, transparent); font-size: 15px; font-weight: 500; }
    .lp-nav a:hover { color: var(--blue); }
    .lp-hdr__cta { margin-left: auto; display: flex; align-items: center; gap: 16px; }
    .lp-login { text-decoration: none; color: var(--navy); font-weight: 600; font-size: 15px; }
    .lp-login:hover { color: var(--blue); }

    /* ---- hero ---- */
    .lp-hero {
      position: relative; max-width: 1240px; margin: 0 auto;
      padding: 64px 24px 72px; display: grid; grid-template-columns: 1fr 1.08fr;
      gap: 40px; align-items: center;
    }
    .lp-hero__copy { position: relative; }
    .lp-eyebrow {
      display: inline-flex; align-items: center; gap: 10px; font-size: 14.5px; font-weight: 700;
      color: var(--teal); margin: 0 0 16px;
    }
    .lp-eyebrow__tick { width: 18px; height: 2px; border-radius: 2px; background: currentColor; opacity: .55; }
    .lp-hero__title { font-size: 50px; line-height: 1.1; font-weight: 700; letter-spacing: -.02em; margin: 0 0 18px; }
    .lp-hl { color: var(--blue); }
    .lp-hero__lead { font-size: 17.5px; line-height: 1.6; color: color-mix(in srgb, var(--navy) 66%, transparent); max-width: 44ch; margin: 0 0 26px; }
    .lp-hero__actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .lp-btn__ico { margin-left: 8px; font-size: 15px; }
    .lp-btn--ghost { border-radius: 999px; }
    .lp-btn--primary { border-radius: 999px; }
    .lp-doodle {
      display: inline-block; margin-top: 22px; font-size: 20px; font-weight: 700; font-style: italic;
      color: color-mix(in srgb, var(--blue) 70%, transparent); transform: rotate(-7deg);
      border-bottom: 2px wavy color-mix(in srgb, var(--blue) 45%, transparent); padding-bottom: 2px;
    }

    /* ---- stage (card + decorations) ---- */
    .lp-stage { position: relative; min-height: 420px; display: flex; align-items: center; justify-content: center; }

    .lp-pointer { position: absolute; left: -34px; top: 46%; width: 46px; height: 46px; transform: rotate(-8deg); z-index: 3; filter: drop-shadow(0 6px 10px rgba(54,184,138,.35)); }

    /* ---- interactive card ---- */
    .lp-card {
      position: relative; z-index: 2; width: 100%; max-width: 400px;
      background: var(--surface); border: 1px solid var(--line); border-radius: 22px;
      padding: 22px; box-shadow: 0 28px 56px -30px rgba(16,42,86,.4);
    }
    .lp-card__top { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
    .lp-card__lvl { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: var(--navy); }
    .lp-bolt { width: 26px; height: 26px; border-radius: 8px; background: color-mix(in srgb, var(--blue) 14%, transparent); color: var(--blue); display: grid; place-items: center; }
    .lp-bolt svg { width: 15px; height: 15px; }
    .lp-card__prog { color: color-mix(in srgb, var(--navy) 55%, transparent); font-weight: 700; }
    .lp-card__bar { height: 8px; border-radius: 999px; background: var(--line); margin: 14px 0 18px; overflow: hidden; }
    .lp-card__bar-fill { display: block; height: 100%; border-radius: 999px; background: var(--teal); transition: width .3s ease; }
    .lp-card__q { font-size: 44px; font-weight: 700; text-align: center; margin: 8px 0 18px; letter-spacing: 0; }
    .lp-card__choices { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }
    .lp-choice {
      position: relative; font-family: var(--ge); font-size: 19px; font-weight: 700; color: var(--navy);
      border: 2px solid transparent; border-radius: 14px; padding: 15px 0; cursor: pointer;
      transition: transform .12s ease, box-shadow .12s ease;
    }
    .lp-choice[data-tone="green"] { background: #E2F5EC; }
    .lp-choice[data-tone="blue"]  { background: #E6EEFE; }
    .lp-choice[data-tone="coral"] { background: #FDEBE6; }
    .lp-choice[data-tone="amber"] { background: #FBF1D9; }
    .lp-choice:hover { transform: translateY(-2px); }
    .lp-choice.is-selected { border-color: var(--blue); box-shadow: 0 6px 14px -8px rgba(40,100,232,.7); }
    .lp-choice.is-wrong { border-color: var(--coral); }
    .lp-choice__check {
      position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; border-radius: 999px;
      background: var(--blue); color: #fff; font-size: 13px; display: grid; place-items: center;
    }
    .lp-card__ok {
      display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px;
      background: #E4F6EC; color: #1d7a56; border-radius: 14px; padding: 13px 14px; font-size: 14.5px; font-weight: 700;
    }
    .lp-card__ok-left { display: inline-flex; align-items: center; gap: 9px; }
    .lp-card__ok-ico { width: 24px; height: 24px; border-radius: 999px; background: var(--teal); color: #fff; display: grid; place-items: center; font-size: 14px; }
    .lp-card__ok-pts { color: var(--blue); white-space: nowrap; }
    .lp-card__retry { margin-top: 14px; background: #FDEBE6; color: #c0583f; border-radius: 14px; padding: 13px 14px; font-size: 14.5px; font-weight: 700; text-align: center; }

    /* ---- floating stats ---- */
    .lp-stats { position: absolute; right: -8px; top: 24px; z-index: 4; display: flex; flex-direction: column; gap: 10px; }
    .lp-stat {
      background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 10px 14px;
      box-shadow: 0 14px 30px -18px rgba(16,42,86,.4); display: flex; flex-direction: column;
      align-items: center; gap: 2px; min-width: 92px;
    }
    .lp-stat--row { flex-direction: row; align-items: center; gap: 10px; min-width: 120px; }
    .lp-stat--row span { display: flex; flex-direction: column; line-height: 1.1; }
    .lp-stat b { font-size: 17px; font-weight: 700; color: var(--navy); }
    .lp-stat small, .lp-stat__label { font-size: 12px; color: color-mix(in srgb, var(--navy) 55%, transparent); }
    .lp-chip { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; font-size: 17px; }
    .lp-chip--fire { background: #FDEBE6; }
    .lp-chip--star { background: #FBF1D9; }
    .lp-ring { position: relative; width: 48px; height: 48px; display: grid; place-items: center; }
    .lp-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
    .lp-ring__bg { fill: none; stroke: var(--line); stroke-width: 4; }
    .lp-ring__fg { fill: none; stroke: var(--teal); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 97.4; stroke-dashoffset: calc(97.4 - 97.4 * var(--p) / 100); }
    .lp-ring b { font-size: 13px; font-weight: 700; color: var(--navy); }

    /* ---- cactus mascot ---- */
    .lp-mascot { position: absolute; left: -26px; bottom: -26px; width: 104px; height: auto; z-index: 4; filter: drop-shadow(0 12px 18px rgba(16,42,86,.18)); }

    /* ---- playful 3D numbers ---- */
    .lp-num { position: absolute; z-index: 1; font-weight: 800; line-height: 1; user-select: none; }
    .lp-num--8 { top: -18px; right: 8px; font-size: 62px; color: var(--blue); text-shadow: 4px 4px 0 #b9cdf9; }
    .lp-num--3 { bottom: 26px; right: 2px; font-size: 50px; color: var(--teal); text-shadow: 4px 4px 0 #b4e6d2; }
    .lp-num--plus { top: 40px; right: 74px; font-size: 34px; color: var(--coral); text-shadow: 3px 3px 0 #ffd2c6; }
    .lp-spark { position: absolute; border-radius: 999px; z-index: 1; }
    .lp-spark--a { width: 10px; height: 10px; background: var(--coral); top: 88px; right: 56px; }
    .lp-spark--b { width: 8px; height: 8px; background: var(--blue); bottom: 6px; right: 96px; }

    /* ---- sections ---- */
    .lp-section { max-width: 1240px; margin: 0 auto; padding: 16px 24px 72px; }

    /* ---- features ---- */
    .lp-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
    .lp-feat { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 28px 24px; }
    .lp-feat__ico { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; font-size: 20px; color: #fff; margin-bottom: 16px; }
    .lp-feat__ico--blue { background: var(--blue); }
    .lp-feat__ico--green { background: var(--teal); }
    .lp-feat__ico--coral { background: var(--coral); }
    .lp-feat h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
    .lp-feat p { font-size: 15.5px; line-height: 1.55; color: color-mix(in srgb, var(--navy) 65%, transparent); }

    /* ---- books: coming-soon panel ---- */
    .lp-soon {
      max-width: 620px; margin: 0 auto; text-align: center;
      background: var(--surface); border: 1px dashed color-mix(in srgb, var(--blue) 30%, var(--line));
      border-radius: 20px; padding: 44px 28px;
    }
    .lp-soon__ico { font-size: 40px; line-height: 1; }
    .lp-soon__title { font-size: 24px; font-weight: 700; color: var(--blue); margin: 14px 0 8px; }
    .lp-soon__text { font-size: 16px; line-height: 1.6; color: color-mix(in srgb, var(--navy) 62%, transparent); margin: 0; }

    /* ---- about ---- */
    .lp-about { max-width: 760px; margin: 0 auto; padding: 48px 24px 80px; text-align: center; }
    .lp-about h2 { font-size: 34px; font-weight: 700; margin: 0 0 14px; }
    .lp-about p { font-size: 18px; line-height: 1.6; color: color-mix(in srgb, var(--navy) 66%, transparent); margin: 0 0 28px; }

    /* ---- footer ---- */
    .lp-ftr {
      max-width: 1240px; margin: 0 auto; padding: 28px 24px; border-top: 1px solid var(--line);
      display: flex; align-items: center; justify-content: space-between;
    }
    .lp-ftr__copy { font-size: 14px; color: color-mix(in srgb, var(--navy) 55%, transparent); }

    /* ---- responsive ---- */
    /* Tight desktop: keep two columns but tuck the stats under the card so
       they never overflow, and drop the far-corner numbers. */
    @media (max-width: 1100px) {
      .lp-stats {
        position: static; flex-direction: row; flex-wrap: wrap; justify-content: center;
        margin-top: 18px; gap: 8px;
      }
      .lp-stage { flex-direction: column; min-height: 0; }
      .lp-num, .lp-spark { display: none; }
    }
    @media (max-width: 900px) {
      .lp-hero { grid-template-columns: 1fr; gap: 36px; padding: 44px 24px 52px; }
      .lp-hero__title { font-size: 40px; }
      .lp-pointer, .lp-mascot { display: none; }
      .lp-feat-grid { grid-template-columns: 1fr; }
      .lp-nav { display: none; }
    }
    @media (max-width: 560px) {
      .lp-hero__title { font-size: 33px; }
      .lp-card__q { font-size: 38px; }
      .lp-head h2, .lp-about h2 { font-size: 28px; }
      .lp-hdr__inner { gap: 12px; }
      .lp-login { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      .lp-btn, .lp-choice, .lp-card__bar-fill { transition: none; }
      .lp-btn--primary:hover, .lp-choice:hover { transform: none; }
    }
  `]
})
export class LandingComponent {
  /** Interactive demo card — purely illustrative, no backend. */
  readonly answer = 75;
  readonly choices = [
    { value: 65, tone: 'green' },
    { value: 75, tone: 'blue' },
    { value: 85, tone: 'coral' },
    { value: 95, tone: 'amber' }
  ];
  /** Starts on the correct answer so the card shows its happy state (like the brief). */
  readonly picked = signal<number>(this.answer);
  readonly solved = computed(() => this.picked() === this.answer);
  readonly step = computed(() => (this.solved() ? 4 : 3));

  pick(value: number): void {
    this.picked.set(value);
  }
}
