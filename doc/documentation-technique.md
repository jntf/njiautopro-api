# Documentation Technique NJI Auto Pro API

## Vue d'ensemble

NJI Auto Pro API est une API GraphQL développée avec NestJS qui permet d'accéder aux données de véhicules provenant de différentes sources. Actuellement, l'API intègre la source "MC Automobiles" via un flux XML, mais l'architecture est conçue pour faciliter l'ajout d'autres sources.

## Configuration technique

- **Framework**: NestJS v11
- **Type d'API**: GraphQL avec Apollo Server
- **Mode d'opération**: Code-first avec génération automatique du schéma GraphQL
- **Déploiement**: Compatible avec Railway (recommandé) et Vercel

## Points de terminaison

L'API dispose d'un seul point de terminaison GraphQL:

```
https://votre-domaine.com/graphql
```

## Requêtes GraphQL disponibles

### 1. Récupérer tous les véhicules

Cette requête permet de récupérer la liste complète des véhicules sans aucun filtre.

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
    # Autres champs disponibles...
  }
}
```

#### Champs disponibles:
- `id` (ID!): Identifiant unique du véhicule
- `reference` (String!): Référence du véhicule
- `type` (String!): Type de véhicule
- `bodyType` (String!): Type de carrosserie
- `brand` (String!): Marque
- `model` (String!): Modèle
- `version` (String!): Version
- `fuel` (String!): Type de carburant
- `year` (Int!): Année de mise en circulation
- `registrationDate` (String!): Date de mise en circulation
- `mileage` (Int!): Kilométrage
- `doors` (Int!): Nombre de portes
- `seats` (Int!): Nombre de sièges
- `color` (String!): Couleur
- `transmission` (String!): Type de transmission
- `power` (Int!): Puissance réelle (en ch)
- `fiscalPower` (Int!): Puissance fiscale
- `price` (Int!): Prix (hors frais)
- `vatRate` (Int!): Taux de TVA
- `fees` (Int!): Frais
- `features` ([String!]!): Équipements
- `missingFeatures` ([String!]!): Équipements absents
- `options` ([String!]!): Options
- `co2Emission` (Int!): Émissions de CO2
- `images` ([String!]!): URLs des images
- `location` (String!): Emplacement du véhicule
- `licensePlate` (String!): Plaque d'immatriculation
- `vin` (String!): Numéro VIN
- `weight` (Int!): Poids
- `totalPrice` (Int!): Prix total (prix + frais)
- `sourceId` (String): Identifiant de la source
- `tourUrl` (String): URL d'une visite virtuelle (si disponible)
- `expertiseUrl` (String): URL du rapport d'expertise (si disponible)
- `expertise` (Expertise): Détails de l'expertise (si disponible)
- `damageImages` ([String!]): Images des dommages (si disponible)
- `newValue` (Int): Valeur à neuf (si disponible)
- `origin` (String!): Origine du véhicule

### 2. Récupérer un véhicule par ID

Cette requête permet de récupérer un véhicule spécifique par son identifiant.

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

#### Arguments:
- `id` (ID!): Identifiant unique du véhicule (format: "source-id")

#### Champs disponibles:
- Tous les champs listés dans la requête "vehicles"

### 3. Rechercher des véhicules avec filtres

Cette requête permet de rechercher des véhicules en appliquant différents filtres.

```graphql
query {
  searchVehicles(
    filters: {
      brand: "AUDI",
      minPrice: 20000,
      maxPrice: 30000,
      minYear: 2020
      # Autres filtres disponibles...
    },
    pagination: {
      page: 1,
      limit: 20
    }
  ) {
    items {
      id
      brand
      model
      version
      price
      year
      # Plus de champs disponibles...
    }
    total
    page
    limit
    totalPages
  }
}
```

#### Arguments:
- `filters` (VehicleFilterInput): Critères de filtrage
  - `brand` (String): Filtre par marque
  - `model` (String): Filtre par modèle
  - `fuel` (String): Filtre par type de carburant
  - `bodyType` (String): Filtre par type de carrosserie
  - `minYear` (Int): Année minimum
  - `maxYear` (Int): Année maximum
  - `minPrice` (Int): Prix minimum
  - `maxPrice` (Int): Prix maximum
  - `maxMileage` (Int): Kilométrage maximum
  - `search` (String): Terme de recherche global (recherche dans marque, modèle et version)

- `pagination` (PaginationInput): Options de pagination
  - `page` (Int): Numéro de page (défaut: 1)
  - `limit` (Int): Nombre d'éléments par page (défaut: 20)

#### Champs de retour:
- `items` ([Vehicle!]!): Liste des véhicules correspondant aux critères
- `total` (Int!): Nombre total de véhicules correspondant aux critères
- `page` (Int!): Numéro de page actuel
- `limit` (Int!): Nombre d'éléments par page
- `totalPages` (Int!): Nombre total de pages

### 4. Requête avec expertise détaillée

Cette requête permet de récupérer un véhicule avec les détails de son expertise.

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
      boite_motorisation
      jantes_alu
      bluetooth
      gps
      radar_recul
      feux_automatique
      climatisation
      # Autres champs d'expertise disponibles...
    }
    expertiseUrl
    damageImages
  }
}
```

