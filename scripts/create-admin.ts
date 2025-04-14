import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

// Charger les variables d'environnement
dotenv.config();

// Fonction principale
async function createAdmin() {
  // Vérifier si l'URL de connexion est disponible
  const databaseUrl = process.env.DATABASE_URL;
  
  let dataSource: DataSource;
  
  if (databaseUrl) {
    // Utiliser l'URL de connexion directement
    console.log('Using database URL connection');
    dataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: ['dist/**/*.entity.js'],
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      synchronize: false
    });
  } else {
    // Utiliser les paramètres de connexion individuels
    console.log('Using individual connection parameters');
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      username: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'postgres',
      entities: ['dist/**/*.entity.js'],
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      synchronize: false
    });
  }

  try {
    // Connexion à la base de données
    await dataSource.initialize();
    console.log('Connection to database established');

    // Vérifier si un admin existe déjà
    const userRepository = dataSource.getRepository('users');
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@njiautopro.com' } });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await dataSource.destroy();
      return;
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const password_hash = await bcrypt.hash('admin123', saltRounds);

    // Créer l'utilisateur admin
    const admin = userRepository.create({
      email: 'admin@njiautopro.com',
      password_hash,
      role: 'admin',
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully');

    // Fermer la connexion
    await dataSource.destroy();
    console.log('Connection to database closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

createAdmin();
