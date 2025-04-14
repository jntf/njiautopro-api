# Exemples de requêtes GraphQL pour NJI Auto Pro API

Ce document présente des exemples pratiques de requêtes GraphQL pour interagir avec l'API NJI Auto Pro. Ces exemples peuvent être utilisés directement dans le playground GraphQL ou intégrés dans vos applications.

## URL du playground GraphQL

```
https://votre-app.railway.app/graphql
```

> **Note**: N'oubliez pas d'inclure l'en-tête `apollo-require-preflight: true` dans vos requêtes pour éviter les erreurs CSRF.

## Requêtes de base

### 1. Récupérer tous les véhicules (version simple)

Cette requête récupère une liste basique de tous les véhicules disponibles.

```graphql
query GetAllVehicles {
  vehicles {
    id
    brand
    model
    version
    year
    price
    mileage
    fuel
    color
    images
  }
}
```

### 2. Récupérer tous les véhicules (version détaillée)

Cette requête récupère une liste détaillée de tous les véhicules disponibles.

```graphql
query GetAllVehiclesDetailed {
  vehicles {
    id
    reference
    brand
    model
    version
    type
    bodyType
    year
    registrationDate
    mileage
    price
    totalPrice
    fees
    fuel
    transmission
    power
    fiscalPower
    doors
    seats
    color
    co2Emission
    vin
    licensePlate
    weight
    location
    origin
    features
    options
    images
    sourceId
  }
}
```

### 3. Récupérer un véhicule spécifique par ID

Cette requête récupère les détails d'un véhicule spécifique.

```graphql
query GetVehicleById {
  vehicle(id: "mc-automobiles-68587") {
    id
    brand
    model
    version
    year
    price
    totalPrice
    mileage
    fuel
    color
    transmission
    features
    options
    images
    location
  }
}
```

### 4. Récupérer un véhicule avec expertise détaillée

Cette requête récupère un véhicule avec les détails de son expertise.

```graphql
query GetVehicleWithExpertise {
  vehicle(id: "mc-automobiles-68587") {
    id
    brand
    model
    version
    year
    mileage
    price
    
    # Champs d'expertise (spécifier explicitement les sous-champs désirés)
    expertise {
      date_expertise
      boite_motorisation
      pare_choc_av
      jantes_alu
      vitres_electriques
      gps
      bluetooth
      radar_recul
      feux_automatique
      phares
      sellerie
    }
    
    # Images et liens d'expertise
    expertiseUrl
    damageImages
    tourUrl
  }
}
```

## Requêtes de recherche et filtrage

### 1. Recherche de véhicules par marque

```graphql
query SearchByBrand {
  searchVehicles(filters: { brand: "AUDI" }) {
    items {
      id
      brand
      model
      version
      year
      price
      mileage
      fuel
      images
    }
    total
    page
    limit
    totalPages
  }
}
```

### 2. Recherche de véhicules par fourchette de prix

```graphql
query SearchByPriceRange {
  searchVehicles(
    filters: {
      minPrice: 20000
      maxPrice: 35000
    }
  ) {
    items {
      id
      brand
      model
      price
      year
      mileage
      fuel
    }
    total
  }
}
```

### 3. Recherche de véhicules récents avec kilométrage limité

```graphql
query SearchRecentLowMileage {
  searchVehicles(
    filters: {
      minYear: 2020
      maxMileage: 50000
    }
  ) {
    items {
      id
      brand
      model
      version
      year
      mileage
      price
      fuel
    }
    total
  }
}
```

### 4. Recherche avec plusieurs critères

```graphql
query SearchMultipleCriteria {
  searchVehicles(
    filters: {
      brand: "BMW"
      fuel: "DIESEL"
      minYear: 2018
      minPrice: 25000
      maxPrice: 45000
    }
  ) {
    items {
      id
      brand
      model
      version
      year
      mileage
      price
      fuel
      images
    }
    total
  }
}
```

### 5. Recherche par terme global

```graphql
query SearchByTerm {
  searchVehicles(
    filters: {
      search: "sportback quattro"
    }
  ) {
    items {
      id
      brand
      model
      version
      year
      price
    }
    total
  }
}
```

### 6. Recherche par type de carrosserie

```graphql
query SearchByBodyType {
  searchVehicles(
    filters: {
      bodyType: "SUV"
    }
  ) {
    items {
      id
      brand
      model
      bodyType
      year
      price
    }
    total
  }
}
```

## Requêtes avec pagination

### 1. Pagination de base

