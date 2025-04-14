/**
 * Ce fichier contient des polyfills pour résoudre les problèmes de compatibilité 
 * entre différentes versions de Node.js et les bibliothèques utilisées.
 */

// Polyfill pour crypto.randomUUID()
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = crypto;
} else if (typeof global.crypto.randomUUID !== 'function') {
  const origCrypto = global.crypto;
  const crypto = require('crypto');
  global.crypto = {
    ...origCrypto,
    randomUUID: crypto.randomUUID
  };
}
