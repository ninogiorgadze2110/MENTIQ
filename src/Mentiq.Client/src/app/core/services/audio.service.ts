import { Injectable, signal } from '@angular/core';

type Earcon = 'success' | 'error' | 'finished' | 'tap';

/**
 * Kids audio system. Two independent layers:
 *
 *  1. Sound EFFECTS ("earcons") — synthesised with the Web Audio API. No files,
 *     no installed voices, works in every browser. Used for correct/incorrect
 *     feedback and taps so the app is never silent.
 *
 *  2. Georgian VOICE instructions — resolved from a manifest of recorded files
 *     when present, otherwise spoken via SpeechSynthesis (ka-GE). Many desktop
 *     browsers ship no Georgian voice, so recorded files are the real solution;
 *     dropping them into the manifest needs no change to exercise code.
 *
 * Browsers block audio until the first user gesture, so the context and speech
 * engine are "primed" on the first interaction.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly manifest = new Map<string, string>();

  private readonly phrases: Record<string, string> = {
    success: 'ყოჩაღ!',
    error: 'კარგად დაფიქრდი და კიდევ სცადე.',
    encouragement: 'შენ შეგიძლია!',
    finished: 'დღევანდელი მისია დასრულებულია!'
  };

  readonly muted = signal<boolean>(this.readMuted());

  private ctx?: AudioContext;
  private voices: SpeechSynthesisVoice[] = [];
  private primed = false;

  constructor() {
    this.loadVoices();
    // Prime audio + speech on the first user gesture (autoplay policies).
    if (typeof document !== 'undefined') {
      const prime = () => this.prime();
      document.addEventListener('pointerdown', prime, { once: true });
      document.addEventListener('keydown', prime, { once: true });
    }
  }

  register(key: string, url: string): void {
    this.manifest.set(key, url);
  }

  registerMany(entries: Record<string, string>): void {
    for (const [k, v] of Object.entries(entries)) this.manifest.set(k, v);
  }

  toggleMute(): void {
    const next = !this.muted();
    this.muted.set(next);
    try {
      localStorage.setItem('mentiq.kids.muted', next ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
    if (next) this.stop();
  }

  /** A well-known phrase: play its earcon AND speak it. */
  cue(key: string): void {
    if (this.muted()) return;
    if (key === 'success' || key === 'error' || key === 'finished') {
      this.earcon(key as Earcon);
    }
    const text = this.phrases[key];
    if (text) this.speak(text);
  }

  /** Short tap blip (option press). */
  blip(): void {
    this.earcon('tap');
  }

  /** Play recorded audio for a key, else speak the fallback Georgian text. */
  play(key: string, fallbackText?: string): void {
    if (this.muted()) return;
    const url = this.manifest.get(key);
    if (url) {
      this.playFile(url);
      return;
    }
    if (fallbackText) this.speak(fallbackText);
  }

  speak(text: string): void {
    if (this.muted() || !text) return;
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    if (!synth) return;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ka-GE';
      u.rate = 0.95;
      u.pitch = 1.1;
      const ka = this.voices.find((v) => v.lang?.toLowerCase().startsWith('ka'));
      if (ka) u.voice = ka; // only speaks aloud where a Georgian voice exists
      synth.speak(u);
    } catch {
      /* not available */
    }
  }

  stop(): void {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }

  // -----------------------------------------------------------------------
  // Web Audio earcons
  // -----------------------------------------------------------------------

  private earcon(kind: Earcon): void {
    if (this.muted()) return;
    const ctx = this.audioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    const notes: Record<Earcon, { f: number; t: number; d: number; type?: OscillatorType }[]> = {
      success: [
        { f: 523.25, t: 0, d: 0.12 },
        { f: 659.25, t: 0.1, d: 0.12 },
        { f: 783.99, t: 0.2, d: 0.2 }
      ],
      finished: [
        { f: 523.25, t: 0, d: 0.12 },
        { f: 659.25, t: 0.12, d: 0.12 },
        { f: 783.99, t: 0.24, d: 0.12 },
        { f: 1046.5, t: 0.36, d: 0.28 }
      ],
      error: [{ f: 311.13, t: 0, d: 0.28, type: 'sine' }],
      tap: [{ f: 660, t: 0, d: 0.06, type: 'triangle' }]
    };

    for (const n of notes[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type ?? 'sine';
      osc.frequency.value = n.f;
      const start = now + n.t;
      const peak = kind === 'tap' ? 0.12 : 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + n.d + 0.02);
    }
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private prime(): void {
    if (this.primed) return;
    this.primed = true;
    const ctx = this.audioContext();
    if (ctx?.state === 'suspended') void ctx.resume();
    // Warm up the speech engine with a silent utterance so later calls speak.
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis?.speak(u);
    } catch {
      /* ignore */
    }
  }

  private audioContext(): AudioContext | undefined {
    if (this.ctx) return this.ctx;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) this.ctx = new Ctor();
    } catch {
      /* Web Audio unavailable */
    }
    return this.ctx;
  }

  private loadVoices(): void {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    if (!synth) return;
    const read = () => {
      this.voices = synth.getVoices();
    };
    read();
    synth.addEventListener?.('voiceschanged', read);
  }

  private playFile(url: string): void {
    try {
      const audio = new Audio(url);
      void audio.play();
    } catch {
      /* autoplay blocked until gesture */
    }
  }

  private readMuted(): boolean {
    try {
      return localStorage.getItem('mentiq.kids.muted') === '1';
    } catch {
      return false;
    }
  }
}
