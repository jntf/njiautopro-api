/**
 * Ce fichier contient des polyfills pour résoudre les problèmes de compatibilité 
 * entre différentes versions de Node.js et les bibliothèques utilisées.
 */

// Polyfill pour crypto.randomUUID()
const nodeCrypto = require('crypto');

// Utilisons une approche différente pour éviter les problèmes de type
if (typeof global.crypto === 'undefined') {
  // @ts-ignore
  global.crypto = {};
}

// @ts-ignore
if (typeof global.crypto.randomUUID !== 'function') {
  // @ts-ignore
  global.crypto.randomUUID = function() {
    return nodeCrypto.randomUUID();
  };
}
