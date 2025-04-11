# Documentation NJI Auto Pro API

## Vue d'ensemble

NJI Auto Pro API est une API GraphQL développée avec NestJS qui permet d'accéder aux données de véhicules provenant de différentes sources. Actuellement, l'API intègre la source "MC Automobiles" via un flux XML, mais l'architecture est conçue pour faciliter l'ajout d'autres sources.

## Structure du projet

```
src/
├── app.module.ts             # Module principal de l'application
├── main.ts                   # Point d'entrée de l'application
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

## Installation et démarrage

```bash
# Installation des dépendances
$ npm install

# Installation des dépendances spécifiques
$ npm install axios xml2js
$ npm install @types/xml2js --save-dev

# Démarrage en mode développement
$ npm run start:dev

# Démarrage en mode production
$ npm run start:prod
```

## Requêtes GraphQL principales

### 1. Récupérer tous les véhicules

```graphql
query {
  vehicles {
    id
    brand
    model
    version
    year
    price
    fuel
    mileage
    images
  }
}
```

### 2. Récupérer un véhicule par ID

```graphql
query {
  vehicle(id: "mc-automobiles-68587") {
    id
    brand
    model
    version
    price
    year
    mileage
    color
    fuel
    # Plus de champs disponibles...
  }
}
```

### 3. Rechercher des véhicules avec filtres

```graphql
query {
  searchVehicles(filters: {
    brand: "AUDI",
    minPrice: 20000,
    maxPrice: 30000,
    minYear: 2020
  }) {
    id
    brand
    model
    version
    price
    year
    # Plus de champs disponibles...
  }
}
```

### 4. Requête avec expertise détaillée

```graphql
query {
  vehicle(id: "mc-automobiles-68587") {
    id
    brand
    model
    # IMPORTANT: Pour le champ expertise, vous devez toujours
    # spécifier quels sous-champs vous voulez
    expertise {
      date_expertise
      jantes_alu
      bluetooth
      gps
      radar_recul
      climatisation
    }
    expertiseUrl
  }
}
```

## Intégration avec des clients

### Avec Apollo Client (JavaScript/TypeScript)

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://votre-app.railway.app/graphql',
  cache: new InMemoryCache(),
  headers: {
    'apollo-require-preflight': 'true',
  },
});

// Exemple de requête
const GET_VEHICLES = gql`
  query {
    vehicles {
      id
      brand
      model
      price
    }
  }
`;

// Exécuter la requête
client.query({
  query: GET_VEHICLES
}).then(result => {
  console.log(result.data.vehicles);
});
```

### Avec Nuxt 3

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/apollo'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://votre-app.railway.app/graphql',
        httpLinkOptions: {
          headers: {
            'apollo-require-preflight': 'true',
          },
        },
      },
    },
  },
});
```

Utilisation dans les composants:

```vue
<script setup>
const { data } = await useAsyncQuery(gql`
  query {
    vehicles {
      id
      brand
      model
      price
      images
    }
  }
`);
</script>

<template>
  <div>
    <div v-for="vehicle in data.vehicles" :key="vehicle.id">
      {{ vehicle.brand }} {{ vehicle.model }} - {{ vehicle.price }}€
    </div>
  </div>
</template>
```

## Déploiement

L'API peut être déployée sur différentes plateformes:

### Railway (Recommandé)
1. Connectez votre dépôt Git à Railway
2. Utilisez les paramètres par défaut
3. Pour résoudre les problèmes CSRF: assurez-vous que l'API est configurée avec l'option `csrfPrevention` correctement définie

### Vercel
1. Importez votre projet sur Vercel
2. Utilisez les paramètres:
   - Framework Preset: Other
   - Build Command: npm run vercel-build
   - Output Directory: dist

## Bonnes pratiques GraphQL

1. **Spécifiez toujours des sous-champs** pour les objets (comme `expertise`)
2. **Incluez l'en-tête `apollo-require-preflight`** pour éviter les erreurs CSRF
3. **Gardez vos requêtes légères** en ne demandant que les champs nécessaires
4. **Utilisez les filtres** pour réduire la quantité de données transférées

## Résolution de problèmes courants

### Erreurs CSRF

Si vous rencontrez des erreurs CSRF lors de l'utilisation du playground GraphQL, assurez-vous d'avoir configuré correctement:

1. Dans app.module.ts:
```typescript
csrfPrevention: {
  requestHeaders: ['content-type', 'apollo-require-preflight', 'x-apollo-operation-name'],
}
```

2. Dans vos clients, ajoutez l'en-tête:
```
'apollo-require-preflight': 'true'
```

### Redémarrage après modifications

Si vous modifiez les entités ou le schéma, utilisez le script de redémarrage:

```bash
chmod +x restart.sh
./restart.sh
```

## Extension et Amélioration

Pour ajouter une nouvelle source de données:

1. Créez un dossier pour la nouvelle source dans `src/vehicles/sources/`
2. Implémentez l'interface `VehicleSource`
3. Créez un module pour la source et exportez-le
4. Ajoutez la source au service `VehiclesService`