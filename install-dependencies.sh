#!/bin/bash

# Script d'installation des dépendances supplémentaires
echo "Installation des dépendances supplémentaires pour la source MC Automobiles..."

# Installer axios pour les requêtes HTTP
npm install axios

# Installer xml2js pour parser le XML
npm install xml2js
npm install @types/xml2js --save-dev

echo "Dépendances installées avec succès!"
echo "Vous pouvez maintenant démarrer l'API avec: npm run start:dev"
