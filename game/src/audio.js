// Synthesised sound for Midnight Vault Heist. No audio files: every
// effect is a short WebAudio oscillator or noise burst, so the game
// stays a handful of static files with no network requests.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.alarmNodes = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.16;
    return this.muted;
  }

  tone(freq, dur, type = 'sine', vol = 1, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, vol = 0.5, lowpass = 1200) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t);
  }

  pickup() {
    this.tone(880, 0.09, 'sine', 0.7);
    setTimeout(() => this.tone(1318, 0.12, 'sine', 0.5), 70);
  }

  vaultOpen() {
    this.tone(220, 0.15, 'triangle', 0.8, 440);
    setTimeout(() => this.tone(660, 0.2, 'triangle', 0.6), 120);
    setTimeout(() => this.tone(880, 0.25, 'sine', 0.5), 240);
  }

  spotted() {
    this.tone(520, 0.16, 'square', 0.35, 780);
  }

  coin() {
    this.tone(1568, 0.07, 'sine', 0.5);
    setTimeout(() => this.tone(2093, 0.1, 'sine', 0.4), 60);
  }

  smoke() {
    this.noise(0.5, 0.4, 900);
  }

  emp() {
    this.tone(1200, 0.35, 'sawtooth', 0.25, 180);
  }

  busted() {
    this.tone(392, 0.25, 'square', 0.4, 196);
    setTimeout(() => this.tone(311, 0.3, 'square', 0.4, 155), 220);
  }

  getaway() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => setTimeout(() => this.tone(n, 0.22, 'triangle', 0.6), i * 110));
  }

  startAlarm() {
    if (!this.ctx || this.muted || this.alarmNodes) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 620;
    lfo.type = 'sine';
    lfo.frequency.value = 1.6;
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    lfo.start();
    this.alarmNodes = { osc, lfo, gain };
  }

  stopAlarm() {
    if (!this.alarmNodes) return;
    try {
      this.alarmNodes.osc.stop();
      this.alarmNodes.lfo.stop();
    } catch {
      // already stopped
    }
    this.alarmNodes = null;
  }
}
