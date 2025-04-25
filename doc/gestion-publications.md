# Guide de gestion des publications

Ce document décrit le système de publication de véhicules de l'API NJI Auto Pro, qui permet de contrôler quels véhicules sont rendus publics, de suivre leur popularité et de gérer leur prix affiché.

## Vue d'ensemble

Le système de publications permet de :

1. **Publier/dépublier** des véhicules spécifiques
2. **Personnaliser les prix** des véhicules publiés
3. **Appliquer des remises** sur les véhicules
4. **Suivre l'intérêt** des utilisateurs (vues, favoris, contacts)
5. **Historiser les modifications de prix**

## Modèle de données

### Publication de véhicule

```typescript
export class VehiclePublication {
  id: number;
  vehicle_id: string;
  source_id: number;
  internal_id: string;
  published: boolean;
  price_override: number | null;
  price_history: PriceHistoryEntry[];
  discount: number | null;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  source: Source;
  interest: VehicleInterest;
}
```

### Suivi d'intérêt

```typescript
export class VehicleInterest {
  id: number;
  view_count: number;
  favorite_count: number;
  contact_count: number;
  last_view_at: Date | null;
  metadata: Record<string, any>;
  publication_id: number;
  
  // Relations
  publication: VehiclePublication;
}
```

### Entrée d'historique de prix

```typescript
export class PriceHistoryEntry {
  price: number;
  date: string;
}
```

## Requêtes GraphQL disponibles

### Récupérer toutes les publications

Cette requête, réservée aux administrateurs, retourne toutes les publications (publiées ou non).

```graphql
query {
  publications {
    id
    vehicle_id
    internal_id
    published
    price_override
    discount
    created_at
    updated_at
    source {
      id
      name
    }
    interest {
      view_count
      favorite_count
      contact_count
      last_view_at
    }
  }
}
```

### Récupérer les publications actives

Cette requête, accessible à tous, retourne uniquement les véhicules publiés.

```graphql
query {
  publishedVehicles {
    id
    vehicle_id
    internal_id
    price_override
    discount
    interest {
      view_count
      favorite_count
    }
    source {
      id
      name
    }
  }
}
```

### Récupérer une publication par identifiant interne

```graphql
query {
  publicationByInternalId(internalId: "550e8400-e29b-41d4-a716-446655440000") {
    id
    vehicle_id
    price_override
    discount
    interest {
      view_count
      favorite_count
      contact_count
      last_view_at
    }
  }
}
```

### Récupérer les identifiants des véhicules publiés

```graphql
query {
  publishedVehicleIds {
    vehicleIds
  }
}
```

## Mutations GraphQL disponibles

### Publier un véhicule

Cette mutation, réservée aux administrateurs, publie un véhicule avec des options de prix.

```graphql
mutation {
  publishVehicle(
    vehicleId: "mc-automobiles-12345",
    sourceId: 1,
    priceOverride: 25000,
    discount: 5.0
  ) {
    id
    internal_id
    published
    price_override
    discount
  }
}
```

### Dépublier un véhicule

```graphql
mutation {
  unpublishVehicle(publicationId: 1) {
    id
    published
  }
}
```

### Mettre à jour le prix d'une publication

```graphql
mutation {
  updatePublicationPrice(
    publicationId: 1,
    priceOverride: 24500
  ) {
    id
    price_override
    price_history {
      price
      date
    }
  }
}
```

### Mettre à jour la remise d'une publication

```graphql
mutation {
  updatePublicationDiscount(
    publicationId: 1,
    discount: 7.5
  ) {
    id
    discount
  }
}
```

### Suivre l'intérêt des utilisateurs

Ces mutations sont accessibles à tous et permettent de suivre l'interaction des utilisateurs avec les véhicules.

```graphql
# Enregistrer une vue
mutation {
  trackVehicleView(internalId: "550e8400-e29b-41d4-a716-446655440000")
}

# Enregistrer un ajout aux favoris
mutation {
  trackVehicleFavorite(internalId: "550e8400-e29b-41d4-a716-446655440000")
}

# Enregistrer une demande de contact
mutation {
  trackVehicleContact(internalId: "550e8400-e29b-41d4-a716-446655440000")
}
```

## Exemples d'utilisation

### Workflow de publication

1. **Récupérer les véhicules disponibles**
   ```graphql
   query {
     vehicles {
       id
       brand
       model
       price
     }
   }
   ```

2. **Publier un véhicule**
   ```graphql
   mutation {
     publishVehicle(
       vehicleId: "mc-automobiles-12345",
       sourceId: 1,
       priceOverride: 25000
     ) {
       id
       internal_id
     }
   }
   ```

3. **Récupérer les véhicules publiés**
   ```graphql
   query {
     publishedVehicles {
       vehicle_id
       internal_id
       price_override
     }
   }
   ```

4. **Suivre la popularité des véhicules**
   ```graphql
   query {
     publications {
       id
       vehicle_id
       interest {
         view_count
         favorite_count
         contact_count
         last_view_at
       }
     }
   }
   ```

## Intégration avec le frontend

### Affichage des véhicules publiés uniquement

Pour n'afficher que les véhicules publiés dans une interface utilisateur :