#### Champs d'expertise disponibles:
- `date_expertise`: Date de l'expertise
- `boite_motorisation`: Informations sur la boîte de vitesse/motorisation
- `pare_brise`: État du pare-brise
- `pare_choc_av`: État du pare-choc avant
- `anti_brouillard`: Présence/état des feux anti-brouillard
- `feux_av`: État des feux avant
- `calandre`: État de la calandre
- `capot`: État du capot
- `nbre_places`: Nombre de places
- `vitres_electriques`: Présence de vitres électriques
- `jantes_alu`: Présence de jantes en aluminium
- `gps`: Présence d'un système GPS
- `bluetooth`: Présence de connectivité Bluetooth
- `radar_recul`: Présence de radar de recul
- `feux_automatique`: Présence de feux automatiques
- `phares`: État des phares
- `sellerie`: État de la sellerie
- `retros_rab_elec`: Présence de rétroviseurs rabattables électriquement
- `accoudoir`: Présence d'accoudoirs

### 5. Récupérer les métadonnées des véhicules

Cette requête permet de récupérer les valeurs distinctes pour différents attributs des véhicules, utile pour construire des filtres dans l'interface utilisateur.

```graphql
query {
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

#### Champs de retour:
- `brands` ([String!]!): Liste des marques disponibles
- `models` ([String!]!): Liste des modèles disponibles
- `versions` ([String!]!): Liste des versions disponibles
- `fuels` ([String!]!): Liste des types de carburant disponibles
- `colors` ([String!]!): Liste des couleurs disponibles
- `years` ([Int!]!): Liste des années disponibles
- `bodyTypes` ([String!]!): Liste des types de carrosserie disponibles
- `transmissions` ([String!]!): Liste des types de transmission disponibles

## Modèles de données

### Vehicle

Représente un véhicule complet avec toutes ses caractéristiques.

```typescript
type Vehicle {
  id: ID!
  reference: String!
  type: String!
  bodyType: String!
  brand: String!
  model: String!
  version: String!
  fuel: String!
  year: Int!
  registrationDate: String!
  mileage: Int!
  doors: Int!
  seats: Int!
  color: String!
  transmission: String!
  power: Int!
  fiscalPower: Int!
  price: Int!
  vatRate: Int!
  fees: Int!
  features: [String!]!
  missingFeatures: [String!]!
  options: [String!]!
  co2Emission: Int!
  images: [String!]!
  location: String!
  licensePlate: String!
  vin: String!
  weight: Int!
  tourUrl: String
  expertiseUrl: String
  expertise: Expertise
  damageImages: [String!]
  newValue: Int
  origin: String!
  totalPrice: Int!
  sourceId: String
}
```

### Expertise

Représente les détails d'expertise d'un véhicule.

```typescript
type Expertise {
  date_expertise: String
  boite_motorisation: String
  pare_brise: String
  pare_choc_av: String
  anti_brouillard: String
  feux_av: String
  calandre: String
  capot: String
  nbre_places: String
  vitres_electriques: String
  jantes_alu: String
  gps: String
  bluetooth: String
  radar_recul: String
  feux_automatique: String
  phares: String
  sellerie: String
  retros_rab_elec: String
  accoudoir: String
  # D'autres champs peuvent être présents selon les données d'expertise disponibles
}
```

### VehicleFilterInput

Utilisé pour filtrer les véhicules lors des recherches.

```typescript
input VehicleFilterInput {
  brand: String
  model: String
  fuel: String
  bodyType: String
  minYear: Int
  maxYear: Int
  minPrice: Int
  maxPrice: Int
  maxMileage: Int
  search: String
}
```

### PaginationInput

Utilisé pour paginer les résultats.

```typescript
input PaginationInput {
  page: Int = 1
  limit: Int = 20
}
```

### PaginatedVehicles

Représente un résultat paginé de véhicules.

```typescript
type PaginatedVehicles {
  items: [Vehicle!]!
  total: Int!
  page: Int!
  limit: Int!
  totalPages: Int!
}
```

### VehicleMetadata

Représente les métadonnées des véhicules pour la construction de filtres.

```typescript
type VehicleMetadata {
  brands: [String!]!
  models: [String!]!
  versions: [String!]!
  fuels: [String!]!
  colors: [String!]!
  years: [Int!]!
  bodyTypes: [String!]!
  transmissions: [String!]!
}
```

## Implémentation technique

### Sources de données

Actuellement, l'API intègre la source "MC Automobiles" via un flux XML, mais l'architecture est conçue pour faciliter l'ajout d'autres sources de données. Chaque source doit implémenter l'interface `VehicleSource`.

```typescript
export interface VehicleSource {
  sourceId: string;
  sourceName: string;

