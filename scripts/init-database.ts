import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config();

async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
  }
  
  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  
  try {
    // Connexion à la base de données
    await dataSource.initialize();
    console.log('Connection to database established');
    
    // Lire et exécuter le script SQL
    const sqlScript = `
    -- Supprimer les tables existantes (si nécessaires)
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS sources CASCADE;
    
    -- Créer les tables manuellement
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE sources (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(512) NOT NULL,
      commission_rate DECIMAL(5,2) DEFAULT 0,
      transport_fee DECIMAL(10,2) DEFAULT 0,
      additional_fees DECIMAL(10,2) DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    // Exécuter le script
    await dataSource.query(sqlScript);
    console.log('Database initialized successfully');
    
    // Fermer la connexion
    await dataSource.destroy();
    console.log('Connection to database closed');
  } catch (error) {
    console.error('Error initializing database:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

initializeDatabase();