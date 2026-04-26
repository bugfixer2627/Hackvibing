// === AUDIO ENGINE START ===
// Self-contained procedural audio for The Passport Pantry.
// Pure Web Audio API — no external files, no network requests.
// Safe to call any method before init(); calls are no-ops until an AudioContext exists.

type DestinationId = "home" | "China" | "Indonesia" | "United States of America" | "India";

type LoopVoice = {
  osc: OscillatorNode;
  gain: GainNode;
};

type LoopHandle = {
  master: GainNode;
  voices: LoopVoice[];
  stopAt: number;
};

type DestinationProfile = {
  scale: number[];
  pattern: number[];
  bass: number[];
  stepDuration: number;
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  vibratoCents: number;
  gain: number;
  stampRoot: number;
};

const A4 = 440;
const midiToFreq = (m: number) => A4 * Math.pow(2, (m - 69) / 12);
const pent = (root: number) => [0, 2, 4, 7, 9].map((i) => root + i);

const DESTINATIONS: Record<DestinationId, DestinationProfile> = {
  home: {
    scale: pent(60),
    pattern: [0, 2, 4, 2, 1, 3, 2, 0, -1, 4, 3, 1, 2, 0, -1, -1],
    bass: [48, 55],
    stepDuration: 0.375,
    leadWave: "sine",
    bassWave: "sine",
    vibratoCents: 8,
    gain: 0.18,
    stampRoot: 60
  },
  China: {
    scale: pent(60),
    pattern: [0, 2, 4, 2, 1, 3, 2, 0, -1, 4, 3, 1, 2, 0, -1, -1],
    bass: [48, 55],
    stepDuration: 0.375,
    leadWave: "sine",
    bassWave: "sine",
    vibratoCents: 8,
    gain: 0.18,
    stampRoot: 60
  },
  Indonesia: {
    scale: [62, 65, 67, 69, 72, 74],
    pattern: [0, 2, 4, 3, 2, 0, 2, 4, 5, 4, 2, 0, 3, 2, -1, -1],
    bass: [50, 57],
    stepDuration: 0.32,
    leadWave: "triangle",
    bassWave: "triangle",
    vibratoCents: 4,
    gain: 0.16,
    stampRoot: 62
  },
  "United States of America": {
    scale: [64, 66, 68, 71, 73],
    pattern: [0, -1, 2, 1, 3, -1, 4, 2, 0, 2, -1, 3, 1, -1, 4, -1],
    bass: [52, 59],
    stepDuration: 0.28,
    leadWave: "triangle",
    bassWave: "sine",
    vibratoCents: 0,
    gain: 0.15,
    stampRoot: 64
  },
  India: {
    scale: [65, 66, 70, 72, 73, 77],
    pattern: [0, 1, 2, 3, 2, 1, 0, 4, 3, 2, 1, 0, -1, 5, 3, -1],
    bass: [41, 48],
    stepDuration: 0.42,
    leadWave: "sine",
    bassWave: "sine",
    vibratoCents: 12,
    gain: 0.17,
    stampRoot: 65
  }
};

const INGREDIENT_NOTES = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93];

