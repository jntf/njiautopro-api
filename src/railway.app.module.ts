import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CorsTestController } from './cors-test.controller';

/**
 * Ce module est spécifiquement configuré pour Railway
 * avec la protection CSRF désactivée.
 * 
 * Pour l'utiliser, renommez ce fichier en app.module.ts
 * ou modifiez votre app.module.ts pour y inclure ces paramètres.
 */
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // Génération de schéma en mémoire
      sortSchema: true,
      playground: true,
      introspection: true,
      // Désactive complètement la protection CSRF
      // REMARQUE: Ceci est moins sécurisé mais garantit le fonctionnement du playground
      csrfPrevention: false,
    }),
    VehiclesModule,
  ],
  controllers: [AppController, CorsTestController],
  providers: [AppService],
})
export class AppModule {}
