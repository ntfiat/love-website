/**
 * Interactive Kawaii Cat Mascot Controller
 * Precise Coordinate Rig: Mathematically anchored to the background artwork kitten
 * Realistic Cursor Eye Tracking: Smooth interpolated gaze following cursor within eye socket
 * Expressive Personality: Proximity blushing, organic blinking, speech bubble, and purring hearts
 */

import { audio } from './audio.js';
import { onNamesChange } from './names.js';

export class CatMascotController {
  constructor() {
    this.heroBg = document.querySelector('.hero-bg-layer');
    this.catZone = document.querySelector('.cat-mascot-zone');
    this.leftEye = document.getElementById('cat-eye-left');
    this.rightEye = document.getElementById('cat-eye-right');
    this.pupils = document.querySelectorAll('.cat-pupil');
    this.eyelids = document.querySelectorAll('.cat-eyelid');
    this.blushes = document.querySelectorAll('.cat-blush');
    this.speechBubble = document.querySelector('.cat-speech-bubble');

    // Layout metrics
    this.scale = 1;
    this.maxPupilTravel = 10;
    this.renderedW = 1672;
    this.renderedH = 941;
    this.imgLeft = 0;

    // Pupil tracking state
    this.pupilCurrentX = 0;
    this.pupilCurrentY = 0;
    this.pupilTargetX = 0;
    this.pupilTargetY = 0;

    // Screen center of kitten's eyes
    this.eyeScreenCenterX = window.innerWidth / 2;
    this.eyeScreenCenterY = window.innerHeight / 2;

    // State flags
    this.lastMouseMoveTime = Date.now();
    this.isBlinking = false;

    // Wholesome speech remarks
    this.quotes = [];

    onNamesChange(({ boy, girl }) => {
      this.updateNames(boy, girl);
    });

    this.init();
  }

  updateNames(boy, girl) {
    this.quotes = [
      `Can I write your name on my heart, ${girl}? 🐾`,
      `Purr... ${boy} & ${girl} forever! 🤍`,
      `Meow! ${girl}, you make ${boy}'s world warmer! ♡`,
      `${boy} is always thinking of you, ${girl}... ✨`,
      `You're ${boy}'s favorite person in the whole world! 🌸`,
      `My little heart beats for ${girl}! 💖`
    ];
  }

