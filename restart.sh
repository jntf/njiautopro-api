#!/bin/bash

# Script pour nettoyer et redémarrer l'application NestJS

echo "Arret des processus NestJS existants..."
pkill -f "node.*nest"

echo "Cleaning up build artifacts..."
rm -rf dist/
rm -rf node_modules/.cache

echo "Removing GraphQL schema to ensure regeneration..."
rm -f src/schema.gql

echo "Rebuilding the application..."
npm run build

echo "Restarting the application..."
npm run start:dev