```vue
<script setup>
import { ref } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// Récupérer les IDs des véhicules publiés
const { result: publishedIds } = useQuery(gql`
  query {
    publishedVehicleIds {
      vehicleIds
    }
  }
`);

// Récupérer tous les véhicules
const { result: allVehicles } = useQuery(gql`
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

// Filtrer les véhicules pour n'afficher que ceux qui sont publiés
const vehicles = computed(() => {
  if (!allVehicles.value || !publishedIds.value) return [];
  
  const ids = publishedIds.value.publishedVehicleIds.vehicleIds;
  return allVehicles.value.vehicles.filter(v => ids.includes(v.id));
});
</script>

<template>
  <div>
    <h1>Véhicules disponibles</h1>
    <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
      <img :src="vehicle.images[0]" alt="Vehicle" />
      <h3>{{ vehicle.brand }} {{ vehicle.model }}</h3>
      <p>{{ vehicle.price }}€</p>
    </div>
  </div>
</template>
```

### Suivi de l'intérêt utilisateur

Exemple d'intégration pour suivre les vues et les ajouts aux favoris :

```vue
<script setup>
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const props = defineProps({
  internalId: {
    type: String,
    required: true
  }
});

// Mutation pour enregistrer une vue
const { mutate: trackView } = useMutation(gql`
  mutation TrackView($internalId: ID!) {
    trackVehicleView(internalId: $internalId)
  }
`);

// Mutation pour enregistrer un favori
const { mutate: trackFavorite } = useMutation(gql`
  mutation TrackFavorite($internalId: ID!) {
    trackVehicleFavorite(internalId: $internalId)
  }
`);

// Enregistrer une vue à l'affichage du composant
onMounted(() => {
  trackView({ internalId: props.internalId });
});

// Fonction pour ajouter aux favoris
const addToFavorites = () => {
  trackFavorite({ internalId: props.internalId });
  alert('Ajouté aux favoris !');
};
</script>

<template>
  <div class="vehicle-details">
    <!-- Détails du véhicule -->
    <button @click="addToFavorites">
      <i class="heart-icon"></i> Ajouter aux favoris
    </button>
  </div>
</template>
```

## Gestion des prix et remises

Le système permet de gérer plusieurs scénarios de tarification :

1. **Prix de base** : Utilisation du prix d'origine du véhicule
2. **Prix personnalisé** : Définition d'un prix spécifique (via `price_override`)
3. **Prix avec remise** : Application d'une remise en pourcentage (via `discount`)

Le prix final est calculé selon la formule :
```
prix_final = prix_effectif * (1 - remise / 100)
```
où `prix_effectif` est soit le prix d'origine, soit le prix personnalisé s'il est défini.

### Historique des prix

Chaque modification du prix d'un véhicule est automatiquement enregistrée dans un historique, ce qui permet de :

- Suivre l'évolution des prix
- Analyser les stratégies de tarification
- Justifier les modifications de prix auprès des clients

## Utilisation avancée

### Publication conditionnelle

Vous pouvez créer des règles métier pour automatiser la publication de véhicules selon certains critères :

```typescript
// Exemple : publier automatiquement tous les véhicules de moins de 3 ans
async function publishNewVehicles() {
  const currentYear = new Date().getFullYear();
  const newVehicles = await vehiclesService.search({
    minYear: currentYear - 3
  });
  
  for (const vehicle of newVehicles.items) {
    await publicationsService.publishVehicle(vehicle.id, 1);
  }
}
```

### Analyse des statistiques d'intérêt

Les données d'intérêt peuvent être utilisées pour établir des rapports sur les véhicules les plus populaires :

```typescript
// Exemple : récupérer les 5 véhicules les plus vus
async function getMostViewedVehicles() {
  const publications = await publicationsRepository.find({
    relations: ['interest'],
    order: {
      interest: {
        view_count: 'DESC'
      }
    },
    take: 5
  });
  
  return publications;
}
```

## Bonnes pratiques

1. **Utilisez l'ID interne** pour les références publiques aux véhicules plutôt que l'ID direct
2. **Historisez les changements de prix** pour maintenir la transparence
3. **Surveillez les statistiques d'intérêt** pour optimiser votre offre
4. **Appliquez des remises temporaires** plutôt que de modifier le prix de base
5. **Synchronisez régulièrement** la liste des publications avec les véhicules disponibles

## Dépannage

### Problème : Un véhicule publié n'apparaît pas sur le frontend

Vérifiez que :
- Le véhicule est marqué comme `published: true`
- L'ID interne est correctement transmis
- Le prix personnalisé n'est pas à 0 si défini

### Problème : Les statistiques d'intérêt ne s'incrémentent pas

Vérifiez que :
- Les mutations de suivi sont correctement appelées
- L'ID interne utilisé est valide
- Les relations sont correctement chargées dans les requêtes

## Conclusion

Le système de publications offre un contrôle fin sur la visibilité, la tarification et le suivi des véhicules. En l'utilisant efficacement, vous pouvez optimiser votre processus de vente, ajuster votre stratégie commerciale en fonction des tendances observées et améliorer l'expérience utilisateur de votre application.
