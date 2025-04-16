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

### 5. Récupérer les métadonnées des véhicules avec filtrage optionnel (NOUVEAU)

```graphql
# Sans filtre - récupère toutes les valeurs distinctes
query {
  vehicleMetadata {
    brands
    models
    versions
    fuels
    transmissions
    bodyTypes
    colors
    years
  }
}

# Avec filtre - récupère les valeurs distinctes pour les véhicules Peugeot
query {
  vehicleMetadata(filters: { brand: "Peugeot" }) {
    models
    versions
    fuels
    transmissions
    bodyTypes
    colors
    years
  }
}
```

### 6. Filtrage en cascade avec sélection multiple (NOUVEAU)

Cette nouvelle fonctionnalité permet de récupérer dynamiquement les options de filtrage disponibles en fonction des filtres déjà sélectionnés.

```graphql
# Exemple 1: Récupérer les modèles disponibles pour Peugeot et Renault
query {
  filterOptions(
    targetFilter: "model",
    selectedFilters: { 
      brands: ["Peugeot", "Renault"] 
    }
  ) {
    options
    count
  }
}

# Exemple 2: Récupérer les marques disponibles pour les véhicules diesel et essence
query {
  filterOptions(
    targetFilter: "brand",
    selectedFilters: { 
      fuels: ["Diesel", "Essence"] 
    }
  ) {
    options
    count
  }
}

# Exemple 3: Filtrage complexe - transmissions disponibles pour des critères multiples
query {
  filterOptions(
    targetFilter: "transmission",
    selectedFilters: { 
      brands: ["Peugeot", "Renault"],
      fuels: ["Diesel"],
      minYear: 2018
    }
  ) {
    options
    count
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

### 7. Plages numériques pour années, kilométrage et prix (NOUVEAU)

Cette nouvelle fonctionnalité permet de récupérer les plages de valeurs min/max pour les attributs numériques en fonction des filtres déjà sélectionnés.

```graphql
# Exemple 1: Récupérer la plage d'années disponibles
query {
  rangeOptions(
    targetRange: "year"
  ) {
    min
    max
    count
  }
}

# Exemple 2: Récupérer la plage de prix pour les véhicules Peugeot
query {
  rangeOptions(
    targetRange: "price",
    selectedFilters: {
      brands: ["Peugeot"]
    }
  ) {
    min
    max
    count
  }
}

# Exemple 3: Récupérer la plage de kilométrage avec filtres multiples
query {
  rangeOptions(
    targetRange: "mileage",
    selectedFilters: {
      brands: ["Peugeot", "Renault"],
      fuels: ["Diesel"],
      minYear: 2018
    }
  ) {
    min
    max
    count
  }
}
```

## Exemple d'utilisation du filtrage en cascade avec Nuxt 3

```vue
<script setup>
import { ref, computed, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// Filtres sélectionnés
const selectedFilters = ref({
  brands: [],
  models: [],
  fuels: [],
  transmissions: []
});

// Charger les métadonnées initiales
const { result: metadataResult } = useQuery(gql`
  query {
    vehicleMetadata {
      brands
      fuels
      transmissions
      bodyTypes
    }
  }
`);

// Requête réactive pour les modèles disponibles
const modelOptionsQuery = computed(() => {
  if (!selectedFilters.value.brands.length) return null;
  
  return gql`
    query {
      filterOptions(
        targetFilter: "model",
        selectedFilters: {
          brands: ${JSON.stringify(selectedFilters.value.brands)}
        }
      ) {
        options
        count
      }
    }
  `;
});

const { result: modelOptions } = useQuery(modelOptionsQuery);

// Surveiller les changements de filtres
watch(() => selectedFilters.value, (newFilters) => {
  // Réinitialiser les modèles si les marques changent
  if (newFilters.brands.length === 0) {
    selectedFilters.value.models = [];
  }
}, { deep: true });

// Fonction pour effectuer une recherche
const searchVehicles = () => {
  // Implémenter la recherche avec les filtres sélectionnés
};
</script>

<template>
  <div>
    <h2>Filtres</h2>
    
    <!-- Sélection des marques -->
    <div>
      <h3>Marques</h3>
      <div v-for="brand in metadataResult?.vehicleMetadata?.brands" :key="brand">
        <input 
          type="checkbox" 
          :id="brand" 
          :value="brand" 
          v-model="selectedFilters.brands"
        >
        <label :for="brand">{{ brand }}</label>
      </div>
    </div>
    
    <!-- Sélection des modèles (mise à jour dynamique) -->
    <div v-if="modelOptions?.filterOptions?.options.length">
      <h3>Modèles ({{ modelOptions.filterOptions.count }} véhicules)</h3>
      <div v-for="model in modelOptions.filterOptions.options" :key="model">
        <input 
          type="checkbox" 
          :id="model" 
          :value="model" 
          v-model="selectedFilters.models"
        >
        <label :for="model">{{ model }}</label>
      </div>
    </div>
    
    <!-- Autres filtres... -->
    
    <button @click="searchVehicles">Rechercher</button>
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