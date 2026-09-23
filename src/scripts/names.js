/**
 * Dynamic Names Orchestrator
 * Parses, manages, and synchronizes partner names across the entire storybook experience.
 * Supports encrypted system URLs (/server/<token>), query params, hashes, and plain fallbacks.
 */

import { encryptNames, decryptNames } from './crypto.js';

export const DEFAULT_BOY = 'Siddharth';
export const DEFAULT_GIRL = 'Khushi';

let currentNames = {
  boy: DEFAULT_BOY,
  girl: DEFAULT_GIRL
};

const subscribers = [];

/**
 * Format string into Title Case (e.g. "siddharth" -> "Siddharth")
 */
export function formatName(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parse names from current window location (or given URL string)
 * Requires a valid encrypted system token; returns valid: false for root "/" or missing/invalid tokens.
 */
export function parseNamesFromUrl(urlStr) {
  try {
    const defaultUrl = typeof window !== 'undefined' && window.location ? window.location.href : 'http://localhost/';
    const defaultOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';
    const targetUrl = urlStr || defaultUrl;
    const url = new URL(targetUrl, defaultOrigin);
    const searchParams = url.searchParams;
    const pathname = decodeURIComponent(url.pathname);
    const hash = decodeURIComponent(url.hash);

    // 1. Check for encrypted token in Search Params (?token=..., ?session=..., ?s=...)
    const tokenParam = searchParams.get('token') || searchParams.get('session') || searchParams.get('s') || searchParams.get('id');
    if (tokenParam) {
      const decrypted = decryptNames(tokenParam);
      if (decrypted) {
        return {
          valid: true,
          boy: formatName(decrypted.boy) || DEFAULT_BOY,
          girl: formatName(decrypted.girl) || DEFAULT_GIRL
        };
      }
    }

    // 2. Check for encrypted token in Hash (#/server/<token> or #server/<token> or #<token>)
    if (hash) {
      const cleanHash = hash.replace(/^#\/?/, '');
      const hashParts = cleanHash.split('/').filter(Boolean);
      
      if (hashParts[0] === 'server' && hashParts[1]) {
        const decrypted = decryptNames(hashParts[1]);
        if (decrypted) {
          return {
            valid: true,
            boy: formatName(decrypted.boy) || DEFAULT_BOY,
            girl: formatName(decrypted.girl) || DEFAULT_GIRL
          };
        }
      } else if (cleanHash.startsWith('sv_') || cleanHash.startsWith('sys_')) {
        const decrypted = decryptNames(cleanHash);
        if (decrypted) {
          return {
            valid: true,
            boy: formatName(decrypted.boy) || DEFAULT_BOY,
            girl: formatName(decrypted.girl) || DEFAULT_GIRL
          };
        }
      }
    }

    // 3. Check for encrypted token in Pathname (/server/<token>)
    const pathSegments = pathname.split('/').filter(Boolean);
    const serverIdx = pathSegments.findIndex(seg => seg.toLowerCase() === 'server');
    if (serverIdx !== -1 && pathSegments[serverIdx + 1]) {
      const token = pathSegments[serverIdx + 1];
      const decrypted = decryptNames(token);
      if (decrypted) {
        return {
          valid: true,
          boy: formatName(decrypted.boy) || DEFAULT_BOY,
          girl: formatName(decrypted.girl) || DEFAULT_GIRL
        };
      }
    }
  } catch (err) {
    console.warn('Error parsing names from URL:', err);
  }

  // If no valid encrypted token is found (or on root "/"), mark as invalid
  return {
    valid: false,
    boy: DEFAULT_BOY,
    girl: DEFAULT_GIRL
  };
}

/**
 * Helper to split joint couple string ("Alex+Sam", "Alex-and-Sam", "Alex & Sam", etc.)
 */
function splitCoupleString(raw) {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw).trim();
  const delimiters = ['+', ' and ', '-and-', '&', '_', ','];
  for (const delim of delimiters) {
    if (decoded.includes(delim)) {
      const parts = decoded.split(delim).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        return {
          boy: formatName(parts[0]),
          girl: formatName(parts[1])
        };
      }
    }
  }
  return null;
}

/**
 * Get current active names
 */
export function getNames() {
  return { ...currentNames };
}

/**
 * Set active names and optionally update DOM & URL
 */
export function setNames(boy, girl, options = { updateUrl: false, mode: 'path' }) {
  currentNames = {
    boy: formatName(boy) || DEFAULT_BOY,
    girl: formatName(girl) || DEFAULT_GIRL
  };

  updateDomNames();
  notifySubscribers();

  if (options.updateUrl) {
    try {
      const token = encryptNames(currentNames.boy, currentNames.girl);
      let newUrl = window.location.pathname;
      if (options.mode === 'hash') {
        newUrl = `${window.location.pathname}#/server/${token}`;
      } else if (options.mode === 'query') {
        newUrl = `${window.location.pathname}?session=${token}`;
      } else {
        newUrl = `/server/${token}`;
      }
      window.history.replaceState({}, '', newUrl);
    } catch (e) {
      console.warn('Could not update history state:', e);
    }
  }
}

