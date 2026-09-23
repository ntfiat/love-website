/**
 * Main Application Orchestrator
 * Cozy Moonlit Bedroom Love Story Experience
 */

import { audio } from './audio.js';
import { CatMascotController } from './cat.js';
import { BookshelfController } from './books.js';
import { LetterController } from './letter.js';
import { NightSceneController } from './night.js';
import { EscapingNoController } from './escapingNo.js';
import { CelebrationController } from './celebration.js';
import { HeartbeatController } from './heartbeat.js';
import { initNames } from './names.js';

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Dynamic Names from URL (shows 404 if no valid token)
  const isValid = initNames();
  if (!isValid) return;

  // 1. Initialize Interactive Modules
  const catController = new CatMascotController();
  const bookshelfController = new BookshelfController();
  const letterController = new LetterController();
  const nightController = new NightSceneController();
  const escapingNoController = new EscapingNoController();
  const celebrationController = new CelebrationController();
  const heartbeatController = new HeartbeatController();

  // 2. Subtle Custom Cursor Heart Trail (Item #9 in specification)
  initCursorHeartTrail();

  // 3. Floating Lofi Audio Controller
  initLofiPlayer();

  // 4. Parallax Background Layers in Hero
  initHeroParallax();

  // 5. Scroll Story Navigation Tracking
  initStoryNavTracking();
});

/**
 * Subtle cursor trail: occasional small heart/sparkle fading quickly
 */
function initCursorHeartTrail() {
  let lastSpawnTime = 0;
  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    // Throttle to every ~120ms so it feels delicate and not cluttered
    if (now - lastSpawnTime > 120) {
      lastSpawnTime = now;
      spawnCursorHeart(e.clientX, e.clientY);
    }
  });
}

function spawnCursorHeart(x, y) {
  const heart = document.createElement('div');
  heart.textContent = Math.random() > 0.3 ? '♡' : '✧';
  heart.style.position = 'fixed';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.color = Math.random() > 0.5 ? '#d98282' : '#ffd98a';
  heart.style.fontSize = `${10 + Math.random() * 8}px`;
  heart.style.pointerEvents = 'none';
  heart.style.zIndex = '99999';
  heart.style.opacity = '0.75';
  heart.style.transform = 'translate(-50%, -50%) scale(0.8)';
  heart.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.4, 1)';

  document.body.appendChild(heart);

  const driftX = (Math.random() - 0.5) * 20;
  const driftY = -15 - Math.random() * 20;

  requestAnimationFrame(() => {
    heart.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1.1)`;
    heart.style.opacity = '0';
  });

  setTimeout(() => heart.remove(), 850);
}

/**
 * Floating Lofi Audio Player UI
 */
function initLofiPlayer() {
  const lofiPlayer = document.querySelector('.lofi-player');
  const lofiBtn = document.querySelector('.lofi-btn');

  if (!lofiPlayer || !lofiBtn) return;

  lofiPlayer.addEventListener('click', () => {
    const isPlaying = audio.toggleMusic();
    if (isPlaying) {
      lofiPlayer.classList.add('is-playing');
      lofiBtn.classList.add('playing');
    } else {
      lofiPlayer.classList.remove('is-playing');
      lofiBtn.classList.remove('playing');
    }
  });
}

/**
 * Multi-layer Parallax Depth for the Hero Room
 */
function initHeroParallax() {
  const heroScene = document.querySelector('.hero-section');
  const heroBg = document.querySelector('.hero-bg-layer');
  const fairyLights = document.querySelector('.fairy-lights-container');
  const ivyLeft = document.querySelector('.ivy-overlay-left');
  const ivyRight = document.querySelector('.ivy-overlay-right');

  if (!heroScene || !heroBg) return;

  heroScene.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;

    // Background barely moves
    heroBg.style.transform = `translate3d(${x * 12}px, ${y * 12}px, 0)`;

    // Fairy lights move slightly
    if (fairyLights) {
      fairyLights.style.transform = `translate3d(${x * 24}px, ${y * 20}px, 0)`;
    }

    // Vines move slightly with parallax
    if (ivyLeft) ivyLeft.style.transform = `translate3d(${x * 30}px, ${y * 25}px, 0)`;
    if (ivyRight) ivyRight.style.transform = `translate3d(${x * -30}px, ${y * 25}px, 0)`;
  });
}

/**
 * Story Nav Bookmark Active Link Synchronizer
 */
function initStoryNavTracking() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.story-nav-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => observer.observe(sec));
}

// Visual feedback toolbar for AI agents in development mode
if (import.meta.env.DEV) {
  initAgentation();
}

async function initAgentation() {
  try {
    const [{ createElement }, { createRoot }, { Agentation }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('agentation'),
    ]);
    const container = document.createElement('div');
    container.id = 'agentation-root';
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(createElement(Agentation, { endpoint: 'http://localhost:4747' }));
  } catch (err) {
    console.warn('[Agentation] Dev toolbar initialization failed:', err);
  }
}


