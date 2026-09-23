/**
 * Dedicated Link Generator Logic (/gen2)
 * Generates encrypted system links for any boy & girl partner names.
 */

import { encryptNames, decryptNames } from './crypto.js';
import { formatName, DEFAULT_BOY, DEFAULT_GIRL } from './names.js';

document.addEventListener('DOMContentLoaded', () => {
  const boyInput = document.getElementById('gen2-boy');
  const girlInput = document.getElementById('gen2-girl');
  const swapBtn = document.getElementById('gen2-swap-btn');
  const genBtn = document.getElementById('gen2-generate-btn');
  const resultCard = document.getElementById('gen2-result-card');
  const resultUrl = document.getElementById('gen2-result-url');
  const copyBtn = document.getElementById('gen2-copy-btn');
  const openBtn = document.getElementById('gen2-open-btn');
  const summaryBoy = document.getElementById('summary-boy');
  const summaryGirl = document.getElementById('summary-girl');
  const formatSelect = document.getElementById('gen2-format');

  if (!boyInput || !girlInput || !genBtn) return;

  // Swap button
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = boyInput.value;
      boyInput.value = girlInput.value;
      girlInput.value = temp;
      triggerGenerate();
    });
  }

  // Generate button
  genBtn.addEventListener('click', (e) => {
    e.preventDefault();
    triggerGenerate();
  });

  // Enter key in inputs generates
  [boyInput, girlInput].forEach(inp => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerGenerate();
      }
    });
  });

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const urlToCopy = resultUrl.value;
      if (!urlToCopy) return;

      try {
        await navigator.clipboard.writeText(urlToCopy);
        const origText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✓</span> Copied to Clipboard!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = origText;
          copyBtn.classList.remove('copied');
        }, 2200);
      } catch (err) {
        // Fallback for older browsers
        resultUrl.select();
        document.execCommand('copy');
        copyBtn.innerHTML = '<span>✓</span> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<span>📋</span> Copy Link';
        }, 2000);
      }
    });
  }

  // Open button
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      const url = resultUrl.value;
      if (url) {
        window.open(url, '_blank');
      }
    });
  }

  function triggerGenerate() {
    const rawBoy = (boyInput.value || '').trim() || DEFAULT_BOY;
    const rawGirl = (girlInput.value || '').trim() || DEFAULT_GIRL;

    const boy = formatName(rawBoy);
    const girl = formatName(rawGirl);

    const token = encryptNames(boy, girl);
    const format = formatSelect ? formatSelect.value : 'path';

    const origin = window.location.origin.replace(/\/+$/, '');
    let finalUrl = '';

    if (format === 'query') {
      finalUrl = `${origin}/server?session=${token}`;
    } else if (format === 'hash') {
      finalUrl = `${origin}/#/server/${token}`;
    } else {
      finalUrl = `${origin}/server/${token}`;
    }

    if (resultUrl) {
      resultUrl.value = finalUrl;
    }

    if (summaryBoy) summaryBoy.textContent = boy;
    if (summaryGirl) summaryGirl.textContent = girl;

    if (resultCard) {
      resultCard.style.display = 'block';
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Quick verification test: decrypt back to verify integrity
    const verified = decryptNames(token);
    const verifyBadge = document.getElementById('gen2-verify-badge');
    if (verifyBadge) {
      if (verified && verified.boy === boy && verified.girl === girl) {
        verifyBadge.innerHTML = '🔒 <strong>Encrypted & Verified</strong> — Names are completely hidden from the URL';
        verifyBadge.className = 'verify-status valid';
      } else {
        verifyBadge.innerHTML = '⚠️ Verification warning';
        verifyBadge.className = 'verify-status warning';
      }
    }
  }

  // Pre-generate once with initial values
  triggerGenerate();
});
