/**
 * Script pour corriger le problème de crypto dans @nestjs/typeorm
 * À exécuter avant le déploiement
 */

const fs = require('fs');
const path = require('path');

// Chemin du fichier à patcher
const typeormUtilsPath = path.resolve(__dirname, '../node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js');

console.log('Patching @nestjs/typeorm to fix crypto issue...');

try {
  // Vérifier si le fichier existe
  if (fs.existsSync(typeormUtilsPath)) {
    // Lire le contenu du fichier
    let content = fs.readFileSync(typeormUtilsPath, 'utf8');
    
    // Chercher la ligne problématique
    const originalLine = 'const generateString = () => crypto.randomUUID();';
    const newLine = 'const generateString = () => require("crypto").randomUUID();';
    
    // Vérifier si la ligne est présente
    if (content.includes(originalLine)) {
      // Remplacer la ligne
      content = content.replace(originalLine, newLine);
      
      // Écrire le contenu mis à jour
      fs.writeFileSync(typeormUtilsPath, content, 'utf8');
      console.log('✅ Successfully patched @nestjs/typeorm');
    } else {
      console.log('⚠️ Line to patch not found. The file might have been updated or already patched.');
    }
  } else {
    console.log(`❌ File not found: ${typeormUtilsPath}`);
  }
} catch (error) {
  console.error('❌ Error patching @nestjs/typeorm:', error);
}