  init() {
    if (!this.heroBg || !this.catZone) return;

    // Initial positioning calculation
    this.updateLayout();

    // Listeners
    window.addEventListener('resize', () => this.updateLayout());
    window.addEventListener('load', () => this.updateLayout());

    // Cursor tracking
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.onMouseMove(e.touches[0]);
      }
    }, { passive: true });

    // Click anywhere on mascot zone
    this.catZone.addEventListener('click', (e) => this.onCatClick(e));

    // Animation frame render loop
    requestAnimationFrame(() => this.renderLoop());

    // Idle behavior intervals (natural blinking)
    setInterval(() => this.checkIdleStates(), 1000);
  }

  /**
   * Recalculate exact pixel positions for eyes, cheeks, and speech bubble
   * to align 100% with the background image (1672x941, cover, center-bottom)
   */
  updateLayout() {
    if (!this.heroBg || !this.leftEye || !this.rightEye) return;

    const layerW = this.heroBg.clientWidth;
    const layerH = this.heroBg.clientHeight;
    if (!layerW || !layerH) return;

    const layerRatio = layerW / layerH;
    const imgRatio = 1672 / 941;

    if (layerRatio > imgRatio) {
      // Container is wider: image spans full width, cropped top
      this.renderedW = layerW;
      this.renderedH = layerW / imgRatio;
      this.scale = layerW / 1672;
      this.imgLeft = 0;
    } else {
      // Container is taller: image spans full height, cropped sides
      this.renderedH = layerH;
      this.renderedW = layerH * imgRatio;
      this.scale = layerH / 941;
      this.imgLeft = (layerW - this.renderedW) / 2;
    }

    // In 1672x941 master artwork coordinates:
    // Left eye center: (760, 361) -> distance from bottom: 941 - 361 = 580px
    // Right eye center: (920, 361) -> distance from bottom: 941 - 361 = 580px
    // Exact eye socket dimensions matching the cat's natural eye contours:
    // Width: 88px, Height: 84px
    const eyeWidth = 88 * this.scale;
    const eyeHeight = 84 * this.scale;
    const leftEyeCenterX = this.imgLeft + 760 * this.scale;
    const rightEyeCenterX = this.imgLeft + 920 * this.scale;
    const eyeCenterYFromBottom = 580 * this.scale;

    // Pupil max travel strictly clamped so it stays inside the eye socket at all times
    this.maxPupilTravel = 8.5 * this.scale;

    // Position Left Eye
    this.leftEye.style.width = `${eyeWidth}px`;
    this.leftEye.style.height = `${eyeHeight}px`;
    this.leftEye.style.left = `${leftEyeCenterX}px`;
    this.leftEye.style.bottom = `${eyeCenterYFromBottom}px`;
    this.leftEye.style.transform = 'translate(-50%, 50%)';

    // Position Right Eye
    this.rightEye.style.width = `${eyeWidth}px`;
    this.rightEye.style.height = `${eyeHeight}px`;
    this.rightEye.style.left = `${rightEyeCenterX}px`;
    this.rightEye.style.bottom = `${eyeCenterYFromBottom}px`;
    this.rightEye.style.transform = 'translate(-50%, 50%)';

    // Position Blushing Cheeks
    const blushW = 75 * this.scale;
    const blushH = 45 * this.scale;
    const blushBottom = 510 * this.scale;
    const leftBlushX = this.imgLeft + 705 * this.scale;
    const rightBlushX = this.imgLeft + 975 * this.scale;

    const leftBlush = document.querySelector('.cat-blush.left');
    const rightBlush = document.querySelector('.cat-blush.right');
    if (leftBlush) {
      leftBlush.style.width = `${blushW}px`;
      leftBlush.style.height = `${blushH}px`;
      leftBlush.style.left = `${leftBlushX}px`;
      leftBlush.style.bottom = `${blushBottom}px`;
      leftBlush.style.transform = 'translate(-50%, 50%)';
    }
    if (rightBlush) {
      rightBlush.style.width = `${blushW}px`;
      rightBlush.style.height = `${blushH}px`;
      rightBlush.style.left = `${rightBlushX}px`;
      rightBlush.style.bottom = `${blushBottom}px`;
      rightBlush.style.transform = 'translate(-50%, 50%)';
    }

    // Position Speech Bubble above kitten head
    if (this.speechBubble) {
      const bubbleX = this.imgLeft + 950 * this.scale;
      const bubbleBottom = 720 * this.scale;
      this.speechBubble.style.left = `${bubbleX}px`;
      this.speechBubble.style.bottom = `${bubbleBottom}px`;
    }

    // Refresh screen center of eyes for angle calculation
    this.updateScreenCenters();
  }

  updateScreenCenters() {
    if (!this.leftEye || !this.rightEye) return;
    const leftRect = this.leftEye.getBoundingClientRect();
    const rightRect = this.rightEye.getBoundingClientRect();
    this.eyeScreenCenterX = (leftRect.left + rightRect.right) / 2;
    this.eyeScreenCenterY = (leftRect.top + rightRect.top) / 2 + leftRect.height / 2;
  }

  onMouseMove(e) {
    this.lastMouseMoveTime = Date.now();
    this.updateScreenCenters();

    const dx = e.clientX - this.eyeScreenCenterX;
    const dy = e.clientY - this.eyeScreenCenterY;
    const distance = Math.hypot(dx, dy);

    // Blushing when cursor is near the kitten (< 220px)
    const isClose = distance < (220 * this.scale);
    this.blushes.forEach(blush => {
      if (isClose) blush.classList.add('active');
      else blush.classList.remove('active');
    });

    // Pupil cursor gaze tracking:
    // Angle pointing from eye center toward cursor
    const angle = Math.atan2(dy, dx);

    // Progressive travel: gentle gaze for near movements, capped at maxPupilTravel
    const travel = Math.min(this.maxPupilTravel, Math.pow(distance / (350 * this.scale), 0.75) * this.maxPupilTravel);

    this.pupilTargetX = Math.cos(angle) * travel;
    this.pupilTargetY = Math.sin(angle) * travel;
  }

  renderLoop() {
    // Smooth easing interpolation (Lerp 0.12)
    this.pupilCurrentX += (this.pupilTargetX - this.pupilCurrentX) * 0.12;
    this.pupilCurrentY += (this.pupilTargetY - this.pupilCurrentY) * 0.12;

    const px = this.pupilCurrentX.toFixed(2);
    const py = this.pupilCurrentY.toFixed(2);

    this.pupils.forEach(pupil => {
      pupil.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
    });

    requestAnimationFrame(() => this.renderLoop());
  }

  checkIdleStates() {
    const idleSeconds = (Date.now() - this.lastMouseMoveTime) / 1000;

    // Natural blinking every ~4 seconds of stillness
    if (idleSeconds >= 3.8 && idleSeconds < 4.8 && !this.isBlinking) {
      this.triggerBlink();
    }

    // Occasional gentle glance down toward the sign
    if (idleSeconds >= 8 && idleSeconds < 9) {
      this.pupilTargetX = 0;
      this.pupilTargetY = this.maxPupilTravel * 0.65;
      setTimeout(() => {
        if ((Date.now() - this.lastMouseMoveTime) / 1000 >= 9) {
          this.pupilTargetX = 0;
          this.pupilTargetY = 0;
        }
      }, 1600);
    }
  }

  triggerBlink() {
    this.isBlinking = true;
    this.eyelids.forEach(lid => lid.classList.add('blinking'));
    setTimeout(() => {
      this.eyelids.forEach(lid => lid.classList.remove('blinking'));
      this.isBlinking = false;
    }, 180);
  }

  onCatClick(e) {
    audio.playCatSound();

    // Show cheerful speech bubble
    if (this.speechBubble) {
      const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
      this.speechBubble.textContent = randomQuote;
      this.speechBubble.classList.add('visible');
      setTimeout(() => {
        this.speechBubble.classList.remove('visible');
      }, 2600);
    }

    // Spawn floating mini hearts from cat
    const heartOriginX = e.clientX;
    const heartOriginY = e.clientY;
    for (let i = 0; i < 6; i++) {
      this.createFloatingHeart(
        heartOriginX + (Math.random() * 60 - 30),
        heartOriginY + (Math.random() * 40 - 20)
      );
    }

    // Quick happy blink
    this.triggerBlink();
  }

  createFloatingHeart(x, y) {
    const heart = document.createElement('div');
    heart.textContent = '♡';
    heart.style.position = 'fixed';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.color = '#e99a91';
    heart.style.fontSize = `${18 + Math.random() * 14}px`;
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
    heart.style.transform = 'translate(-50%, -50%) scale(0.5)';
    heart.style.opacity = '1';

    document.body.appendChild(heart);

    const destX = (Math.random() - 0.5) * 100;
    const destY = -80 - Math.random() * 60;

    requestAnimationFrame(() => {
      heart.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.2)`;
      heart.style.opacity = '0';
    });

    setTimeout(() => {
      heart.remove();
    }, 1300);
  }
}
