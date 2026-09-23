/**
 * Night Scene & Interactive Constellation Canvas Controller
 * Renders twinkling stars, interactive constellation line connections, shooting stars, and melodic star chimes
 */

import { audio } from './audio.js';
import { onNamesChange } from './names.js';

export class NightSceneController {
  constructor() {
    this.canvas = document.getElementById('night-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.mouse = { x: -1000, y: -1000 };
    this.constellationPoints = [];

    this.whisperQuotes = [];

    onNamesChange(({ boy, girl }) => {
      this.updateNames(boy, girl);
    });

    this.init();
  }

  updateNames(boy, girl) {
    this.whisperQuotes = [
      `Every star holds a reason why ${boy} loves you, ${girl} ✨`,
      `Under the same moon, thinking of ${girl} 🌙`,
      `${girl} is ${boy}'s sweetest wish upon the sky ⭐`,
      `Distance means nothing when ${girl} means everything to ${boy} 💫`,
      `You light up my whole world, ${girl} — ${boy} 🤍`
    ];
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate stars
    const starCount = Math.floor((window.innerWidth * window.innerHeight) / 7000);
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: 1
      });
    }

    // Interactive mouse tracking on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    this.canvas.addEventListener('click', (e) => {
      audio.playStarChime();
      this.triggerShootingStar();
      this.showStarWhisper(e.clientX, e.clientY);
    });

    // Periodic shooting star
    setInterval(() => {
      if (Math.random() > 0.4) {
        this.triggerShootingStar();
      }
    }, 4500);

    // Initialize interactive affectionate couple
    this.initCoupleInteraction();

    requestAnimationFrame(() => this.loop());
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
  }

  triggerShootingStar() {
    this.shootingStars.push({
      x: Math.random() * this.canvas.width * 0.8,
      y: Math.random() * this.canvas.height * 0.4,
      length: Math.random() * 80 + 50,
      speed: Math.random() * 8 + 6,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
      opacity: 1
    });
  }

  showStarWhisper(x, y) {
    const whisper = document.createElement('div');
    const quote = this.whisperQuotes[Math.floor(Math.random() * this.whisperQuotes.length)];
    whisper.textContent = quote;
    whisper.style.position = 'fixed';
    whisper.style.left = `${x}px`;
    whisper.style.top = `${y}px`;
    whisper.style.color = '#ffd98a';
    whisper.style.fontFamily = "'Caveat', cursive";
    whisper.style.fontSize = '1.35rem';
    whisper.style.fontWeight = '700';
    whisper.style.pointerEvents = 'none';
    whisper.style.zIndex = '9999';
    whisper.style.textShadow = '0 0 10px rgba(255, 217, 138, 0.8)';
    whisper.style.transform = 'translate(-50%, -50%)';
    whisper.style.transition = 'all 1.5s ease-out';
    whisper.style.opacity = '1';

    document.body.appendChild(whisper);

    requestAnimationFrame(() => {
      whisper.style.transform = 'translate(-50%, -100px)';
      whisper.style.opacity = '0';
    });

    setTimeout(() => whisper.remove(), 1600);
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw and twinkle stars
    this.stars.forEach(star => {
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha > 0.95) {
        star.alpha = 0.95;
        star.twinkleDir = -1;
      } else if (star.alpha < 0.2) {
        star.alpha = 0.2;
        star.twinkleDir = 1;
      }

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 235, 180, ${star.alpha})`;
      this.ctx.shadowColor = '#ffd98a';
      this.ctx.shadowBlur = 6;
      this.ctx.fill();

      // Constellation line to mouse if close
      const dist = Math.hypot(star.x - this.mouse.x, star.y - this.mouse.y);
      if (dist < 110) {
        this.ctx.beginPath();
        this.ctx.moveTo(star.x, star.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.strokeStyle = `rgba(255, 217, 138, ${(1 - dist / 110) * 0.45})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    });

    // Draw and animate shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= 0.015;

      if (ss.opacity <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const grad = this.ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(255, 217, 138, 0)');
      grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(ss.x, ss.y);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    requestAnimationFrame(() => this.loop());
  }

  initCoupleInteraction() {
    const couple = document.getElementById('affectionate-couple');
    if (!couple) return;

    let hasPlayedSoundOnThisHover = false;

    couple.addEventListener('mouseenter', () => {
      if (!hasPlayedSoundOnThisHover) {
        audio.playStarChime(987.77);
        hasPlayedSoundOnThisHover = true;
      }
      this.spawnCoupleHearts(couple);
    });

    couple.addEventListener('mouseleave', () => {
      hasPlayedSoundOnThisHover = false;
      couple.classList.remove('is-hovered');
    });

    // Touch and click support for mobile and desktop
    couple.addEventListener('click', () => {
      couple.classList.toggle('is-hovered');
      audio.playStarChime(1174.66);
      this.spawnCoupleHearts(couple);
    });
  }

  spawnCoupleHearts(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('div');
      heart.textContent = Math.random() > 0.4 ? '♡' : '🌸';
      heart.style.position = 'fixed';
      heart.style.left = `${rect.left + rect.width / 2 + (Math.random() * 80 - 40)}px`;
      heart.style.top = `${rect.top + rect.height * 0.4}px`;
      heart.style.color = Math.random() > 0.5 ? '#ff9aa2' : '#ffd98a';
      heart.style.fontSize = `${16 + Math.random() * 12}px`;
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '9999';
      heart.style.transform = 'translate(-50%, -50%) scale(0.6)';
      heart.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
      heart.style.opacity = '1';

      document.body.appendChild(heart);

      const destX = (Math.random() - 0.5) * 60;
      const destY = -60 - Math.random() * 50;

      requestAnimationFrame(() => {
        heart.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.2)`;
        heart.style.opacity = '0';
      });

      setTimeout(() => heart.remove(), 1300);
    }
  }
}
