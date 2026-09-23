/**
 * Candlelit Desk 3D Letter Opening Controller
 * Full tactile motion: Dialog entrance, breaking wax seal with particles, 3D envelope flap opening,
 * letter slide-out, trifold parchment expansion, and handwritten note reveal.
 */

import { audio } from './audio.js';

export class LetterController {
  constructor() {
    this.deskEnvelope = document.querySelector('.wax-envelope');
    this.modal = document.getElementById('letter-dialog-modal');
    this.closeBtn = document.getElementById('letter-modal-close');
    this.keepBtn = document.getElementById('btn-keep-letter');
    this.replayBtn = document.getElementById('btn-replay-letter');
    this.modalWaxSeal = document.getElementById('modal-wax-seal');
    this.stage = document.getElementById('letter-stage');

    this.isAnimating = false;
    this.isOpen = false;
    this.animTimeouts = [];

    this.init();
  }

  init() {
    if (!this.deskEnvelope || !this.modal) return;

    // Click desk envelope -> open modal & start letter sequence
    this.deskEnvelope.addEventListener('click', () => {
      this.openLetterDialog();
    });

    // Close buttons
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeLetterDialog());
    }
    if (this.keepBtn) {
      this.keepBtn.addEventListener('click', () => this.closeLetterDialog());
    }

    // Modal background click to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || e.target.classList.contains('letter-modal-overlay-bg')) {
        this.closeLetterDialog();
      }
    });

    // ESC key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeLetterDialog();
      }
    });

    // Wax seal manual click or replay
    if (this.modalWaxSeal) {
      this.modalWaxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startLetterMotion();
      });
    }

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.replayMotion();
      });
    }
  }

  openLetterDialog() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    audio.playStarChime(783.99); // G5 warm chime

    // Reset stages
    this.resetMotionClasses();

    // Automatically trigger letter opening after 500ms
    const t = setTimeout(() => {
      this.startLetterMotion();
    }, 600);
    this.animTimeouts.push(t);
  }

  startLetterMotion() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // STEP 1: Break Wax Seal
    audio.playSealBreakSound();
    this.spawnWaxSparkles();
    this.stage.classList.add('seal-broken');

    // STEP 2: Flap 3D Flips Open (after 450ms)
    const t1 = setTimeout(() => {
      audio.playBookOpenSound();
      this.stage.classList.add('flap-opened');
    }, 450);
    this.animTimeouts.push(t1);

    // STEP 3: Letter Slides Out of Pocket (after 1100ms)
    const t2 = setTimeout(() => {
      audio.playBookOpenSound();
      this.stage.classList.add('letter-out');
    }, 1100);
    this.animTimeouts.push(t2);

    // STEP 4: Full 3D Unfolding into Parchment (after 1900ms)
    const t3 = setTimeout(() => {
      audio.playBookOpenSound();
      this.stage.classList.add('letter-unfolded');
      this.isAnimating = false;
      this.isOpen = true;
    }, 1900);
    this.animTimeouts.push(t3);
  }

  replayMotion() {
    this.resetMotionClasses();
    setTimeout(() => {
      this.startLetterMotion();
    }, 400);
  }

  resetMotionClasses() {
    this.animTimeouts.forEach(t => clearTimeout(t));
    this.animTimeouts = [];
    this.isAnimating = false;
    this.isOpen = false;

    if (this.stage) {
      this.stage.classList.remove('seal-broken', 'flap-opened', 'letter-out', 'letter-unfolded');
    }
  }

  closeLetterDialog() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.resetMotionClasses();
  }

  spawnWaxSparkles() {
    if (!this.modalWaxSeal) return;
    const rect = this.modalWaxSeal.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 14; i++) {
      const sparkle = document.createElement('div');
      sparkle.textContent = Math.random() > 0.4 ? '✦' : '✧';
      sparkle.style.position = 'fixed';
      sparkle.style.left = `${centerX}px`;
      sparkle.style.top = `${centerY}px`;
      sparkle.style.color = Math.random() > 0.5 ? '#ffd98a' : '#ff9aa2';
      sparkle.style.fontSize = `${14 + Math.random() * 12}px`;
      sparkle.style.pointerEvents = 'none';
      sparkle.style.zIndex = '9999';
      sparkle.style.transform = 'translate(-50%, -50%) scale(0.5)';
      sparkle.style.transition = 'all 0.9s cubic-bezier(0.2, 0.8, 0.4, 1)';
      sparkle.style.opacity = '1';

      document.body.appendChild(sparkle);

      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 60;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist;

      requestAnimationFrame(() => {
        sparkle.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.3)`;
        sparkle.style.opacity = '0';
      });

      setTimeout(() => sparkle.remove(), 950);
    }
  }
}
