/**
 * Script simple pour résoudre le problème de crypto dans @nestjs/typeorm
 * Ce script est exécuté avant le build dans railway
 */

const fs = require('fs');
const path = require('path');

// Chemin du fichier problématique
const typeormUtilsPath = path.join(__dirname, '../node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js');

try {
  if (fs.existsSync(typeormUtilsPath)) {
    console.log('Patching @nestjs/typeorm...');
    
    // Lire le contenu actuel
    let content = fs.readFileSync(typeormUtilsPath, 'utf8');
    
    // Remplacer la ligne problématique
    content = content.replace(
      'const generateString = () => crypto.randomUUID();',
      'const generateString = () => require("crypto").randomUUID();'
    );
    
    // Sauvegarder le fichier modifié
    fs.writeFileSync(typeormUtilsPath, content, 'utf8');
    console.log('Patch applied successfully!');
  } else {
    console.log('Typeorm utils file not found, skipping patch.');
  }
} catch (error) {
  console.error('Error while patching:', error);
}
