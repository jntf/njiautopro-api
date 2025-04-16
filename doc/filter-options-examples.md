# Exemples d'utilisation des nouvelles requêtes de filtrage

Ce document contient des exemples d'utilisation des nouvelles requêtes GraphQL permettant un filtrage dynamique et en cascade des véhicules.

## 1. Requête `vehicleMetadata` étendue

La requête `vehicleMetadata` est maintenant capable d'accepter des filtres optionnels pour affiner les listes de valeurs distinctes.

### Obtenir toutes les métadonnées sans filtre

```graphql
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
```

### Obtenir les métadonnées filtrées par marque

```graphql
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

## 2. Nouvelle requête `filterOptions`

La nouvelle requête `filterOptions` est spécialement conçue pour prendre en charge le filtrage en cascade avec sélection multiple.

### Obtenir les modèles disponibles pour des marques spécifiques

```graphql
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
```

### Obtenir les marques disponibles pour certains types de carburant

```graphql
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
```

### Filtrage en cascade complexe

```graphql
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

### Obtenir les années disponibles pour une combinaison de filtres

```graphql
query {
  filterOptions(
    targetFilter: "year",
    selectedFilters: { 
      brands: ["Peugeot"],
      models: ["208"],
      fuels: ["Essence"] 
    }
  ) {
    options
    count
  }
}
```

## Implémentation côté front-end

Pour une expérience utilisateur optimale, il est recommandé d'implémenter les fonctionnalités suivantes dans l'interface Nuxt.js :

1. **Mise à jour dynamique des options de filtre :**
   - À chaque sélection d'un filtre, mettre à jour toutes les autres listes de filtres avec `filterOptions`
   - Conserver l'état de sélection dans un store Pinia

2. **Chargement optimisé :**
   - Mettre en cache les résultats des requêtes
   - Implémenter un système de chargement asynchrone pour éviter les blocages d'interface

3. **Sélection multiple :**
   - Permettre à l'utilisateur de sélectionner plusieurs valeurs pour chaque filtre
   - Mettre à jour l'interface pour refléter les options disponibles

## Exemple de flux d'utilisation

1. L'utilisateur arrive sur la page de recherche de véhicules
2. Le système charge toutes les options de filtres avec `vehicleMetadata`
3. L'utilisateur sélectionne "Peugeot" et "Renault" comme marques
4. Le système met à jour les options de modèles en appelant `filterOptions` avec `targetFilter: "model"`
5. L'utilisateur sélectionne "208" comme modèle
6. Le système met à jour toutes les autres listes de filtres (versions, carburants, transmissions, etc.)
7. L'utilisateur continue à affiner sa recherche...
