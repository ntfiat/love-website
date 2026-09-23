/**
 * Zero-Dependency Cozy Lofi & Romantic Audio Engine
 * Powered by Web Audio API for warm Rhodes/kalimba chords, vinyl warmth, and cute sound effects
 */

class StoryAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.gainNode = null;
    this.masterGain = null;
    this.currentChordIndex = 0;

    // Romantic Chord Progressions (Frequencies in Hz: Warm Maj9 / Add9 / m9)
    this.chordProgression = [
      // Fmaj9: F3, C4, E4, G4, A4
      [174.61, 261.63, 329.63, 392.00, 440.00],
      // G7sus: G3, D4, F4, A4, C5
      [196.00, 293.66, 349.23, 440.00, 523.25],
      // Em7: E3, B3, D4, G4, B4
      [164.81, 246.94, 293.66, 392.00, 493.88],
      // Am9: A3, E4, G4, C5, B4
      [220.00, 329.63, 392.00, 523.25, 493.88],
      // Dm9: D3, A3, C4, F4, E4
      [146.83, 220.00, 261.63, 349.23, 329.63],
      // Bbmaj7: Bb3, F4, A4, D5
      [233.08, 349.23, 440.00, 587.33]
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.preloadHeartbeatAudio();
  }

  toggleMusic() {
    this.init();
    if (this.isPlayingMusic) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    this.isPlayingMusic = true;
    this.playChordStep();
    this.musicTimer = setInterval(() => {
      this.playChordStep();
    }, 4200);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playChordStep() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const chord = this.chordProgression[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgression.length;

    const now = this.ctx.currentTime;
    
    // Play warm arpeggiated chime notes for this chord
    chord.forEach((freq, idx) => {
      const noteDelay = idx * 0.18 + (Math.random() * 0.05);
      this.triggerKalimbaNote(freq, now + noteDelay, 3.2);
    });
  }

  triggerKalimbaNote(freq, startTime, duration = 2.5) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Warm soft Rhodes / Kalimba tone
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, startTime);
    filter.frequency.exponentialRampToValueAtTime(350, startTime + duration);

    // Envelope: quick attack, warm ringing decay
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // SOUND EFFECT: Cat Purr / Cute Meow
  playCatSound() {
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Gentle upward pitch glide: cute chirp
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // SOUND EFFECT: Wax Seal Break Crack + Melodic Sparkle
  playSealBreakSound() {
    this.init();
    const now = this.ctx.currentTime;

    // Crisp high-frequency wax pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(860, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);

    // Followed by soft chime
    setTimeout(() => {
      this.playStarChime(1318.51); // E6 chime
    }, 80);
  }

  // SOUND EFFECT: Book Page Flip
  playBookOpenSound() {
    this.init();
    const now = this.ctx.currentTime;

    // Filtered noise burst for paper rustle
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
  }

  // SOUND EFFECT: Star Chime
  playStarChime(freq = 1174.66) {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  // Preload Heartbeat Audio Buffer for instantaneous response
  preloadHeartbeatAudio() {
    if (this.heartbeatBuffer || this.isLoadingHeartbeat) return;
    this.isLoadingHeartbeat = true;

    const audioPaths = [
      '/assets/u_xg7ssi08yr-heart-beat-355442 (mp3cut.net).mp3',
      '/assets/heartbeat.mp3',
      './assets/heartbeat.mp3'
    ];

    const tryFetch = async (index = 0) => {
      if (index >= audioPaths.length) return;
      try {
        const response = await fetch(audioPaths[index]);
        if (!response.ok) throw new Error('Fetch failed');
        const arrayBuffer = await response.arrayBuffer();
        if (this.ctx) {
          this.ctx.decodeAudioData(arrayBuffer, (decoded) => {
            this.heartbeatBuffer = decoded;
          }, (err) => {
            console.warn('[AudioEngine] Buffer decode error:', err);
            tryFetch(index + 1);
          });
        }
      } catch (err) {
        tryFetch(index + 1);
      }
    };

    tryFetch(0);

    // Also preload standard HTML5 Audio element as secondary fallback
    try {
      this.heartbeatAudio = new Audio(audioPaths[0]);
      this.heartbeatAudio.volume = 0.85;
      this.heartbeatAudio.load();
    } catch (e) {
      this.heartbeatAudio = null;
    }
  }

  // SOUND EFFECT: Heartbeat (Custom audio with Web Audio zero-latency playback)
  playHeartbeat() {
    this.init();

    // 1. First priority: Pre-decoded Web Audio buffer for instantaneous 0ms playback
    if (this.ctx && this.heartbeatBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.heartbeatBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.9, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        source.start(0);
        return;
      } catch (e) {
        console.warn('[AudioEngine] Buffer playback failed, falling back:', e);
      }
    }

    // 2. Second priority: HTML5 Audio element
    if (!this.heartbeatAudio) {
      try {
        this.heartbeatAudio = new Audio('/assets/u_xg7ssi08yr-heart-beat-355442 (mp3cut.net).mp3');
        this.heartbeatAudio.volume = 0.85;
      } catch (e) {
        this.heartbeatAudio = null;
      }
    }

    if (this.heartbeatAudio) {
      this.heartbeatAudio.currentTime = 0;
      this.heartbeatAudio.play().catch(() => {
        // 3. Fallback: Synthesized cardiac thumps
        const now = this.ctx.currentTime;
        this.playThump(now, 58, 0.18, 0.22);
        this.playThump(now + 0.22, 52, 0.14, 0.18);
      });
    } else {
      const now = this.ctx.currentTime;
      this.playThump(now, 58, 0.18, 0.22);
      this.playThump(now + 0.22, 52, 0.14, 0.18);
    }
  }

  playThump(time, freq, attack, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  // SOUND EFFECT: Celebration Fanfare
  playCelebrationFanfare() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playStarChime(freq);
      }, i * 90);
    });
  }
}

export const audio = new StoryAudioEngine();