```graphql
query PaginatedSearch {
  searchVehicles(
    filters: { 
      brand: "RENAULT" 
    },
    pagination: {
      page: 1
      limit: 10
    }
  ) {
    items {
      id
      brand
      model
      version
      year
      price
    }
    total
    page
    limit
    totalPages
  }
}
```

### 2. Navigation entre les pages

```graphql
query NavigatePages {
  searchVehicles(
    filters: { 
      minPrice: 15000 
    },
    pagination: {
      page: 2
      limit: 5
    }
  ) {
    items {
      id
      brand
      model
      price
    }
    total
    page
    limit
    totalPages
  }
}
```

## Récupération des métadonnées

### Récupérer les valeurs distinctes pour les filtres

Cette requête est particulièrement utile pour construire des interfaces de filtrage dynamiques.

```graphql
query GetVehicleMetadata {
  vehicleMetadata {
    brands
    models
    versions
    fuels
    colors
    years
    bodyTypes
    transmissions
  }
}
```

## Requêtes pour l'affichage détaillé

### 1. Affichage complet d'un véhicule pour une page de détail

```graphql
query VehicleDetailPage {
  vehicle(id: "mc-automobiles-68587") {
    id
    brand
    model
    version
    year
    registrationDate
    mileage
    price
    totalPrice
    fees
    fuel
    transmission
    power
    fiscalPower
    doors
    seats
    color
    co2Emission
    weight
    bodyType
    
    features
    options
    missingFeatures
    
    images
    tourUrl
    
    expertise {
      date_expertise
      boite_motorisation
      pare_brise
      pare_choc_av
      anti_brouillard
      feux_av
      calandre
      capot
      nbre_places
      vitres_electriques
      jantes_alu
      gps
      bluetooth
      radar_recul
      feux_automatique
      phares
      sellerie
      retros_rab_elec
      accoudoir
    }
    
    expertiseUrl
    damageImages
    
    location
    licensePlate
    vin
    origin
    sourceId
  }
}
```

### 2. Affichage simplifié pour une liste de résultats

```graphql
query VehicleListings {
  searchVehicles(
    filters: {},
    pagination: {
      page: 1
      limit: 12
    }
  ) {
    items {
      id
      brand
      model
      version
      year
      mileage
      price
      fuel
      transmission
      color
      images
    }
    total
    totalPages
  }
}
```

## Exemples d'utilisation avec différents clients

### Exemple avec Axios

```javascript
const axios = require('axios');

async function fetchVehicles() {
  try {
    const response = await axios.post(
      'https://votre-app.railway.app/graphql',
      {
        query: `
          query {
            vehicles {
              id
              brand
              model
              price
              images
            }
          }
        `
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apollo-require-preflight': 'true'
        }
      }
    );
    
    console.log(response.data.data.vehicles);
    return response.data.data.vehicles;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
}
```

### Exemple avec Apollo Client

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://votre-app.railway.app/graphql',
  cache: new InMemoryCache(),
  headers: {
    'apollo-require-preflight': 'true',
  },
});

const GET_VEHICLES = gql`
  query {
    vehicles {
      id
      brand
      model
      price
      images
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

### Exemple avec Nuxt 3 et @nuxtjs/apollo

```typescript
// composables/useVehicles.ts
import { gql } from 'graphql-tag';

export const useVehicles = () => {
  const getVehicles = async () => {
    const { data } = await useAsyncQuery(gql`
      query {
        vehicles {
          id
          brand
          model
          version
          year
          price
          images
        }
      }
    `);
    
    return data.value?.vehicles || [];
  };
  
  const getVehicleById = async (id: string) => {
    const { data } = await useAsyncQuery(gql`
      query GetVehicle($id: ID!) {
        vehicle(id: $id) {
          id
          brand
          model
          version
          year
          mileage
          price
          fuel
          color
          images
          features
          options
        }
      }
    `, { id });
    
    return data.value?.vehicle;
  };
  
  const searchVehicles = async (filters = {}, page = 1, limit = 20) => {
    const { data } = await useAsyncQuery(gql`
      query SearchVehicles($filters: VehicleFilterInput, $pagination: PaginationInput) {
        searchVehicles(filters: $filters, pagination: $pagination) {
          items {
            id
            brand
            model
            version
            year
            price
            images
          }
          total
          page
          limit
          totalPages
        }
      }
    `, {
      filters,
      pagination: { page, limit }
    });
    
    return data.value?.searchVehicles;
  };
  
  return {
    getVehicles,
    getVehicleById,
    searchVehicles
  };
};
```

Utilisation dans un composant Vue:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useVehicles } from '~/composables/useVehicles';

const { getVehicles } = useVehicles();
const vehicles = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    loading.value = true;
    vehicles.value = await getVehicles();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div v-if="loading">Chargement en cours...</div>
    <div v-else-if="error">Erreur: {{ error }}</div>
    <div v-else>
      <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
        <img v-if="vehicle.images && vehicle.images.length" :src="vehicle.images[0]" alt="Photo du véhicule" />
        <h3>{{ vehicle.brand }} {{ vehicle.model }}</h3>
        <p>{{ vehicle.version }} ({{ vehicle.year }})</p>
        <p class="price">{{ vehicle.price.toLocaleString() }}€</p>
      </div>
    </div>
  </template>
</template>
```

