import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CorsTestController } from './cors-test.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SourcesModule } from './sources/sources.module';
import { DocumentationModule } from './documentation/documentation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        if (databaseUrl) {
          // Utiliser l'URL de connexion directement
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            // synchronize: process.env.NODE_ENV !== 'production', // À désactiver en production
            synchronize: false,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Utiliser les paramètres de connexion individuels
        return {
          type: 'postgres',
          host: configService.get('PGHOST', 'localhost'),
          port: configService.get('PGPORT', 5432),
          username: configService.get('PGUSER', 'postgres'),
          password: configService.get('PGPASSWORD', ''),
          database: configService.get('PGDATABASE', 'postgres'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // synchronize: process.env.NODE_ENV !== 'production', // À désactiver en production
          synchronize: false,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      buildSchemaOptions: {
        orphanedTypes: []
      },
      playground: true,
      introspection: true,
      // Configuration CSRF pour permettre au playground de fonctionner
      csrfPrevention: {
        requestHeaders: ['content-type', 'apollo-require-preflight', 'x-apollo-operation-name'],
      },
      context: ({ req }) => ({ req }),
    }),
    VehiclesModule,
    UsersModule,
    AuthModule,
    SourcesModule,
    DocumentationModule,
  ],
  controllers: [AppController, CorsTestController],
  providers: [AppService],
})
export class AppModule {}
