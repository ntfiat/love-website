/**
 * Interactive Heartbeat Sanctuary Controller
 * Implements progressive ECG stabilization:
 * 1. Starts straight/faint.
 * 2. Revives through continuous presses.
 * 3. Becomes completely stable and healthy.
 * 4. Reveals the thank-you note for fixing his heart & the "Ready for Question" button!
 */

import { audio } from './audio.js';
import { onNamesChange } from './names.js';

export class HeartbeatController {
  constructor() {
    this.heartBtn = document.querySelector('.cute-plump-heart-btn');
    this.heartCard = document.querySelector('.heart-sanctuary-card');
    this.shockwaveContainer = document.querySelector('.heart-shockwave-container');
    this.whispersContainer = document.querySelector('.heart-whispers-layer');

    // ECG & Monitor Elements
    this.stateVal = document.getElementById('ecg-state-val');
    this.statePill = document.getElementById('ecg-state-pill');
    this.statusMsg = document.getElementById('heart-status-msg');
    this.bpmVal = document.getElementById('heart-bpm-val');
    this.bpmPill = document.getElementById('ecg-bpm-pill');
    this.ecgPulsePath = document.getElementById('ecg-pulse-path');
    this.ecgBasePath = document.getElementById('ecg-base-path');
    this.ecgScreen = document.getElementById('ecg-screen');

    // Revive Progress & Reveal Elements
    this.reviveBox = document.getElementById('heart-revive-progress-box');
    this.meterFill = document.getElementById('revive-meter-fill');
    this.counterText = document.getElementById('revive-counter-text');
    this.lockedHint = document.getElementById('heart-locked-hint');
    this.fixedCard = document.getElementById('heart-fixed-card');
    this.readyQuestion = document.getElementById('ready-question-wrapper');

    // Waveform Paths for each stage
    this.waveforms = {
      // 0: Nearly straight / flat faint line
      straight: 'M0,30 L100,30 L110,29 L120,31 L130,30 L220,30 L230,29 L240,31 L250,30 L350,30 L360,29 L370,31 L380,30 L500,30',
      // 1: Small flutter
      flutter: 'M0,30 L100,30 L115,25 L125,35 L135,30 L220,30 L235,25 L245,35 L255,30 L350,30 L365,25 L375,35 L385,30 L500,30',
      // 2: Growing pulse
      warming: 'M0,30 L90,30 L105,20 L115,40 L125,18 L138,42 L148,30 L220,30 L235,20 L245,40 L255,18 L268,42 L278,30 L360,30 L375,20 L385,40 L395,18 L408,42 L418,30 L500,30',
      // 3: Strong rhythm
      almost: 'M0,30 L80,30 L95,18 L105,42 L115,12 L128,48 L140,24 L150,30 L220,30 L235,18 L245,42 L255,12 L268,48 L280,24 L290,30 L360,30 L375,18 L385,42 L395,12 L408,48 L420,24 L430,30 L500,30',
      // 4: Fully stable, rich, living cardiac wave
      stable: 'M0,30 L50,30 L65,30 L75,22 L85,38 L95,8 L108,52 L120,22 L130,30 L180,30 L195,30 L205,22 L215,38 L225,8 L238,52 L250,22 L260,30 L310,30 L325,30 L335,22 L345,38 L355,8 L368,52 L380,22 L390,30 L440,30 L455,30 L465,22 L475,38 L485,8 L498,52 L500,30'
    };

    this.boy = 'Siddharth';
    this.girl = 'Khushi';
    this.whisperList = [];

    this.reviveCount = 0;
    this.targetTaps = 4;
    this.isStabilized = false;
    this.decayTimer = null;

    onNamesChange(({ boy, girl }) => {
      this.updateNames(boy, girl);
    });

    this.init();
  }

  updateNames(boy, girl) {
    this.boy = boy;
    this.girl = girl;
    this.whisperList = [
      'Lub-dub! 💓',
      `${girl} ♡`,
      '142 BPM! 🥰',
      'Only for you ✨',
      'My heart is fixed 💕',
      'Always yours 🌸',
      'Thump-thump! 💖',
      'Forever with you ♡',
      `Beating fast for ${girl}! 🐾`,
      'My favorite person 🌷'
    ];
  }

