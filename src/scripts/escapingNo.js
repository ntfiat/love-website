/**
 * The Legendary Escaping NO Button
 * Dodges the cursor playfully, displays sassy cat quips, and makes the YES button grow magnetic!
 */

import { audio } from './audio.js';
import { onNamesChange } from './names.js';

export class EscapingNoController {
  constructor() {
    this.btnNo = document.querySelector('.btn-no');
    this.btnYes = document.querySelector('.btn-yes');
    this.arena = document.querySelector('.buttons-arena');
    this.toast = document.querySelector('.no-quip-toast');

    this.escapeCount = 0;
    this.yesScale = 1.0;
    this.quips = [];

    onNamesChange(({ boy, girl }) => {
      this.updateNames(boy, girl);
    });

    this.init();
  }

  updateNames(boy, girl) {
    this.quips = [
      `Oops! Too fast for you, ${girl}! 🐾`,
      `${boy}'s heart only accepts YES! 💕`,
      `Wait... did your finger slip, ${girl}? 🙀`,
      `Error 404: 'NO' not found in ${boy}'s heart! ✨`,
      `Look at how shiny ${boy}'s YES button is! 👉`,
      `Nice try, ${girl}, but my heart is yours forever! 🌸`,
      `Nu-uh! ${boy} is waiting for your YES! 💖`,
      `Come on ${girl}, you know you want to press YES! ♡`
    ];
  }

  init() {
    if (!this.btnNo || !this.arena) return;

    // Mouse proximity evasion
    window.addEventListener('mousemove', (e) => {
      const rect = this.btnNo.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
      if (dist < 55) {
        this.dodge();
      }
    });

    // Hover or touch evasion
    this.btnNo.addEventListener('mouseenter', () => this.dodge());
    this.btnNo.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.dodge();
    }, { passive: false });
    this.btnNo.addEventListener('click', (e) => {
      e.preventDefault();
      this.dodge();
    });
  }

  dodge() {
    audio.playCatSound();
    this.escapeCount++;

    // Reset transform to measure base untransformed position accurately
    this.btnNo.style.transform = 'none';
    const baseBtnRect = this.btnNo.getBoundingClientRect();
    const arenaRect = this.arena.getBoundingClientRect();

    // Calculate strict containment bounds within the arena (with 8px padding)
    const minX = (arenaRect.left + 8) - baseBtnRect.left;
    const maxX = (arenaRect.right - 8) - baseBtnRect.right;
    const minY = Math.max(-40, (arenaRect.top + 8) - baseBtnRect.top);
    const maxY = Math.min(40, (arenaRect.bottom - 8) - baseBtnRect.bottom);

    const randomX = minX < maxX ? minX + Math.random() * (maxX - minX) : (Math.random() - 0.5) * 30;
    const randomY = minY < maxY ? minY + Math.random() * (maxY - minY) : (Math.random() - 0.5) * 20;

    this.btnNo.style.position = 'relative';
    this.btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;

    // Make YES button grow bigger and glow more warmly!
    this.yesScale = Math.min(1.45, this.yesScale + 0.05);
    if (this.btnYes) {
      this.btnYes.style.transform = `scale(${this.yesScale})`;
      this.btnYes.style.boxShadow = `0 12px 35px rgba(201, 87, 98, ${0.4 + this.escapeCount * 0.05})`;
    }

    // Boy reacts with hopeful heartbeat
    const boyImg = document.querySelector('.question-boy-img');
    const heartGlow = document.querySelector('.question-heart-glow');
    if (boyImg) {
      boyImg.style.transform = 'scale(1.1) translateY(-6px)';
      setTimeout(() => {
        boyImg.style.transform = '';
      }, 400);
    }
    if (heartGlow) {
      heartGlow.style.transform = 'translate(-50%, -50%) scale(1.5)';
      setTimeout(() => {
        heartGlow.style.transform = '';
      }, 400);
    }

    // Show witty quip toast
    if (this.toast) {
      const quip = this.quips[(this.escapeCount - 1) % this.quips.length];
      this.toast.textContent = quip;
      this.toast.classList.add('show');
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toast.classList.remove('show');
      }, 2200);
    }
  }
}