/**
 * Subscribe to name changes (fires immediately with current values)
 */
export function onNamesChange(callback) {
  if (typeof callback === 'function') {
    subscribers.push(callback);
    callback(getNames());
  }
}

function notifySubscribers() {
  const names = getNames();
  subscribers.forEach(cb => {
    try {
      cb(names);
    } catch (e) {
      console.error('Error notifying subscriber:', e);
    }
  });
}

/**
 * Generate a shareable encrypted system URL for given names
 */
export function generateEncryptedUrl(boy, girl, format = 'path', origin) {
  const token = encryptNames(boy, girl);
  const resolvedOrigin = origin || (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost');
  const base = resolvedOrigin.replace(/\/+$/, '');
  if (format === 'query') {
    return `${base}/server?session=${token}`;
  } else if (format === 'hash') {
    return `${base}/#/server/${token}`;
  }
  return `${base}/server/${token}`;
}

/**
 * Comprehensive DOM updater for all text and attributes containing partner names
 */
export function updateDomNames() {
  const { boy, girl } = currentNames;
  const girlUpper = girl.toUpperCase();

  // 1. Chapter 1: Bookshelf Subtitle
  const shelfSubtitle = document.querySelector('#before-i-ask .chapter-subtitle');
  if (shelfSubtitle) {
    shelfSubtitle.textContent = `${boy}'s little library of reasons why ${girl} is so special. Click any book to read inside 📖`;
  }

  // 2. Chapter 2: Candlelit Desk Envelope
  const waxTriggerNote = document.querySelector('.wax-envelope div[style*="font-family: var(--font-handwriting)"]');
  if (waxTriggerNote) {
    waxTriggerNote.textContent = `For ${girl}, from ${boy} ♡`;
  }

  // 3. Chapter 2 Modal: Letter Dialog
  const letterModal = document.getElementById('letter-dialog-modal');
  if (letterModal) {
    letterModal.setAttribute('aria-label', `A Letter for ${girl} from ${boy}`);
  }

  const letterStampSeal = document.querySelector('.letter-stamp-seal');
  if (letterStampSeal) {
    letterStampSeal.textContent = `💌 For ${girl}, from ${boy}`;
  }

  const letterSalutation = document.querySelector('.letter-salutation');
  if (letterSalutation) {
    letterSalutation.textContent = `Dearest ${girl},`;
  }

  const letterSignoffAuthor = document.querySelector('.signoff-author');
  if (letterSignoffAuthor) {
    letterSignoffAuthor.textContent = boy;
  }

  // 4. Chapter 3: Moonlit Scene Couple
  const coupleWrapper = document.getElementById('affectionate-couple');
  if (coupleWrapper) {
    coupleWrapper.setAttribute('title', `${boy} & ${girl} ♡`);
  }

  const boyCaption = document.querySelector('.couple-character.boy .character-caption');
  if (boyCaption) boyCaption.textContent = `${boy} ♡`;

  const boyIdleImg = document.querySelector('.couple-character.boy .idle-img');
  if (boyIdleImg) boyIdleImg.setAttribute('alt', boy);

  const boyHoverImg = document.querySelector('.couple-character.boy .hover-img');
  if (boyHoverImg) boyHoverImg.setAttribute('alt', `${boy} Offering Flower`);

  const girlCaption = document.querySelector('.couple-character.girl .character-caption');
  if (girlCaption) girlCaption.textContent = `${girl} ♡`;

  const girlIdleImg = document.querySelector('.couple-character.girl .idle-img');
  if (girlIdleImg) girlIdleImg.setAttribute('alt', girl);

  const girlHoverImg = document.querySelector('.couple-character.girl .hover-img');
  if (girlHoverImg) girlHoverImg.setAttribute('alt', `${girl} Cherished`);

  const dialogueQuote = document.querySelector('.dialogue-quote');
  if (dialogueQuote) {
    dialogueQuote.textContent = `“Under the same sky, holding you in my heart forever.” — ${boy}`;
  }

  // 5. Chapter 4: Heartbeat Sanctuary
  const heartSubtitle = document.querySelector('#the-heart .chapter-subtitle');
  if (heartSubtitle) {
    heartSubtitle.textContent = `Place your hand right here... this is what happens inside ${boy}'s chest whenever you are near.`;
  }

  const heartBtn = document.querySelector('.cute-plump-heart-btn');
  if (heartBtn) {
    heartBtn.setAttribute('title', `Click to hear ${boy}'s heartbeat for ${girl} ♡`);
    heartBtn.setAttribute('aria-label', `${boy}'s Beating Heart for ${girl}`);
  }

  const ribbonText = document.querySelector('.ribbon-text');
  if (ribbonText) {
    ribbonText.textContent = `${girl} ♡`;
  }

  const bpmLabel = document.querySelector('.ecg-bpm-pill.elevated .bpm-label');
  if (bpmLabel) {
    bpmLabel.textContent = `With ${girl}:`;
  }

  const heartStatusMsg = document.getElementById('heart-status-msg');
  if (heartStatusMsg && heartStatusMsg.textContent.includes('Waiting for')) {
    heartStatusMsg.textContent = `Status: Waiting for ${girl}'s touch... ♡`;
  }

  const heartLockedHint = document.getElementById('heart-locked-hint');
  if (heartLockedHint) {
    heartLockedHint.innerHTML = `<span class="lock-icon">🔒</span> Press ${boy}'s heart repeatedly above to heal it with your love...`;
  }

  const fixedCardBadge = document.querySelector('.fixed-heart-badge span:not(.badge-sparkle)');
  if (fixedCardBadge) {
    fixedCardBadge.textContent = `Heart Restored & Healed by ${girl}`;
  }

  const fixedCardQuote = document.querySelector('.fixed-heart-quote');
  if (fixedCardQuote) {
    fixedCardQuote.innerHTML = `“Thank you for coming into my life and fixing my heart, ${girl}.<br>Before you, it was just beating... but with you, it finally found its rhythm, comfort, and reason to beat forever.”`;
  }

  const fixedCardAuthor = document.querySelector('.fixed-heart-author');
  if (fixedCardAuthor) {
    fixedCardAuthor.textContent = `— Forever yours, ${boy} ♡`;
  }

  // 6. Chapter 5: Final Question Boy Alt
  const questionBoyImg = document.querySelector('.question-boy-img');
  if (questionBoyImg) {
    questionBoyImg.setAttribute('alt', `${boy} Asking With All His Heart`);
  }

  // 7. Grand Finale Celebration
  const cheerCharacter = document.getElementById('cheer-character');
  if (cheerCharacter) {
    cheerCharacter.setAttribute('title', `${boy} is celebrating! 🎉`);
  }

  const cheerF1 = document.getElementById('cheer-f1');
  if (cheerF1) cheerF1.setAttribute('alt', `${boy} Jumping for Joy`);

  const cheerF2 = document.getElementById('cheer-f2');
  if (cheerF2) cheerF2.setAttribute('alt', `${boy} Touching His Heart`);

  const cheerF3 = document.getElementById('cheer-f3');
  if (cheerF3) cheerF3.setAttribute('alt', `${boy} Winking Happily`);

  const celebrationBanner = document.querySelector('.celebration-name-banner');
  if (celebrationBanner) {
    celebrationBanner.textContent = `❤️ ${girlUpper} ❤️`;
  }

  const celebrationQuote = document.querySelector('.celebration-quote');
  if (celebrationQuote) {
    celebrationQuote.innerHTML = `“There. It belongs in ${boy}'s heart.<br>Forever and always. ♡”`;
  }

  const certBody = document.querySelector('.cert-body');
  if (certBody) {
    certBody.innerHTML = `This certifies that <strong>${girl}'s</strong> name has been permanently written upon <strong>${boy}'s</strong> heart.<br>Stored in warmth, sealed with care, and held forever with infinite love.`;
  }

  const sigItems = document.querySelectorAll('.cert-sig-item');
  if (sigItems.length >= 2) {
    sigItems[0].innerHTML = `With all my love,<br><strong>${boy} ♡</strong>`;
    sigItems[1].innerHTML = `Inscribed for,<br><strong>${girl} ♡</strong>`;
  }

  // 8. Custom data-dyn attribute elements (if any added)
  document.querySelectorAll('[data-dyn="boy"]').forEach(el => el.textContent = boy);
  document.querySelectorAll('[data-dyn="girl"]').forEach(el => el.textContent = girl);
  document.querySelectorAll('[data-dyn="girl-upper"]').forEach(el => el.textContent = girlUpper);
  document.querySelectorAll('[data-dyn="couple"]').forEach(el => el.textContent = `${boy} & ${girl}`);
}

/**
 * Render standard realistic 404 Not Found screen
 */
export function render404Page() {
  if (typeof document === 'undefined') return;
  document.title = "404 Not Found";
  // Strip story stylesheets
  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
  document.body.className = '';
  document.body.style.cssText = 'margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #fff; color: #222; min-height: 100vh; box-sizing: border-box;';
  document.body.innerHTML = `
    <div style="max-width: 600px; margin: 40px auto 0; text-align: left;">
      <h1 style="font-size: 26px; font-weight: 600; color: #111; margin: 0 0 10px;">404 Not Found</h1>
      <p style="font-size: 15px; color: #555; line-height: 1.5; margin: 0 0 20px;">The requested URL was not found on this server.</p>
      <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;">
      <div style="font-size: 13px; color: #888;">nginx/1.22.1</div>
    </div>
  `;
}

/**
 * Initialize Names Module on page load
 * Returns true if valid encrypted session, false if 404
 */
export function initNames() {
  const parsed = parseNamesFromUrl();
  if (!parsed.valid) {
    render404Page();
    return false;
  }
  setNames(parsed.boy, parsed.girl, { updateUrl: false });
  return true;
}