### Exemple avec React et Apollo Client

```jsx
import { useQuery, gql } from '@apollo/client';

const GET_VEHICLES = gql`
  query {
    vehicles {
      id
      brand
      model
      version
      year
      price
      images
    }
  }
`;

function VehiclesList() {
  const { loading, error, data } = useQuery(GET_VEHICLES);

  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <div className="vehicles-grid">
      {data.vehicles.map((vehicle) => (
        <div key={vehicle.id} className="vehicle-card">
          {vehicle.images && vehicle.images.length > 0 && (
            <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} />
          )}
          <h3>{vehicle.brand} {vehicle.model}</h3>
          <p>{vehicle.version} ({vehicle.year})</p>
          <p className="price">{vehicle.price.toLocaleString()} €</p>
        </div>
      ))}
    </div>
  );
}
```

## Variables GraphQL pour requêtes dynamiques

### Recherche avec variables

```graphql
query SearchVehicles($filters: VehicleFilterInput!, $pagination: PaginationInput) {
  searchVehicles(filters: $filters, pagination: $pagination) {
    items {
      id
      brand
      model
      version
      year
      price
      mileage
      fuel
      images
    }
    total
    page
    limit
    totalPages
  }
}
```

Variables:
```json
{
  "filters": {
    "brand": "MERCEDES",
    "minYear": 2019,
    "maxPrice": 50000
  },
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

### Récupération d'un véhicule par ID avec variables

```graphql
query GetVehicle($id: ID!) {
  vehicle(id: $id) {
    id
    brand
    model
    version
    year
    price
    mileage
    fuel
    images
  }
}
```

Variables:
```json
{
  "id": "mc-automobiles-68587"
}
```

## Bonnes pratiques

1. **Spécifiez uniquement les champs dont vous avez besoin** pour optimiser les performances
2. **Utilisez des alias** pour les requêtes multiples ou complexes
3. **Utilisez des variables** pour rendre vos requêtes réutilisables
4. **Incluez l'en-tête `apollo-require-preflight: true`** pour éviter les erreurs CSRF
5. **Utilisez la pagination** pour les listes de véhicules afin d'améliorer les performances
6. **Spécifiez toujours des sous-champs** pour les objets complexes comme `expertise`
7. **Utilisez des fragments** pour réutiliser des portions de requêtes communes

Exemple de fragment:

```graphql
fragment VehicleBasicInfo on Vehicle {
  id
  brand
  model
  version
  year
  price
  mileage
  fuel
  images
}

query GetVehicles {
  vehicles {
    ...VehicleBasicInfo
  }
}

query GetVehicleById($id: ID!) {
  vehicle(id: $id) {
    ...VehicleBasicInfo
    features
    options
    expertise {
      date_expertise
      jantes_alu
      bluetooth
      gps
    }
  }
}
```

## Résolution de problèmes courants

### Erreur CSRF
Si vous recevez une erreur CSRF, assurez-vous d'avoir inclus l'en-tête `apollo-require-preflight: true` dans votre requête.

### Erreur lors de la récupération d'un champ d'expertise
N'oubliez pas que pour le champ `expertise`, vous devez toujours spécifier les sous-champs que vous souhaitez récupérer. Une requête comme celle-ci ne fonctionnera pas:

```graphql
# INCORRECT ❌
query {
  vehicle(id: "mc-automobiles-68587") {
    id
    expertise # Erreur - doit spécifier les sous-champs
  }
}
```

Utilisez plutôt:

```graphql
# CORRECT ✅
query {
  vehicle(id: "mc-automobiles-68587") {
    id
    expertise {
      date_expertise
      jantes_alu
      # autres sous-champs...
    }
  }
}
```

### Performances lentes sur les requêtes à grande échelle
Utilisez la pagination et limitez les champs demandés pour améliorer les performances.
