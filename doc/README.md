# Documentation technique API NJI Auto Pro

Cette documentation technique complète de l'API NJI Auto Pro contient toutes les informations nécessaires pour comprendre, utiliser, étendre et déployer l'API.

## Structure de la documentation

Cette documentation est organisée en plusieurs sections pour faciliter la navigation et l'accès aux informations pertinentes :

1. [**Documentation technique générale**](documentation-technique.md) - Documentation complète de l'API, incluant les requêtes disponibles, les modèles de données et les bonnes pratiques
2. [**Exemples de requêtes GraphQL**](exemples-requetes-graphql.md) - Exemples pratiques de requêtes pour interagir avec l'API
3. [**Guide d'ajout d'une nouvelle source**](ajout-nouvelle-source.md) - Instructions détaillées pour ajouter une nouvelle source de données de véhicules
4. [**Guide de déploiement**](guide-deploiement.md) - Instructions pour déployer l'API sur différentes plateformes
5. [**Authentification et autorisation**](authentification.md) - Documentation du système d'authentification JWT
6. [**Gestion des sources et commissions**](gestion-sources.md) - Guide de gestion des sources de données et des paramètres financiers

## Vue d'ensemble du projet

NJI Auto Pro API est une API GraphQL développée avec NestJS qui permet d'accéder aux données de véhicules provenant de différentes sources. Actuellement, l'API intègre la source "MC Automobiles" via un flux XML, mais l'architecture est conçue pour faciliter l'ajout d'autres sources.

### Principales fonctionnalités

- Récupération de tous les véhicules disponibles
- Recherche de véhicules avec filtres avancés (marque, modèle, prix, année, etc.)
- Récupération des détails d'un véhicule spécifique, y compris les détails d'expertise
- Pagination des résultats de recherche
- Architecture extensible pour ajouter facilement de nouvelles sources de données
- Récupération des métadonnées pour construire des interfaces de filtrage dynamiques
- Authentification et autorisation basées sur JWT
- Gestion des sources de données et des paramètres financiers (commissions, frais)

### Technologies utilisées

- **Backend** : NestJS, TypeScript, GraphQL avec Apollo Server
- **Base de données** : PostgreSQL (gérée via TypeORM)
- **Authentification** : JWT (JSON Web Tokens)
- **Intégration de données** : Axios pour les requêtes HTTP, xml2js pour le parsing XML
- **Déploiement** : Compatible avec Railway et Vercel

## Guide de démarrage rapide

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/njiautopro-api.git
cd njiautopro-api

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifiez le fichier .env avec vos paramètres

# Initialiser la base de données
npm run init:db

# Créer un utilisateur administrateur
npm run create:admin

# Démarrer en mode développement
npm run start:dev
```

### Utilisation de base

Accédez au playground GraphQL à l'adresse http://localhost:3000/graphql pour tester l'API interactivement.

Pour vous authentifier :

```graphql
mutation {
  login(loginInput: {
    email: "admin@njiautopro.com",
    password: "admin123"
  }) {
    access_token
    user {
      id
      email
      role
    }
  }
}
```

Utilisez le token obtenu dans l'en-tête HTTP pour les requêtes authentifiées :
```
{
  "Authorization": "Bearer votre_token_jwt"
}
```

### Points d'accès principaux

L'API expose les points d'accès GraphQL suivants :

#### Module Véhicules
- `vehicles` : Récupère tous les véhicules
- `vehicle(id: ID!)` : Récupère un véhicule spécifique par son ID
- `searchVehicles(filters: VehicleFilterInput, pagination: PaginationInput)` : Recherche des véhicules avec filtres et pagination
- `vehicleMetadata` : Récupère les métadonnées des véhicules pour les filtres

#### Module Authentification
- `register(registerInput: RegisterInput)` : Enregistre un nouvel utilisateur
- `login(loginInput: LoginInput)` : Authentifie un utilisateur

#### Module Sources
- `sources` : Liste toutes les sources configurées
- `source(id: ID!)` : Récupère une source spécifique
- `createSource(createSourceInput: CreateSourceInput)` : Crée une nouvelle source
- `updateSource(updateSourceInput: UpdateSourceInput)` : Met à jour une source
- `removeSource(id: ID!)` : Supprime une source

#### Module Documentation
- `GET /documentation` : Accès à la documentation principale
- `GET /documentation/list` : Liste des documents disponibles
- `GET /documentation/:filename` : Document spécifique

## Architecture du projet

```
src/
├── app.module.ts             # Module principal de l'application
├── main.ts                   # Point d'entrée de l'application
├── auth/                     # Module d'authentification
│   ├── dto/                  # DTOs d'authentification
│   ├── guards/               # Gardes JWT et rôles
│   ├── strategies/           # Stratégie JWT
│   ├── auth.module.ts        # Module d'authentification
│   ├── auth.resolver.ts      # Résolveur d'authentification
│   └── auth.service.ts       # Service d'authentification
├── users/                    # Module de gestion des utilisateurs
│   ├── dto/                  # DTOs des utilisateurs
│   ├── entities/             # Entité utilisateur
│   ├── users.module.ts       # Module utilisateurs
│   ├── users.resolver.ts     # Résolveur utilisateurs
│   └── users.service.ts      # Service utilisateurs
├── sources/                  # Module de gestion des sources
│   ├── dto/                  # DTOs des sources
│   ├── entities/             # Entité source
│   ├── sources.module.ts     # Module sources
│   ├── sources.resolver.ts   # Résolveur sources
│   └── sources.service.ts    # Service sources
├── documentation/            # Module de documentation
│   ├── documentation.controller.ts # Contrôleur de documentation
│   └── documentation.module.ts     # Module de documentation
├── vehicles/                 # Module véhicules
│   ├── dto/                  # Objets de transfert de données
│   ├── entities/             # Définitions des entités GraphQL
│   ├── sources/              # Sources de données
│   │   ├── vehicle-source.interface.ts  # Interface commune pour les sources
│   │   └── mc-automobiles/   # Implémentation source MC Automobiles
│   ├── vehicles.module.ts    # Module NestJS pour les véhicules
│   ├── vehicles.resolver.ts  # Résolveur GraphQL
│   └── vehicles.service.ts   # Service de gestion des véhicules
└── schema.gql                # Schéma GraphQL généré automatiquement
```

## Contribution

### Comment contribuer

1. Forker le dépôt
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/ma-nouvelle-fonctionnalite`)
3. Commiter vos changements (`git commit -am 'Ajout de ma fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/ma-nouvelle-fonctionnalite`)
5. Créer une nouvelle Pull Request

### Normes de codage

Ce projet suit les normes de codage de NestJS et TypeScript. Assurez-vous de respecter ces normes lorsque vous contribuez au projet :

- Utilisez ESLint et Prettier pour formater votre code
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez vos fonctions et classes avec des commentaires JSDoc
- Suivez les principes SOLID

## Support et contact

Pour toute question ou problème concernant cette API, veuillez contacter l'équipe NJI Auto Pro :

- **Email** : contact@njiautopro.com
- **GitHub** : [Issues GitHub](https://github.com/votre-utilisateur/njiautopro-api/issues)

---

Ce projet est maintenu par l'équipe NJI Auto Pro.