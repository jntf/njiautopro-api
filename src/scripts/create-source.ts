import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Source } from '../sources/entities/source.entity';
import { Repository } from 'typeorm';

/**
 * Script pour créer une source dans la base de données
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/create-source.ts
 */
async function bootstrap() {
  const logger = new Logger('CreateSourceScript');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const sourceRepository = app.get<Repository<Source>>(
      getRepositoryToken(Source),
    );

    // Configuration de la source MC Automobiles
    const mcSource = sourceRepository.create({
      name: 'MC Automobiles',
      url: 'https://www.mcautomobiles.com/gestion/export/mca-stock.xml',
      commission_rate: 2.5,
      transport_fee: 150,
      additional_fees: 75,
      active: true,
      source_id: 'mc-automobiles',
      source_type: 'xml',
      config: {
        refreshInterval: 30 * 60 * 1000, // 30 minutes en millisecondes
      },
    });

    // Vérifier si la source existe déjà
    const existingSource = await sourceRepository.findOne({
      where: { source_id: mcSource.source_id },
    });

    if (existingSource) {
      logger.log(`La source ${mcSource.source_id} existe déjà, mise à jour...`);
      await sourceRepository.update(existingSource.id, mcSource);
      logger.log(`Source ${mcSource.source_id} mise à jour avec succès !`);
    } else {
      await sourceRepository.save(mcSource);
      logger.log(`Source ${mcSource.source_id} créée avec succès !`);
    }
  } catch (error) {
    logger.error(`Erreur lors de la création de la source: ${error.message}`);
  } finally {
    await app.close();
  }
}

bootstrap();
