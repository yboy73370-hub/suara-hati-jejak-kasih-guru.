/**
 * Penjana melodi latar lembut menggunakan Web Audio API.
 * Hanya dimainkan apabila pengguna menekan butang muzik dan boleh dihentikan bila-bila masa.
 */
class GentleFantasyMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private isPlaying = false;
  private stepIndex = 0;

  // Melodi pentatonik F major / D minor lembut berirama kotak muzik
  private readonly melodyNotes: Array<{ freq: number; duration: number }> = [
    { freq: 523.25, duration: 0.55 }, // C5
    { freq: 587.33, duration: 0.55 }, // D5
    { freq: 659.25, duration: 0.7 },  // E5
    { freq: 783.99, duration: 0.7 },  // G5
    { freq: 659.25, duration: 0.55 }, // E5
    { freq: 587.33, duration: 0.55 }, // D5
    { freq: 523.25, duration: 0.9 },  // C5
    { freq: 440.0, duration: 0.55 },  // A4
    { freq: 523.25, duration: 0.55 }, // C5
    { freq: 587.33, duration: 0.7 },  // D5
    { freq: 659.25, duration: 0.7 },  // E5
    { freq: 523.25, duration: 0.55 }, // C5
    { freq: 440.0, duration: 0.55 },  // A4
    { freq: 392.0, duration: 1.0 },  // G4
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private playNote(freq: number, duration: number): void {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2, now);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.14, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.28, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.35);

    osc.connect(noteGain);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + duration * 1.4);
    harmonic.stop(now + duration * 1.4);
  }

  private scheduleNext = (): void => {
    if (!this.isPlaying) return;
    const note = this.melodyNotes[this.stepIndex % this.melodyNotes.length];
    this.playNote(note.freq, note.duration);
    this.stepIndex += 1;

    this.timerId = window.setTimeout(this.scheduleNext, note.duration * 1000);
  };

  public async start(): Promise<boolean> {
    if (this.isPlaying) return true;
    const ctx = this.ensureContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.isPlaying = true;
    this.scheduleNext();
    return true;
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Memainkan kesan bunyi kejayaan ringkas hanya jika audio latar telah diaktifkan oleh pengguna.
   */
  public playSuccessChime(): void {
    if (!this.isPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const chimeNotes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    const baseTime = ctx.currentTime;

    chimeNotes.forEach((freq, idx) => {
      const start = baseTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.11, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  private applauseTimerIds: number[] = [];

  /**
   * Memainkan bunyi tepukan ringkas dan nada kejayaan untuk Istiadat Pelita Emas (boleh dimatikan).
   */
  public playApplauseCelebration(): void {
    this.stopApplause();
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    // Nada keraian pendek
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      const start = now + idx * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.09, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.48);
    });

    // Bunyi tepukan lembut berirama (10 tepukan ringkas selama ~1.6 saat)
    const bufferSize = Math.floor(ctx.sampleRate * 0.075);
    for (let i = 0; i < 10; i += 1) {
      const timerId = window.setTimeout(() => {
        if (!this.ctx) return;
        const c = this.ctx;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let s = 0; s < bufferSize; s += 1) {
          const env = Math.pow(1 - s / bufferSize, 2.2);
          data[s] = (Math.random() * 2 - 1) * env * 0.32;
        }
        const src = c.createBufferSource();
        src.buffer = buffer;

        const filter = c.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100 + (i % 3) * 240, c.currentTime);
        filter.Q.setValueAtTime(1.1, c.currentTime);

        const gain = c.createGain();
        gain.gain.setValueAtTime(0.09, c.currentTime);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        src.start();
      }, 140 + i * 145);
      this.applauseTimerIds.push(timerId);
    }
  }

  public stopApplause(): void {
    for (const id of this.applauseTimerIds) {
      window.clearTimeout(id);
    }
    this.applauseTimerIds = [];
  }
}

export const musicEngine = new GentleFantasyMusicEngine();