function hashIndex(s: string, mod: number): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private currentLoop: LoopHandle | null = null;
  private currentLoopId: DestinationId | null = null;
  private loopTimer: number | null = null;
  private muted = false;
  private masterVolume = 0.7;

  init(): void {
    if (this.ctx) return;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
      this.masterGain.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 1;
      this.musicBus.connect(this.masterGain);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 1;
      this.sfxBus.connect(this.masterGain);
    } catch {
      this.ctx = null;
    }
  }

  private ready(): boolean {
    if (!this.ctx) return false;
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => undefined);
    }
    return true;
  }

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      const target = this.muted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isInitialized(): boolean {
    return this.ctx !== null;
  }

  playBGM(destinationId: string): void {
    if (!this.ready() || !this.ctx || !this.musicBus) return;
    const id = (DESTINATIONS[destinationId as DestinationId] ? destinationId : "home") as DestinationId;
    if (this.currentLoopId === id && this.currentLoop) return;
    try {
      this.stopBGM();
      const profile = DESTINATIONS[id];
      const loop = this.startLoop(profile);
      this.currentLoop = loop;
      this.currentLoopId = id;
    } catch {
      /* noop */
    }
  }

  stopBGM(): void {
    if (!this.ctx) return;
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    const loop = this.currentLoop;
    this.currentLoop = null;
    this.currentLoopId = null;
    if (!loop) return;
    try {
      const now = this.ctx.currentTime;
      loop.master.gain.cancelScheduledValues(now);
      loop.master.gain.setValueAtTime(loop.master.gain.value, now);
      loop.master.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      window.setTimeout(() => {
        loop.voices.forEach((v) => {
          try { v.osc.stop(); } catch { /* noop */ }
          try { v.osc.disconnect(); } catch { /* noop */ }
          try { v.gain.disconnect(); } catch { /* noop */ }
        });
        try { loop.master.disconnect(); } catch { /* noop */ }
      }, 400);
    } catch {
      /* noop */
    }
  }

  private startLoop(profile: DestinationProfile): LoopHandle {
    const ctx = this.ctx!;
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(this.musicBus!);
    const now = ctx.currentTime;
    master.gain.linearRampToValueAtTime(profile.gain, now + 0.5);

    const voices: LoopVoice[] = [];
    if (profile.bass.length > 0) {
      const bassOsc = ctx.createOscillator();
      bassOsc.type = profile.bassWave;
      bassOsc.frequency.value = midiToFreq(profile.bass[0]);
      const bassGain = ctx.createGain();
      bassGain.gain.value = 0.5;
      bassOsc.connect(bassGain).connect(master);
      bassOsc.start();
      voices.push({ osc: bassOsc, gain: bassGain });
    }

    const handle: LoopHandle = { master, voices, stopAt: 0 };

    const stepDur = profile.stepDuration;
    const patternLen = profile.pattern.length;
    const lookahead = 0.1;
    const scheduleAheadTime = 0.3;
    let nextStepTime = now + 0.55;
    let stepIndex = 0;
    let bassIndex = 0;
    const barSteps = 8;

    const scheduleStep = (when: number, idx: number) => {
      const step = profile.pattern[idx];
      if (step >= 0) {
        const midi = profile.scale[step % profile.scale.length];
        this.scheduleLeadNote(handle, profile, midi, when, stepDur * 0.9);
      }
      if (idx % barSteps === 0 && profile.bass.length > 1 && voices[0]) {
        const target = midiToFreq(profile.bass[bassIndex % profile.bass.length]);
        voices[0].osc.frequency.setTargetAtTime(target, when, 0.08);
        bassIndex++;
      }
    };

    const tick = () => {
      if (!this.ctx || this.currentLoop !== handle) return;
      while (nextStepTime < this.ctx.currentTime + scheduleAheadTime) {
        scheduleStep(nextStepTime, stepIndex % patternLen);
        nextStepTime += stepDur;
        stepIndex++;
      }
    };
    this.loopTimer = window.setInterval(tick, lookahead * 1000);
    tick();

    return handle;
  }

  private scheduleLeadNote(
    handle: LoopHandle,
    profile: DestinationProfile,
    midi: number,
    when: number,
    duration: number
  ): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = profile.leadWave;
    const freq = midiToFreq(midi);
    osc.frequency.value = freq;

    let lfo: OscillatorNode | null = null;
    let lfoGain: GainNode | null = null;
    if (profile.vibratoCents > 0) {
      lfo = ctx.createOscillator();
      lfo.frequency.value = 5;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = freq * (Math.pow(2, profile.vibratoCents / 1200) - 1);
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(when);
      lfo.stop(when + duration + 0.25);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(0.5, when + 0.05);
    gain.gain.setValueAtTime(0.5, when + Math.max(0.05, duration - 0.2));
    gain.gain.linearRampToValueAtTime(0.0001, when + duration);

    osc.connect(gain).connect(handle.master);
    osc.start(when);
    osc.stop(when + duration + 0.05);
    osc.onended = () => {
      try { osc.disconnect(); } catch { /* noop */ }
      try { gain.disconnect(); } catch { /* noop */ }
      if (lfo) {
        try { lfo.disconnect(); } catch { /* noop */ }
        try { lfoGain?.disconnect(); } catch { /* noop */ }
      }
    };
  }

  playIngredientTap(ingredientId: string): void {
    if (!this.ready() || !this.ctx || !this.sfxBus) return;
    try {
      const note = INGREDIENT_NOTES[hashIndex(ingredientId, INGREDIENT_NOTES.length)];
      this.marimbaHit(midiToFreq(note), 0.35, 0);
    } catch { /* noop */ }
  }

  playIngredientDeselect(ingredientId: string): void {
    if (!this.ready() || !this.ctx || !this.sfxBus) return;
    try {
      const note = INGREDIENT_NOTES[hashIndex(ingredientId, INGREDIENT_NOTES.length)];
      this.marimbaHit(midiToFreq(note), 0.18, -50);
    } catch { /* noop */ }
  }

  private marimbaHit(freq: number, peak: number, pitchBendCents: number): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(peak, now + 0.005);
    out.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    out.connect(this.sfxBus!);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = freq;
    const g1 = ctx.createGain();
    g1.gain.value = 1.0;
    osc1.connect(g1).connect(out);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.3;
    osc2.connect(g2).connect(out);

    if (pitchBendCents !== 0) {
      const t1 = freq * Math.pow(2, pitchBendCents / 1200);
      const t2 = freq * 2 * Math.pow(2, pitchBendCents / 1200);
      osc1.frequency.setTargetAtTime(t1, now, 0.04);
      osc2.frequency.setTargetAtTime(t2, now, 0.04);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.22);
    osc2.stop(now + 0.22);
    osc1.onended = () => {
      try { osc1.disconnect(); g1.disconnect(); } catch { /* noop */ }
      try { osc2.disconnect(); g2.disconnect(); } catch { /* noop */ }
      try { out.disconnect(); } catch { /* noop */ }
    };
  }

  playStampJingle(destinationId: string): void {
    if (!this.ready() || !this.ctx || !this.sfxBus) return;
    try {
      const profile = DESTINATIONS[destinationId as DestinationId] ?? DESTINATIONS.home;
      const root = profile.stampRoot;
      const intervals = [0, 4, 7, 12];
      const ctx = this.ctx;
      const start = ctx.currentTime + 0.01;
      intervals.forEach((semis, i) => {
        const when = start + i * 0.12;
        const freq = midiToFreq(root + semis);
        const peak = 0.25 + i * 0.05;
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(peak, when + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
        osc.connect(g).connect(this.sfxBus!);
        osc.start(when);
        osc.stop(when + 0.12);
        osc.onended = () => {
          try { osc.disconnect(); g.disconnect(); } catch { /* noop */ }
        };
      });
    } catch { /* noop */ }
  }
}

export const audio = new AudioEngine();
// === AUDIO ENGINE END ===
