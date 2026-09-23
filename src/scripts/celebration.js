/**
 * Grand Finale Celebration Controller
 * Full-screen heart confetti burst, radiant calligraphy reveal for the beloved's name, and keepsake certificate
 */

import { audio } from './audio.js';
import { updateDomNames } from './names.js';

export class CelebrationController {
  constructor() {
    this.btnYes = document.querySelector('.btn-yes');
    this.overlay = document.querySelector('.celebration-overlay');
    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.saveBtn = document.querySelector('.btn-cert-save');
    this.closeBtn = document.querySelector('.btn-cert-close');
    this.certDate = document.querySelector('.cert-date');

    this.particles = [];
    this.ctx = null;
    this.cheerFrames = document.querySelectorAll('.cheer-frame');
    this.cheerTimer = null;

    this.init();
  }

  init() {
    if (!this.btnYes || !this.overlay) return;

    if (this.confettiCanvas) {
      this.ctx = this.confettiCanvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    // Set today's date on certificate
    if (this.certDate) {
      const today = new Date();
      this.certDate.textContent = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    this.btnYes.addEventListener('click', () => {
      this.launchCelebration();
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.overlay.classList.remove('active');
        this.animating = false;
        this.stopCheerCycle();
      });
    }

    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  resizeCanvas() {
    if (!this.confettiCanvas) return;
    this.confettiCanvas.width = window.innerWidth;
    this.confettiCanvas.height = window.innerHeight;
  }

  launchCelebration() {
    updateDomNames();
    this.overlay.classList.add('active');
    audio.playCelebrationFanfare();

    this.startCheerCycle();
    this.spawnConfetti();
    this.animating = true;
    requestAnimationFrame(() => this.confettiLoop());
  }

  startCheerCycle() {
    this.stopCheerCycle();
    if (!this.cheerFrames || this.cheerFrames.length === 0) {
      this.cheerFrames = document.querySelectorAll('.cheer-frame');
    }
    if (!this.cheerFrames || this.cheerFrames.length === 0) return;

    // Sequence through frames: 0 (jump fists up), 2 (double peace & wink), 1 (hands on heart)
    const sequence = [0, 2, 1, 0, 2];
    let step = 0;

    this.cheerTimer = setInterval(() => {
      step = (step + 1) % sequence.length;
      const targetFrame = sequence[step];

      this.cheerFrames.forEach((frame, idx) => {
        if (idx === targetFrame) {
          frame.classList.add('active');
        } else {
          frame.classList.remove('active');
        }
      });
    }, 450);
  }

  stopCheerCycle() {
    if (this.cheerTimer) {
      clearInterval(this.cheerTimer);
      this.cheerTimer = null;
    }
  }

  spawnConfetti() {
    this.particles = [];
    const colors = ['#d98282', '#e99a91', '#c95762', '#ffd98a', '#eab96f', '#fff3e4', '#ffffff'];
    const totalParticles = 140;

    for (let i = 0; i < totalParticles; i++) {
      this.particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.7) * 24,
        size: Math.random() * 14 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        gravity: 0.35,
        drag: 0.96,
        isHeart: Math.random() > 0.4,
        opacity: 1
      });
    }
  }

  confettiLoop() {
    if (!this.animating || !this.ctx) return;

    this.ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // Soft boundary bounce or fade
      if (p.y > window.innerHeight) {
        p.opacity -= 0.02;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.isHeart) {
        // Draw Heart Shape
        this.drawHeart(this.ctx, 0, 0, p.size);
      } else {
        // Draw Confetti Ribbon
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      this.ctx.restore();

      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.confettiLoop());
    } else {
      this.animating = false;
    }
  }

  drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.5, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.5, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }
}
