import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Pour l'utilisation d'Apollo Server, il est important de configurer CORS correctement
  app.enableCors({
    origin: true, // Accepte les requêtes de n'importe quelle origine en production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'apollo-require-preflight',
      'x-apollo-operation-name',
    ],
    // Important pour les requêtes provenant du playground GraphQL
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`GraphQL Playground available at: http://localhost:${port}/graphql`);
}
bootstrap();
