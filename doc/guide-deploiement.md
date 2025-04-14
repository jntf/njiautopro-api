# Guide de déploiement de l'API NJI Auto Pro

Ce document explique en détail les différentes options de déploiement de l'API NJI Auto Pro, avec des instructions étape par étape.

## Prérequis

Avant de commencer le déploiement, assurez-vous de disposer des éléments suivants :

- Un compte GitHub pour héberger le code source
- Un compte sur la plateforme de déploiement choisie (Railway ou Vercel)
- Node.js v18+ et npm v8+ installés sur votre machine de développement

## Options de déploiement

L'API NJI Auto Pro peut être déployée sur différentes plateformes. Voici les deux options recommandées :

### 1. Railway (Recommandé)

Railway est recommandé pour sa simplicité de déploiement et sa compatibilité avec les applications NestJS.

### 2. Vercel

Vercel est une alternative viable, mais nécessite quelques configurations spécifiques.

## Préparation du code

Avant de déployer l'API, assurez-vous que votre code est prêt :

1. Vérifiez que toutes les dépendances sont incluses dans le `package.json`
2. Exécutez les tests pour vous assurer que tout fonctionne correctement :
   ```bash
   npm test
   ```
3. Assurez-vous que le build fonctionne en local :
   ```bash
   npm run build
   ```

## Déploiement sur Railway

### Étape 1 : Connecter votre dépôt Git à Railway

1. Créez un compte sur [Railway](https://railway.app) si vous n'en avez pas déjà un
2. Depuis le tableau de bord Railway, cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Autorisez Railway à accéder à votre compte GitHub
5. Sélectionnez le dépôt contenant votre API NJI Auto Pro

### Étape 2 : Configurer le déploiement

1. Railway détectera automatiquement qu'il s'agit d'une application Node.js
2. Dans les paramètres du projet, configurez les variables d'environnement si nécessaire
3. Dans l'onglet "Settings", sous "Start Command", assurez-vous que la commande est :
   ```
   npm run start:prod
   ```

### Étape 3 : Gestion de la protection CSRF sur Railway

Pour que le playground GraphQL fonctionne correctement sur Railway, vous avez deux options :

#### Option A : Désactiver la protection CSRF (plus simple, moins sécurisé)

1. Remplacez le contenu de `src/app.module.ts` par celui de `src/railway.app.module.ts`
   ```bash
   cp src/railway.app.module.ts src/app.module.ts
   ```
   
   Ou modifiez directement `app.module.ts` pour désactiver la protection CSRF :
   ```typescript
   GraphQLModule.forRoot<ApolloDriverConfig>({
     // ...
     csrfPrevention: false,
     // ...
   }),
   ```

#### Option B : Configurer correctement la protection CSRF (plus sécurisé)

1. Dans `src/app.module.ts`, assurez-vous que la configuration `csrfPrevention` est la suivante :
   ```typescript
   csrfPrevention: {
     requestHeaders: ['content-type', 'apollo-require-preflight', 'x-apollo-operation-name'],
   },
   ```

2. Dans `src/main.ts`, vérifiez que CORS est correctement configuré :
   ```typescript
   app.enableCors({
     origin: true,
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
     preflightContinue: false,
     optionsSuccessStatus: 204,
   });
   ```

### Étape 4 : Déclencher le déploiement

1. Confirmez les paramètres et cliquez sur "Deploy"
2. Railway clonera votre dépôt, installera les dépendances, construira l'application et la déploiera
3. Une fois le déploiement terminé, Railway vous fournira une URL pour accéder à votre API

### Étape 5 : Vérification du déploiement

1. Accédez à l'URL fournie par Railway, en ajoutant `/graphql` à la fin pour accéder au playground
2. Testez quelques requêtes GraphQL pour vous assurer que l'API fonctionne correctement

## Déploiement sur Vercel

### Étape 1 : Préparer l'application pour Vercel

1. Assurez-vous que le fichier `vercel.json` est présent à la racine du projet. Il devrait ressembler à ceci :
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/main.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/main.js"
       }
     ]
   }
   ```

2. Utilisez le module spécifique à Vercel pour éviter les problèmes de génération de schéma :
   ```bash
   cp src/app.module.vercel.ts src/app.module.ts
   ```

### Étape 2 : Connecter votre dépôt Git à Vercel

1. Créez un compte sur [Vercel](https://vercel.com) si vous n'en avez pas déjà un
2. Depuis le tableau de bord Vercel, cliquez sur "New Project"
3. Importez votre dépôt Git
4. Autorisez Vercel à accéder à votre compte GitHub
5. Sélectionnez le dépôt contenant votre API NJI Auto Pro

### Étape 3 : Configurer le déploiement

1. Dans la page de configuration du projet, utilisez les paramètres suivants :
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: dist
   - Install Command: `npm install`

2. Dans la section "Environment Variables", ajoutez les variables d'environnement nécessaires

### Étape 4 : Déclencher le déploiement

1. Cliquez sur "Deploy"
2. Vercel clonera votre dépôt, installera les dépendances, construira l'application et la déploiera
3. Une fois le déploiement terminé, Vercel vous fournira une URL pour accéder à votre API

### Étape 5 : Vérification du déploiement

1. Accédez à l'URL fournie par Vercel, en ajoutant `/graphql` à la fin pour accéder au playground
2. Testez quelques requêtes GraphQL pour vous assurer que l'API fonctionne correctement

## Déploiement sur d'autres plateformes

### Déploiement sur un serveur Node.js classique

Si vous souhaitez déployer l'API sur un serveur Node.js classique (par exemple, AWS EC2, DigitalOcean, etc.), suivez ces étapes :

1. Connectez-vous à votre serveur via SSH
2. Clonez votre dépôt Git
   ```bash
   git clone https://github.com/votre-utilisateur/njiautopro-api.git
   cd njiautopro-api
   ```

3. Installez les dépendances
   ```bash
   npm install
   ```

4. Construisez l'application
   ```bash
   npm run build
   ```

5. Démarrez l'application en mode production
   ```bash
   npm run start:prod
   ```

6. Pour maintenir l'application en ligne, utilisez un gestionnaire de processus comme PM2 :
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name njiautopro-api
   pm2 save
   pm2 startup
   ```

