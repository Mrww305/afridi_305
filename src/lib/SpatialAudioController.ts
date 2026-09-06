/**
 * SpatialAudioController
 * ----------------------
 * Global Web Audio engine for the drafting-floor experience.
 *
 *  - "The Sketch Hum": a low, warm mechanical draft-table drone built from two
 *    detuned oscillators + band-passed brown noise, breathing on a slow LFO.
 *  - "The Relay Click": a sharp mechanical switch-clink (square blip + body
 *    thock + high-passed noise snap), spatialized through a StereoPannerNode
 *    mapped to cursor X, with natural distance rolloff via gain.
 *
 * The context is created ONLY after an explicit user gesture (the Entry
 * Gateway) so autoplay policies are respected everywhere.
 */

type Ctx = AudioContext;

class SpatialAudioController {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private humBus: GainNode | null = null;
  private enabled = false;
  private initialized = false;
  private lastTick = 0;

  /** Must be called from a user gesture. Safe to call repeatedly. */
  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.buildHum();
      this.initialized = true;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  get isReady() {
    return this.initialized;
  }

  setEnabled(on: boolean) {
    if (!this.ctx || !this.master) return;
    this.enabled = on;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.9 : 0.0001, t, on ? 1.4 : 0.25);
  }

  get isEnabled() {
    return this.enabled;
  }

  /* ------------------------------------------------------------------ */
  /* The Sketch Hum — ambient draft-table loop                           */
  /* ------------------------------------------------------------------ */
  private buildHum() {
    const ctx = this.ctx!;
    const bus = ctx.createGain();
    bus.gain.value = 0.16;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 230;
    lp.Q.value = 0.8;

    // Two detuned oscillators beat against each other like a drafting-table motor.
    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 46;
    const o2 = ctx.createOscillator();
    o2.type = "triangle";
    o2.frequency.value = 46.7;
    const og = ctx.createGain();
    og.gain.value = 0.5;
    o1.connect(og);
    o2.connect(og);
    og.connect(lp);

    // Band-passed brown noise = the paper-grain hiss of the room.
    const noiseBuf = this.brownNoise(ctx, 3);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 118;
    bp.Q.value = 7;
    const ng = ctx.createGain();
    ng.gain.value = 0.35;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(lp);

    lp.connect(bus);
    bus.connect(this.master!);

    // Slow breathing LFO on the filter + a whisper LFO on level.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 70;
    lfo.connect(lfoAmt);
    lfoAmt.connect(lp.frequency);

    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.045;
    const lfo2Amt = ctx.createGain();
    lfo2Amt.gain.value = 0.035;
    lfo2.connect(lfo2Amt);
    lfo2Amt.connect(bus.gain);

    o1.start();
    o2.start();
    noise.start();
    lfo.start();
    lfo2.start();
    this.humBus = bus;
  }

  private brownNoise(ctx: Ctx, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return buf;
  }

  /* ------------------------------------------------------------------ */
  /* The Relay Click — spatialized mechanical switch clink               */
  /* ------------------------------------------------------------------ */

  /** pan: -1 (left ear) .. +1 (right ear). intensity 0..1 */
  click(pan = 0, intensity = 1) {
    if (!this.ctx || !this.master || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const out = this.spatialize(pan, 0.5 * intensity);

    // High metallic blip
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(2350, t);
    osc.frequency.exponentialRampToValueAtTime(820, t + 0.035);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32 * intensity, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + 0.09);

    // Mechanical body thock
    const th = ctx.createOscillator();
    th.type = "triangle";
    th.frequency.setValueAtTime(210, t);
    th.frequency.exponentialRampToValueAtTime(70, t + 0.06);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.0001, t);
    tg.gain.exponentialRampToValueAtTime(0.28 * intensity, t + 0.006);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    th.connect(tg);
    tg.connect(out);
    th.start(t);
    th.stop(t + 0.11);

    // Contact snap — high-passed noise burst
    const nb = ctx.createBufferSource();
    nb.buffer = this.brownNoise(ctx, 0.05);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 4200;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.25 * intensity, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    nb.connect(hp);
    hp.connect(ng);
    ng.connect(out);
    nb.start(t);
  }

  /** Softer, throttled tick for hover events. */
  hoverTick(pan = 0) {
    const now = performance.now();
    if (now - this.lastTick < 70) return;
    this.lastTick = now;
    this.click(pan, 0.32);
  }

  /** Staggered boot sequence played when the gateway opens. */
  bootSequence() {
    if (!this.enabled) return;
    const pans = [-0.7, 0.65, -0.3, 0.85, 0];
    pans.forEach((p, i) =>
      window.setTimeout(() => this.click(p, 0.8), 120 + i * 110)
    );
  }

  private spatialize(pan: number, gain: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = gain;
    const dest = this.master!;
    if (typeof ctx.createStereoPanner === "function") {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p);
      p.connect(dest);
    } else {
      g.connect(dest);
    }
    return g;
  }
}

/** Global singleton — browser-only APIs are touched lazily, never at import. */
export const spatialAudio = new SpatialAudioController();

/** Map a clientX coordinate to a stereo pan value. */
export function panFromX(clientX: number) {
  if (typeof window === "undefined") return 0;
  return (clientX / window.innerWidth) * 2 - 1;
}
