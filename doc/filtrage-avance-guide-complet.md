# Guide complet du filtrage avancé - API NJI Auto Pro

Ce document explique en détail comment implémenter et utiliser les fonctionnalités de filtrage avancé de l'API NJI Auto Pro, spécifiquement le filtrage en cascade et les plages de valeurs numériques.

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités de filtrage](#fonctionnalités-de-filtrage)
   - [Filtrage en cascade](#filtrage-en-cascade)
   - [Plages numériques](#plages-numériques)
3. [Requêtes GraphQL](#requêtes-graphql)
   - [filterOptions](#filteroptions)
   - [rangeOptions](#rangeoptions)
4. [Exemples pratiques](#exemples-pratiques)
   - [Interface de filtrage complète](#interface-de-filtrage-complète)
   - [Optimisation des performances](#optimisation-des-performances)
5. [Bonnes pratiques](#bonnes-pratiques)
6. [Dépannage](#dépannage)

## Vue d'ensemble

L'API NJI Auto Pro propose deux fonctionnalités principales pour créer une expérience de filtrage avancée dans votre interface utilisateur :

1. **Filtrage en cascade** : Permet de filtrer dynamiquement les options disponibles dans chaque filtre en fonction des autres filtres sélectionnés.
2. **Plages numériques** : Permet de définir des plages min/max pour les valeurs numériques (années, kilométrage, prix) en s'adaptant aux autres filtres.

Ces fonctionnalités combinées permettent de créer une interface de recherche intuitive où les utilisateurs ne voient que les options pertinentes et n'obtiennent jamais de résultats vides.

## Fonctionnalités de filtrage

### Filtrage en cascade

Le filtrage en cascade permet de mettre à jour dynamiquement les options disponibles pour chaque filtre en fonction des autres sélections. Par exemple :

- Si l'utilisateur sélectionne "Peugeot", seuls les modèles de Peugeot seront proposés
- Si l'utilisateur sélectionne "Diesel", seules les marques qui proposent des motorisations diesel seront disponibles
- Si l'utilisateur sélectionne plusieurs valeurs (ex: "Peugeot" et "Renault"), les options des autres filtres seront adaptées pour inclure les véhicules des deux marques

#### Avantages du filtrage en cascade

- Guide l'utilisateur vers des résultats pertinents
- Empêche les recherches sans résultat
- Donne une visibilité sur le nombre de véhicules disponibles à chaque étape
- Supporte les sélections multiples (plusieurs marques, carburants, etc.)

### Plages numériques

Les plages numériques permettent de filtrer sur des attributs quantitatifs comme l'année, le kilométrage et le prix. L'API retourne les valeurs minimales et maximales disponibles pour chaque attribut, ce qui permet :

- De créer des sliders avec des bornes pertinentes
- D'adapter ces bornes en fonction des autres filtres sélectionnés
- D'éviter les combinaisons de filtres qui ne donnent aucun résultat

#### Attributs numériques supportés

- **Année** (`year`) : Année du modèle
- **Kilométrage** (`mileage`) : Kilométrage en kilomètres
- **Prix** (`price`) : Prix en euros

## Requêtes GraphQL

### filterOptions

Cette requête permet de récupérer les options disponibles pour un filtre spécifique, en fonction des autres filtres sélectionnés.

#### Syntaxe

```graphql
query {
  filterOptions(
    targetFilter: String!,
    selectedFilters: SelectedFiltersInput
  ) {
    options
    count
  }
}
```

#### Paramètres

- `targetFilter` (obligatoire) : Le filtre pour lequel on souhaite récupérer les options disponibles. Valeurs possibles :
  - `"brand"` : Marques
  - `"model"` : Modèles
  - `"version"` : Versions
  - `"fuel"` : Carburants
  - `"transmission"` : Transmissions
  - `"bodyType"` : Types de carrosserie

- `selectedFilters` (optionnel) : Filtres déjà sélectionnés par l'utilisateur

#### Retour

- `options` : Liste des options disponibles (chaînes de caractères)
- `count` : Nombre de véhicules correspondant aux critères de filtrage

#### Exemple

```graphql
query {
  filterOptions(
    targetFilter: "model",
    selectedFilters: {
      brands: ["Peugeot", "Renault"],
      fuels: ["Diesel"]
    }
  ) {
    options
    count
  }
}
```

### rangeOptions

Cette requête permet de récupérer les plages de valeurs min/max pour un attribut numérique, en fonction des autres filtres sélectionnés.

#### Syntaxe

```graphql
query {
  rangeOptions(
    targetRange: String!,
    selectedFilters: SelectedFiltersInput
  ) {
    min
    max
    count
  }
}
```

#### Paramètres

- `targetRange` (obligatoire) : L'attribut numérique pour lequel on souhaite récupérer la plage. Valeurs possibles :
  - `"year"` : Années
  - `"mileage"` : Kilométrage
  - `"price"` : Prix

- `selectedFilters` (optionnel) : Filtres déjà sélectionnés par l'utilisateur

#### Retour

- `min` : Valeur minimale disponible
- `max` : Valeur maximale disponible
- `count` : Nombre de véhicules correspondant aux critères de filtrage

#### Exemple

```graphql
query {
  rangeOptions(
    targetRange: "price",
    selectedFilters: {
      brands: ["Peugeot"],
      models: ["208"],
      fuels: ["Essence"],
      minYear: 2018
    }
  ) {
    min
    max
    count
  }
}
```

## Exemples pratiques

### Interface de filtrage complète

Voici comment implémenter une interface de filtrage complète avec Nuxt 3 et Vue.js :

1. **Définir l'état des filtres** :
```javascript
const selectedFilters = ref({
  // Filtres catégoriels (sélection multiple)
  brands: [],
  models: [],
  fuels: [],
  transmissions: [],
  bodyTypes: [],
  
  // Filtres numériques (min/max)
  minYear: null,
  maxYear: null,
  minPrice: null,
  maxPrice: null,
  minMileage: null,
  maxMileage: null
});
```

2. **Créer des requêtes réactives** :
```javascript
// Pour les options de marques
const brandsQuery = computed(() => {
  return gql`
    query {
      filterOptions(
        targetFilter: "brand",
        selectedFilters: ${JSON.stringify(selectedFilters.value)}
      ) {
        options
        count
      }
    }
  `;
});

// Pour la plage de prix
const priceRangeQuery = computed(() => {
  // Exclure les filtres de prix pour éviter les références circulaires
  const filtersWithoutPrice = {...selectedFilters.value};
  delete filtersWithoutPrice.minPrice;
  delete filtersWithoutPrice.maxPrice;
  
  return gql`
    query {
      rangeOptions(
        targetRange: "price",
        selectedFilters: ${JSON.stringify(filtersWithoutPrice)}
      ) {
        min
        max
        count
      }
    }
  `;
});
```

3. **Exécuter les requêtes et observer les changements** :
```javascript
const { result: brandsResult } = useQuery(brandsQuery);
const { result: priceRange } = useQuery(priceRangeQuery);

watch(() => selectedFilters.value.brands, (newBrands) => {
  // Réinitialiser les modèles quand les marques changent
  if (newBrands.length === 0) {
    selectedFilters.value.models = [];
  }
}, { deep: true });
```

4. **Créer l'interface utilisateur** :
```vue
<template>
  <div>
    <!-- Filtres de marques -->
    <div v-if="brandsResult?.filterOptions">
      <h3>Marques ({{ brandsResult.filterOptions.count }} véhicules)</h3>
      <div v-for="brand in brandsResult.filterOptions.options" :key="brand">
        <input 
          type="checkbox" 
          :id="brand" 
          :value="brand" 
          v-model="selectedFilters.brands"
        >
        <label :for="brand">{{ brand }}</label>
      </div>
    </div>
    
    <!-- Slider de prix -->
    <div v-if="priceRange?.rangeOptions">
      <h3>Prix ({{ priceRange.rangeOptions.count }} véhicules)</h3>
      <p>De {{ selectedFilters.minPrice || priceRange.rangeOptions.min }}€ 
         à {{ selectedFilters.maxPrice || priceRange.rangeOptions.max }}€</p>
         
      <!-- Implémentation du slider -->
    </div>
  </div>
</template>
```

### Optimisation des performances

Pour optimiser les performances de l'interface de filtrage :

1. **Débouncer les requêtes** pour les sliders :
```javascript
const debouncedUpdatePrice = useDebounceFn((min, max) => {
  selectedFilters.value.minPrice = min;
  selectedFilters.value.maxPrice = max;
}, 300);
```

2. **Mettre en cache les résultats** :
```javascript
const { result: brandsResult } = useQuery(brandsQuery, null, {
  fetchPolicy: 'cache-and-network'
});
```

3. **Utiliser des requêtes indépendantes** pour chaque type de filtre pour éviter des re-rendus inutiles

## Bonnes pratiques

1. **Limiter les requêtes simultanées** : Ne pas exécuter toutes les requêtes de filtrage en même temps, mais les adapter au contexte utilisateur

2. **Offrir des filtres prédéfinis** pour les recherches courantes (ex: "Véhicules récents", "Petit budget", etc.)

3. **Préserver les filtres** entre les sessions utilisateur (via localStorage ou cookies)

4. **Proposer une réinitialisation rapide** de tous les filtres

5. **Afficher le nombre de résultats** à chaque étape pour guider l'utilisateur

## Dépannage

### Problèmes courants

1. **Les plages numériques retournent min=0, max=0**
   - Vérifiez que les filtres sélectionnés ne sont pas contradictoires
   - Assurez-vous qu'il existe des véhicules correspondant aux critères

2. **Le compteur de véhicules reste à 0 malgré le changement de filtres**
   - Vérifiez la syntaxe JSON des filtres envoyés
   - Assurez-vous que les valeurs numériques sont bien des nombres et non des chaînes

3. **Performances lentes avec de nombreux filtres**
   - Implémenter un système de mise en cache côté client
   - Débouncer les actions utilisateur, particulièrement sur les sliders
   - Limiter la fréquence des requêtes lors des changements rapides
