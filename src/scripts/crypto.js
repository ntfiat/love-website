/**
 * URL-Safe Lightweight Symmetric Encryption Engine
 * Encrypts/decrypts partner names into opaque, tamper-resistant system tokens.
 * Works synchronously in all browser environments (HTTP, HTTPS, localhost, mobile).
 */

const SECRET_KEY = "MoonlitBedroomStorybook_SecretKey_2026_♡";

/**
 * Simple 32-bit FNV-1a hash for integrity checksum
 */
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Convert string to UTF-8 byte array
 */
function strToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) bytes.push(charcode);
    else if (charcode < 0x800) {
      bytes.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      bytes.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    }
  }
  return bytes;
}

/**
 * Convert byte array to UTF-8 string
 */
function bytesToStr(bytes) {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const c = bytes[i++];
    if (c < 0x80) {
      out += String.fromCharCode(c);
    } else if (c > 0xbf && c < 0xe0) {
      const c2 = bytes[i++];
      out += String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
    } else if (c > 0xdf && c < 0xf0) {
      const c2 = bytes[i++];
      const c3 = bytes[i++];
      out += String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f));
    } else {
      const c2 = bytes[i++];
      const c3 = bytes[i++];
      const c4 = bytes[i++];
      let u = (((c & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f)) - 0x10000;
      out += String.fromCharCode((u >> 10) + 0xd800, (u & 0x3ff) + 0xdc00);
    }
  }
  return out;
}

/**
 * Base64 URL-safe encoding
 */
function toBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64 URL-safe decoding
 */
function fromBase64Url(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return Array.from(bytes);
}

/**
 * Encrypt a pair of names into an opaque system token
 * @param {string} boy - Boy / Partner 1 Name
 * @param {string} girl - Girl / Partner 2 Name
 * @returns {string} System token (e.g. "sv_8f0a2d...")
 */
export function encryptNames(boy, girl) {
  try {
    const rawPayload = JSON.stringify({
      b: (boy || '').trim(),
      g: (girl || '').trim(),
      t: Math.floor(Date.now() / 1000)
    });

    const checksum = fnv1a(rawPayload);
    const fullPayload = checksum + rawPayload;
    const payloadBytes = strToBytes(fullPayload);
    const keyBytes = strToBytes(SECRET_KEY);

    // Random salt (1 byte, 1-254) to ensure different tokens each generation
    const salt = Math.floor(Math.random() * 254) + 1;
    const cipherBytes = [salt];

    for (let i = 0; i < payloadBytes.length; i++) {
      const keyByte = keyBytes[(i + salt) % keyBytes.length];
      const prevByte = i === 0 ? salt : cipherBytes[i];
      // Multi-layer rotating XOR cipher
      const enc = (payloadBytes[i] ^ keyByte ^ prevByte) & 0xff;
      cipherBytes.push(enc);
    }

    return 'sv_' + toBase64Url(cipherBytes);
  } catch (err) {
    console.error('Encryption error:', err);
    return '';
  }
}

/**
 * Decrypt a system token back into partner names
 * @param {string} token - System token (with or without 'sv_' prefix)
 * @returns {{ boy: string, girl: string } | null}
 */
export function decryptNames(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    let cleanToken = token.trim();
    if (cleanToken.startsWith('sv_')) {
      cleanToken = cleanToken.slice(3);
    } else if (cleanToken.startsWith('sys_')) {
      cleanToken = cleanToken.slice(4);
    }

    const cipherBytes = fromBase64Url(cleanToken);
    if (!cipherBytes || cipherBytes.length < 10) return null;

    const salt = cipherBytes[0];
    const keyBytes = strToBytes(SECRET_KEY);
    const decryptedBytes = [];

    for (let i = 1; i < cipherBytes.length; i++) {
      const keyByte = keyBytes[(i - 1 + salt) % keyBytes.length];
      const prevByte = i === 1 ? salt : cipherBytes[i - 1];
      const dec = (cipherBytes[i] ^ keyByte ^ prevByte) & 0xff;
      decryptedBytes.push(dec);
    }

    const fullPayload = bytesToStr(decryptedBytes);
    const checksum = fullPayload.slice(0, 8);
    const rawPayload = fullPayload.slice(8);

    if (fnv1a(rawPayload) !== checksum) {
      console.warn('Checksum mismatch in token');
      return null;
    }

    const data = JSON.parse(rawPayload);
    if (data && typeof data === 'object' && (data.b || data.g)) {
      return {
        boy: data.b || 'Siddharth',
        girl: data.g || 'Khushi'
      };
    }
  } catch (err) {
    // Graceful silent fallback for malformed or foreign tokens
    console.warn('Decryption failed, falling back to defaults:', err.message);
  }

  return null;
}