  initialize(): Promise<void>;
  getVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | null>;
  searchVehicles(filters: VehicleFilterInput): Promise<Vehicle[]>;
  refreshCache(): Promise<void>;
}
```

### Intégration avec des clients

#### Avec Apollo Client (JavaScript/TypeScript)

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

#### Avec Nuxt 3

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

## Bonnes pratiques

1. **Spécifiez toujours des sous-champs pour les objets complexes** (comme `expertise`)
2. **Incluez l'en-tête `apollo-require-preflight`** pour éviter les erreurs CSRF
3. **Gardez vos requêtes légères** en ne demandant que les champs nécessaires
4. **Utilisez les filtres et la pagination** pour réduire la quantité de données transférées
5. **Utilisez la recherche globale** (`search`) pour une expérience utilisateur plus fluide

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

## Extension de l'API

Pour ajouter une nouvelle source de données:

1. Créez un dossier pour la nouvelle source dans `src/vehicles/sources/`
2. Implémentez l'interface `VehicleSource`
3. Créez un module pour la source et exportez-le
4. Ajoutez la source au service `VehiclesService`

```typescript
// Dans vehicles.service.ts
constructor(
  private readonly mcAutomobilesSource: McAutomobilesSource,
  private readonly nouvelleSource: NouvelleSource
) {}

async onModuleInit() {
  // Ajouter les sources de données
  this.sources = [
    this.mcAutomobilesSource,
    this.nouvelleSource,
    // Ajouter d'autres sources ici au besoin
  ];
  
  // ...
}
```

## Déploiement

### Railway (Recommandé)
1. Connectez votre dépôt Git à Railway
2. Utilisez les paramètres par défaut
3. Pour résoudre les problèmes CSRF: utilisez le module `railway.app.module.ts` qui désactive la protection CSRF ou configurez-la correctement

### Vercel
1. Importez votre projet sur Vercel
2. Utilisez les paramètres:
   - Framework Preset: Other
   - Build Command: npm run vercel-build
   - Output Directory: dist
3. Utilisez le module `app.module.vercel.ts` spécifiquement configuré pour Vercel
