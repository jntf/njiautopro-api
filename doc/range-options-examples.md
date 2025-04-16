# Exemples d'utilisation des plages numériques (années, kilométrage, prix)

Ce document contient des exemples d'utilisation de la nouvelle requête GraphQL `rangeOptions` permettant de récupérer les plages de valeurs pour les attributs numériques (année, kilométrage, prix) en fonction des filtres appliqués.

## Requête `rangeOptions`

La requête `rangeOptions` permet de récupérer la plage de valeurs disponibles (valeur minimale et maximale) pour un attribut numérique, en fonction des filtres déjà sélectionnés.

### Exemples d'utilisation

#### 1. Récupérer la plage d'années disponibles pour tous les véhicules

```graphql
query {
  rangeOptions(
    targetRange: "year"
  ) {
    min
    max
    count
  }
}
```

#### 2. Récupérer la plage de prix pour une marque spécifique

```graphql
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
```

#### 3. Récupérer la plage de kilométrage pour une combinaison de filtres

```graphql
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

## Utilisation avec les sliders dans l'interface utilisateur

Cette fonctionnalité est particulièrement utile pour créer des sliders de plages (min/max) dans l'interface utilisateur, qui s'adaptent dynamiquement en fonction des autres filtres sélectionnés.

### Exemple d'implémentation avec un slider

```vue
<script setup>
import { ref, watch, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// Filtres sélectionnés
const selectedFilters = ref({
  brands: [],
  models: [],
  fuels: [],
  // Valeurs pour les sliders, initialisées à null
  minPrice: null,
  maxPrice: null,
  minYear: null,
  maxYear: null,
  minMileage: null,
  maxMileage: null
});

// Plages de prix actuelles (min/max disponibles)
const priceRangeQuery = computed(() => {
  return gql`
    query {
      rangeOptions(
        targetRange: "price",
        selectedFilters: ${JSON.stringify(selectedFilters.value)}
      ) {
        min
        max
        count
      }
    }
  `;
});

const { result: priceRange } = useQuery(priceRangeQuery);

// Plages du slider de prix
const priceSliderRange = ref([0, 0]);

// Mise à jour des plages du slider quand les données sont chargées
watch(() => priceRange.value, (newValue) => {
  if (newValue?.rangeOptions) {
    const { min, max } = newValue.rangeOptions;
    // Si les valeurs actuelles ne sont pas définies, initialiser avec min/max
    if (selectedFilters.value.minPrice === null) {
      selectedFilters.value.minPrice = min;
    }
    if (selectedFilters.value.maxPrice === null) {
      selectedFilters.value.maxPrice = max;
    }
    // Mettre à jour les bornes du slider
    priceSliderRange.value = [min, max];
  }
}, { immediate: true });

// Mise à jour des filtres quand le slider change
const updatePriceFilter = (values) => {
  selectedFilters.value.minPrice = values[0];
  selectedFilters.value.maxPrice = values[1];
}
</script>

<template>
  <div>
    <h2>Filtres par prix</h2>
    
    <div v-if="priceRange?.rangeOptions">
      <p>{{ priceRange.rangeOptions.count }} véhicules disponibles</p>
      
      <!-- Exemple de slider avec min/max dynamiques -->
      <div class="price-slider">
        <span>{{ selectedFilters.minPrice || 0 }}€</span>
        
        <input 
          type="range" 
          :min="priceSliderRange[0]" 
          :max="priceSliderRange[1]"
          :value="selectedFilters.minPrice || priceSliderRange[0]"
          @input="updatePriceFilter([Number($event.target.value), selectedFilters.maxPrice])"
        />
        
        <input 
          type="range" 
          :min="priceSliderRange[0]" 
          :max="priceSliderRange[1]"
          :value="selectedFilters.maxPrice || priceSliderRange[1]"
          @input="updatePriceFilter([selectedFilters.minPrice, Number($event.target.value)])"
        />
        
        <span>{{ selectedFilters.maxPrice || 0 }}€</span>
      </div>
    </div>
  </div>
</template>
```

## Comportement en cascade

Cette fonctionnalité s'intègre parfaitement avec le filtrage en cascade:

1. L'utilisateur sélectionne une marque (par exemple "Peugeot")
2. Les plages de prix, d'années et de kilométrage se mettent à jour pour refléter uniquement les véhicules Peugeot
3. L'utilisateur sélectionne une plage d'années (par exemple 2018-2020)
4. Les plages de prix et de kilométrage se mettent à jour en conséquence
5. L'utilisateur continue à affiner sa recherche...

Cette approche permet de guider l'utilisateur dans sa recherche en ne lui présentant que des valeurs qui donneront des résultats, évitant ainsi les recherches sans résultat.