## Configuration CORS pour les requêtes côté client

Pour que les applications clientes puissent communiquer avec l'API, assurez-vous que CORS est correctement configuré.

1. La configuration CORS est définie dans `src/main.ts` :
   ```typescript
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
     preflightContinue: false,
     optionsSuccessStatus: 204,
   });
   ```

2. Pour restreindre les origines en production, remplacez `origin: true` par une liste d'origines autorisées :
   ```typescript
   origin: ['https://votre-frontend.com', 'https://autre-frontend.com'],
   ```

## Configurer l'intégration continue (CI/CD)

Pour automatiser les déploiements à chaque push sur votre dépôt, vous pouvez configurer l'intégration continue.

### Configuration CI/CD pour Railway

Railway propose une intégration continue automatique. Chaque fois que vous poussez des modifications sur la branche configurée (généralement `main`), Railway déclenchera automatiquement un nouveau déploiement.

### Configuration CI/CD pour Vercel

Vercel propose également une intégration continue automatique. Chaque push sur la branche principale déclenchera un nouveau déploiement.

### Configuration CI/CD avec GitHub Actions

Si vous souhaitez plus de contrôle, vous pouvez utiliser GitHub Actions. Créez un fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      # Pour Railway
      - name: Deploy to Railway
        uses: railway/cli-action@master
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          command: up
```

## Surveillance et maintenance

### Surveillance avec Railway

Railway offre des outils de surveillance intégrés :
1. Accédez à votre projet sur Railway
2. Allez dans l'onglet "Metrics" pour voir les performances
3. Consultez les logs dans l'onglet "Logs"

### Surveillance avec Vercel

Vercel propose également des outils de surveillance :
1. Accédez à votre projet sur Vercel
2. Consultez les logs et les métriques dans l'onglet "Analytics"

### Mises à jour et maintenance

Pour maintenir votre API à jour :

1. Mettez régulièrement à jour les dépendances :
   ```bash
   npm update
   npm audit fix
   ```

2. Testez les mises à jour en local avant de déployer :
   ```bash
   npm test
   npm run start:dev
   ```

3. Déployez les mises à jour en suivant votre processus CI/CD ou en effectuant un push vers votre branche principale

## Résolution des problèmes courants

### Problème : Erreurs CSRF dans le playground GraphQL

**Solution :**
1. Vérifiez la configuration CSRF dans `app.module.ts`
2. Assurez-vous d'inclure l'en-tête `apollo-require-preflight: true` dans vos requêtes
3. En dernier recours, désactivez la protection CSRF

### Problème : L'API ne démarre pas après le déploiement

**Solution :**
1. Vérifiez les logs de déploiement pour identifier l'erreur
2. Assurez-vous que tous les fichiers nécessaires sont inclus dans le dépôt
3. Vérifiez que le script `start:prod` est correctement configuré dans `package.json`
4. Assurez-vous que la version de Node.js utilisée par la plateforme de déploiement est compatible avec votre application

### Problème : Les requêtes GraphQL échouent avec une erreur de schéma

**Solution :**
1. Vérifiez que le schéma GraphQL est correctement généré lors du build
2. Si vous utilisez Vercel, assurez-vous d'utiliser le module spécifique à Vercel (`app.module.vercel.ts`)
3. Essayez de régénérer le schéma manuellement :
   ```bash
   npx nest start
   ```
4. Vérifiez les entités GraphQL pour vous assurer qu'elles sont correctement décorées et exportées

### Problème : Les requêtes CORS échouent

**Solution :**
1. Vérifiez la configuration CORS dans `main.ts`
2. Assurez-vous que l'origine de votre application cliente est autorisée
3. Vérifiez que les en-têtes nécessaires sont inclus dans la liste `allowedHeaders`

## Optimisation des performances

### Mise en cache

Pour améliorer les performances de l'API, vous pouvez implémenter un système de mise en cache :

1. Ajoutez une dépendance de mise en cache à votre projet :
   ```bash
   npm install @nestjs/cache-manager cache-manager
   ```

2. Configurez le module de cache dans `app.module.ts` :
   ```typescript
   import { CacheModule } from '@nestjs/cache-manager';
   
   @Module({
     imports: [
       // ...
       CacheModule.register({
         ttl: 60 * 5, // 5 minutes
         max: 100, // maximum 100 items in cache
       }),
       // ...
     ],
     // ...
   })
   export class AppModule {}
   ```

3. Utilisez le service de cache dans votre service de véhicules :
   ```typescript
   import { CACHE_MANAGER } from '@nestjs/cache-manager';
   import { Cache } from 'cache-manager';
   
   @Injectable()
   export class VehiclesService {
     constructor(
       // ...
       @Inject(CACHE_MANAGER) private cacheManager: Cache,
     ) {}
     
     async findAll(): Promise<Vehicle[]> {
       // Try to get from cache first
       const cachedVehicles = await this.cacheManager.get<Vehicle[]>('all_vehicles');
       if (cachedVehicles) {
         return cachedVehicles;
       }
       
       // If not in cache, get from sources
       const vehiclesArrays = await Promise.all(
         this.sources.map((source) => source.getVehicles()),
       );
       const vehicles = vehiclesArrays.flat();
       
       // Store in cache
       await this.cacheManager.set('all_vehicles', vehicles);
       
       return vehicles;
     }
     
     // ...
   }
   ```

### Compression

Activez la compression des réponses pour réduire la taille des données transférées :

1. Installez le package de compression :
   ```bash
   npm install compression
   ```

2. Activez la compression dans `main.ts` :
   ```typescript
   import * as compression from 'compression';
   
   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     
     // Activer la compression
     app.use(compression());
     
     // Reste de la configuration...
     
     await app.listen(3000);
   }
   bootstrap();
   ```

### Limitation du débit (Rate Limiting)

Protégez votre API contre les abus en implémentant la limitation de débit :

1. Installez le package :
   ```bash
   npm install @nestjs/throttler
   ```

2. Configurez le module de limitation dans `app.module.ts` :
   ```typescript
   import { ThrottlerModule } from '@nestjs/throttler';
   
   @Module({
     imports: [
       // ...
       ThrottlerModule.forRoot({
         ttl: 60, // 1 minute
         limit: 100, // 100 requêtes par minute
       }),
       // ...
     ],
     // ...
   })
   export class AppModule {}
   ```

3. Appliquez le garde de limitation à vos contrôleurs :
   ```typescript
   import { ThrottlerGuard } from '@nestjs/throttler';
   
   @Resolver(() => Vehicle)
   @UseGuards(ThrottlerGuard)
   export class VehiclesResolver {
     // ...
   }
   ```

## Sécurité

### Protection contre les attaques par injection GraphQL

Pour protéger votre API contre les attaques par injection GraphQL :

1. Limitez la complexité des requêtes GraphQL :
   ```typescript
   GraphQLModule.forRoot<ApolloDriverConfig>({
     // ...
     validationRules: [
       depthLimit(5), // Limite la profondeur des requêtes
       costAnalysis({
         maximumCost: 1000,
         variables: {},
         defaultCost: 1,
       }),
     ],
     // ...
   }),
   ```

2. Implémentez une validation plus stricte des entrées dans vos résolveurs.

### Authentification et autorisation

Pour sécuriser l'accès à votre API avec JWT :

1. Installez les packages nécessaires :
   ```bash
   npm install @nestjs/jwt passport passport-jwt
   ```

2. Implémentez un module d'authentification et configurez les stratégies de sécurité.

## Conseils avancés

### Dockerisation

Pour containeriser votre API avec Docker :

1. Créez un `Dockerfile` à la racine du projet :
   ```Dockerfile
   FROM node:18-alpine as builder
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   RUN npm run build
   
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/dist ./dist
   
   RUN npm ci --only=production
   
   EXPOSE 3000
   
   CMD ["node", "dist/main"]
   ```

2. Créez un fichier `.dockerignore` :
   ```
   node_modules
   npm-debug.log
   dist
   .git
   .github
   .vscode
   ```

3. Construisez et exécutez l'image Docker :
   ```bash
   docker build -t njiautopro-api .
   docker run -p 3000:3000 njiautopro-api
   ```

### Utilisation d'une base de données pour la mise en cache

Si vous avez besoin d'une mise en cache plus robuste, vous pouvez utiliser Redis :

1. Installez les dépendances :
   ```bash
   npm install cache-manager-redis-store@2
   ```

2. Configurez le cache avec Redis :
   ```typescript
   import * as redisStore from 'cache-manager-redis-store';
   
   CacheModule.register({
     store: redisStore,
     host: 'localhost',
     port: 6379,
     ttl: 600,
   }),
   ```

## Conclusion

Ce guide vous a présenté les différentes options de déploiement de l'API NJI Auto Pro, ainsi que des conseils pour l'optimisation, la surveillance et la maintenance de votre application. En suivant ces recommandations, vous pourrez déployer une API robuste et performante pour votre système de gestion de véhicules.

N'hésitez pas à adapter ces instructions en fonction de vos besoins spécifiques et de l'évolution de votre projet. Bonne chance avec votre déploiement !