  init() {
    if (!this.heartBtn) return;

    // Preload audio on initial user interaction anywhere or section view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          audio.init();
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    if (this.heartCard) {
      observer.observe(this.heartCard);
    }

    // Set initial dormant / straight ECG path
    this.applyWaveform(this.waveforms.straight, false);

    // Click & Touch Events
    this.heartBtn.addEventListener('click', (e) => this.handleHeartBeat(e));
    this.heartBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleHeartBeat();
      }
    });
  }

  handleHeartBeat(e) {
    // 1. Play Heartbeat Audio (u_xg7ssi08yr-heart-beat-355442 (mp3cut.net).mp3)
    audio.playHeartbeat();

    // 2. Double-Thump Heart Scale Animation
    this.heartBtn.classList.remove('is-pumping');
    void this.heartBtn.offsetWidth; // Reflow to restart animation
    this.heartBtn.classList.add('is-pumping');

    // 3. Emit Expanding Shockwave Rings
    this.emitShockwaves();

    // 4. Float Cute Love Whispers & Mini Hearts
    this.spawnWhispers(e);

    // 5. Handle Progressive Reviving & Stabilization
    if (!this.isStabilized) {
      this.advanceRevival();
    } else {
      this.continueActiveBeating();
    }

    // Reset pumping class after animation completes
    setTimeout(() => {
      this.heartBtn.classList.remove('is-pumping');
    }, 1200);
  }

  advanceRevival() {
    this.reviveCount++;

    // Clear any previous decay timeout
    if (this.decayTimer) {
      clearTimeout(this.decayTimer);
      this.decayTimer = null;
    }

    const percentage = Math.min(100, Math.round((this.reviveCount / this.targetTaps) * 100));

    if (this.meterFill) {
      this.meterFill.style.width = `${percentage}%`;
    }

    if (this.counterText) {
      this.counterText.textContent = `Tap ${Math.min(this.reviveCount, this.targetTaps)} / ${this.targetTaps} to revive his heart ♡`;
    }

    if (this.bpmPill) {
      this.bpmPill.classList.add('racing');
      setTimeout(() => this.bpmPill.classList.remove('racing'), 400);
    }

    // Stage progression based on tap count
    switch (this.reviveCount) {
      case 1:
        if (this.bpmVal) this.bpmVal.textContent = '68';
        if (this.stateVal) this.stateVal.textContent = 'Fluttering 🌱';
        if (this.statusMsg) {
          this.statusMsg.textContent = '1/4: It felt your touch! Keep pressing continuously... ♡';
          this.statusMsg.classList.add('highlight');
        }
        this.applyWaveform(this.waveforms.flutter, true);
        this.startDecayTimer();
        break;

      case 2:
        if (this.bpmVal) this.bpmVal.textContent = '95';
        if (this.stateVal) this.stateVal.textContent = 'Warming Up ✨';
        if (this.statusMsg) {
          this.statusMsg.textContent = `2/4: Waking up... it knows it's you, ${this.girl}! Keep going...`;
          this.statusMsg.classList.add('highlight');
        }
        this.applyWaveform(this.waveforms.warming, true);
        this.startDecayTimer();
        break;

      case 3:
        if (this.bpmVal) this.bpmVal.textContent = '122';
        if (this.stateVal) this.stateVal.textContent = 'Almost Healed 💕';
        if (this.statusMsg) {
          this.statusMsg.textContent = '3/4: Almost stable! One more press to fix his heart forever...';
          this.statusMsg.classList.add('highlight');
        }
        this.applyWaveform(this.waveforms.almost, true);
        this.startDecayTimer();
        break;

      default:
        // 4 or more: FULLY STABILIZED & HEALED!
        this.stabilizeHeart();
        break;
    }
  }

  startDecayTimer() {
    // If user stops tapping continuously for 8s before reaching 4, gently step back
    this.decayTimer = setTimeout(() => {
      if (!this.isStabilized && this.reviveCount > 0) {
        this.reviveCount = Math.max(0, this.reviveCount - 1);
        const percentage = Math.round((this.reviveCount / this.targetTaps) * 100);
        if (this.meterFill) this.meterFill.style.width = `${percentage}%`;
        if (this.counterText) this.counterText.textContent = `Tap ${this.reviveCount} / ${this.targetTaps} to revive his heart ♡`;

        if (this.reviveCount === 0) {
          if (this.bpmVal) this.bpmVal.textContent = '42';
          if (this.stateVal) this.stateVal.textContent = 'Quiet & Faint 💤';
          if (this.statusMsg) this.statusMsg.textContent = "Don't let go! Press the heart continuously to wake it... ♡";
          this.applyWaveform(this.waveforms.straight, false);
        } else if (this.reviveCount === 1) {
          if (this.bpmVal) this.bpmVal.textContent = '68';
          this.applyWaveform(this.waveforms.flutter, true);
        } else if (this.reviveCount === 2) {
          if (this.bpmVal) this.bpmVal.textContent = '95';
          this.applyWaveform(this.waveforms.warming, true);
        }
      }
    }, 8500);
  }

  stabilizeHeart() {
    this.isStabilized = true;
    if (this.decayTimer) {
      clearTimeout(this.decayTimer);
      this.decayTimer = null;
    }

    // Play sparkling celebration fanfare alongside heartbeat
    audio.playCelebrationFanfare();

    // 1. Full steady living cardiac rhythm
    this.applyWaveform(this.waveforms.stable, true);
    if (this.ecgPulsePath) {
      this.ecgPulsePath.classList.remove('straight');
      this.ecgPulsePath.classList.add('stable');
    }
    if (this.ecgScreen) {
      this.ecgScreen.classList.add('is-stabilized');
    }

    // 2. Monitor Header Update
    if (this.bpmVal) this.bpmVal.textContent = '142';
    if (this.stateVal) this.stateVal.textContent = 'Healed Forever 💖';
    if (this.statePill) this.statePill.classList.add('healed');
    if (this.statusMsg) {
      this.statusMsg.textContent = `Status: Steady, healthy & racing forever for ${this.girl}! 🥰💓`;
      this.statusMsg.classList.add('highlight', 'healed');
    }

    // 3. Mark heart button as permanently healed and radiant
    this.heartBtn.classList.add('heart-healed-radiant');

    // 4. Smoothly hide revive progress box and locked hint
    if (this.reviveBox) {
      this.reviveBox.style.opacity = '0';
      this.reviveBox.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (this.reviveBox) this.reviveBox.style.display = 'none';
      }, 400);
    }

    if (this.lockedHint) {
      this.lockedHint.style.opacity = '0';
      setTimeout(() => {
        if (this.lockedHint) this.lockedHint.style.display = 'none';
      }, 400);
    }

    // 5. Reveal the Thank-You Note Card & the "Ready for Question" button!
    setTimeout(() => {
      if (this.fixedCard) {
        this.fixedCard.style.display = 'block';
        void this.fixedCard.offsetWidth;
        this.fixedCard.classList.add('revealed');
      }

      if (this.readyQuestion) {
        this.readyQuestion.style.display = 'block';
        void this.readyQuestion.offsetWidth;
        this.readyQuestion.classList.add('revealed');
      }
    }, 450);
  }

  continueActiveBeating() {
    // When clicked after being stabilized, keep heart racing happily
    const randomBpm = 139 + Math.floor(Math.random() * 11); // 139 - 149
    if (this.bpmVal) this.bpmVal.textContent = `${randomBpm}`;

    if (this.statusMsg) {
      const phrases = [
        `Status: Beating strong and steady, completely fixed by ${this.girl}! 💖`,
        `Status: 142+ BPM! It will never stop racing for you, ${this.girl}! 🥰`,
        `Status: Thank you for bringing ${this.boy}'s heart to life ♡`,
        "Status: Every beat is happy, warm, and yours forever 🌸"
      ];
      this.statusMsg.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    }

    if (this.ecgPulsePath) {
      this.ecgPulsePath.classList.remove('pulse-burst');
      void this.ecgPulsePath.offsetWidth;
      this.ecgPulsePath.classList.add('pulse-burst');
    }
  }

  applyWaveform(pathD, isRunning) {
    if (this.ecgBasePath) {
      this.ecgBasePath.setAttribute('d', pathD);
    }
    if (this.ecgPulsePath) {
      this.ecgPulsePath.setAttribute('d', pathD);
      if (isRunning) {
        this.ecgPulsePath.classList.add('active');
      } else {
        this.ecgPulsePath.classList.remove('active');
      }
    }
  }

  emitShockwaves() {
    if (!this.shockwaveContainer) return;

    // Create 2 staggered expanding shockwaves
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        const ring = document.createElement('div');
        ring.className = 'heart-shockwave-ring';
        this.shockwaveContainer.appendChild(ring);

        setTimeout(() => ring.remove(), 1100);
      }, i * 220);
    }
  }

  spawnWhispers(event) {
    if (!this.whispersContainer) return;

    // Pick 2-3 romantic snippets
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...this.whisperList].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const text = shuffled[i % shuffled.length];
        const whisper = document.createElement('div');
        whisper.className = 'heart-whisper-pill';
        whisper.textContent = text;

        // Position slightly randomized around heart center
        const offsetX = (Math.random() - 0.5) * 120;
        const offsetY = (Math.random() - 0.5) * 40;
        const randomRot = (Math.random() - 0.5) * 22;

        whisper.style.setProperty('--offset-x', `${offsetX}px`);
        whisper.style.setProperty('--offset-y', `${offsetY}px`);
        whisper.style.setProperty('--rot', `${randomRot}deg`);

        this.whispersContainer.appendChild(whisper);

        setTimeout(() => whisper.remove(), 1600);
      }, i * 160);
    }
  }
}
