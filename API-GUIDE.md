# Guide d'utilisation de l'API NJI Auto Pro

Cette API GraphQL fournit un accès aux données de véhicules provenant de diverses sources. Ce guide explique comment l'utiliser avec différents clients.

## URL de l'API

- **URL Production**: `https://votre-app.railway.app/graphql`
- **Playground GraphQL**: Disponible à la même URL dans votre navigateur

## Requêtes GraphQL importantes

### 1. Récupérer tous les véhicules (liste simplifiée)

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

### 2. Rechercher des véhicules avec filtres

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
    fuel
    mileage
    images
  }
}
```

### 3. Détails complets d'un véhicule

```graphql
query {
  vehicle(id: "mc-automobiles-68587") {
    id
    reference
    type
    bodyType
    brand
    model
    version
    fuel
    year
    registrationDate
    mileage
    doors
    seats
    color
    transmission
    power
    fiscalPower
    price
    vatRate
    fees
    totalPrice
    features
    options
    co2Emission
    images
    damageImages
    location
    licensePlate
    vin
    weight
    tourUrl
    expertiseUrl
    origin
  }
}
```

### 4. Requête avec détails d'expertise

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

## Utilisation avec JavaScript/TypeScript

### Avec Apollo Client

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

### Avec Fetch API

```typescript
async function getVehicles() {
  const response = await fetch('https://votre-app.railway.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    body: JSON.stringify({
      query: `
        query {
          vehicles {
            id
            brand
            model
            price
          }
        }
      `
    }),
  });

  const result = await response.json();
  console.log(result.data.vehicles);
}
```

## Intégration avec Nuxt 3

Dans votre projet Nuxt 3, vous pouvez utiliser le module `@nuxtjs/apollo` pour une intégration facile:

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

Ensuite, dans vos composants:

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

## Conseils importants

1. **Spécifiez toujours des sous-champs** pour les objets comme `expertise`
2. **Incluez l'en-tête `apollo-require-preflight`** pour éviter les erreurs CSRF
3. **Gardez vos requêtes légères** en ne demandant que les champs dont vous avez besoin
4. **Utilisez les filtres** pour réduire la quantité de données transférées
