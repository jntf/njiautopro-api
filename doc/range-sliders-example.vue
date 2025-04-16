<script setup>
import { ref, computed, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// État global des filtres
const selectedFilters = ref({
  // Filtres catégoriels
  brands: [],
  models: [],
  fuels: [],
  transmissions: [],
  bodyTypes: [],
  
  // Filtres de plages numériques
  minYear: null,
  maxYear: null,
  minPrice: null,
  maxPrice: null,
  minMileage: null,
  maxMileage: null
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

// Requêtes réactives pour les plages
const yearRangeQuery = computed(() => {
  // Créer une copie des filtres sans les plages d'années
  const filtersWithoutYear = {...selectedFilters.value};
  delete filtersWithoutYear.minYear;
  delete filtersWithoutYear.maxYear;
  
  return gql`
    query {
      rangeOptions(
        targetRange: "year",
        selectedFilters: ${JSON.stringify(filtersWithoutYear)}
      ) {
        min
        max
        count
      }
    }
  `;
});

const priceRangeQuery = computed(() => {
  // Créer une copie des filtres sans les plages de prix
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

const mileageRangeQuery = computed(() => {
  // Créer une copie des filtres sans les plages de kilométrage
  const filtersWithoutMileage = {...selectedFilters.value};
  delete filtersWithoutMileage.minMileage;
  delete filtersWithoutMileage.maxMileage;
  
  return gql`
    query {
      rangeOptions(
        targetRange: "mileage",
        selectedFilters: ${JSON.stringify(filtersWithoutMileage)}
      ) {
        min
        max
        count
      }
    }
  `;
});

// Exécuter les requêtes
const { result: yearRange } = useQuery(yearRangeQuery);
const { result: priceRange } = useQuery(priceRangeQuery);
const { result: mileageRange } = useQuery(mileageRangeQuery);

// Plages actuelles des sliders
const yearSliderRange = ref([0, 0]);
const priceSliderRange = ref([0, 0]);
const mileageSliderRange = ref([0, 0]);

// Mise à jour des plages quand les données sont chargées
watch(() => yearRange.value, (newValue) => {
  if (newValue?.rangeOptions) {
    const { min, max } = newValue.rangeOptions;
    yearSliderRange.value = [min, max];
    
    // Initialiser les valeurs sélectionnées si elles sont nulles
    if (selectedFilters.value.minYear === null) {
      selectedFilters.value.minYear = min;
    }
    if (selectedFilters.value.maxYear === null) {
      selectedFilters.value.maxYear = max;
    }
  }
}, { immediate: true });

watch(() => priceRange.value, (newValue) => {
  if (newValue?.rangeOptions) {
    const { min, max } = newValue.rangeOptions;
    priceSliderRange.value = [min, max];
    
    if (selectedFilters.value.minPrice === null) {
      selectedFilters.value.minPrice = min;
    }
    if (selectedFilters.value.maxPrice === null) {
      selectedFilters.value.maxPrice = max;
    }
  }
}, { immediate: true });

watch(() => mileageRange.value, (newValue) => {
  if (newValue?.rangeOptions) {
    const { min, max } = newValue.rangeOptions;
    mileageSliderRange.value = [min, max];
    
    if (selectedFilters.value.minMileage === null) {
      selectedFilters.value.minMileage = min;
    }
    if (selectedFilters.value.maxMileage === null) {
      selectedFilters.value.maxMileage = max;
    }
  }
}, { immediate: true });

// Fonctions pour mettre à jour les filtres
const updateYearFilter = (min, max) => {
  selectedFilters.value.minYear = min;
  selectedFilters.value.maxYear = max;
};

const updatePriceFilter = (min, max) => {
  selectedFilters.value.minPrice = min;
  selectedFilters.value.maxPrice = max;
};

const updateMileageFilter = (min, max) => {
  selectedFilters.value.minMileage = min;
  selectedFilters.value.maxMileage = max;
};

// Fonction pour effectuer la recherche
const searchVehicles = () => {
  // Implémenter la recherche avec les filtres sélectionnés
  console.log('Recherche avec les filtres:', selectedFilters.value);
};

// Options pour formater les nombres
const formatNumber = (value, type) => {
  if (type === 'price') {
    return `${value.toLocaleString('fr-FR')}€`;
  } else if (type === 'mileage') {
    return `${value.toLocaleString('fr-FR')} km`;
  }
  return value;
};
</script>

<template>
  <div class="vehicle-filters">
    <h1>Recherche de véhicules</h1>
    
    <!-- Filtres catégoriels -->
    <div class="filter-section">
      <h2>Marques</h2>
      <div v-if="metadataResult?.vehicleMetadata" class="filter-options">
        <div v-for="brand in metadataResult.vehicleMetadata.brands" :key="brand" class="filter-option">
          <input 
            type="checkbox" 
            :id="`brand-${brand}`" 
            :value="brand" 
            v-model="selectedFilters.brands"
          >
          <label :for="`brand-${brand}`">{{ brand }}</label>
        </div>
      </div>
    </div>
    
    <!-- Filtre de modèles (pas inclus dans cet exemple) -->
    
    <!-- Slider pour les années -->
    <div class="filter-section">
      <h2>Année</h2>
      <div v-if="yearRange?.rangeOptions" class="range-slider">
        <div class="range-values">
          <span>{{ selectedFilters.minYear }}</span>
          <span>{{ selectedFilters.maxYear }}</span>
        </div>
        
        <!-- Utilisation d'un slider double avec une bibliothèque comme vue-slider-component -->
        <!-- Exemple simplifié avec deux inputs pour illustration -->
        <div class="slider-controls">
          <input 
            type="range" 
            :min="yearSliderRange[0]" 
            :max="yearSliderRange[1]"
            :value="selectedFilters.minYear"
            @input="updateYearFilter(parseInt($event.target.value), selectedFilters.maxYear)"
            class="min-slider"
          />
          
          <input 
            type="range" 
            :min="yearSliderRange[0]" 
            :max="yearSliderRange[1]"
            :value="selectedFilters.maxYear"
            @input="updateYearFilter(selectedFilters.minYear, parseInt($event.target.value))"
            class="max-slider"
          />
        </div>
        
        <div class="vehicles-count">
          {{ yearRange.rangeOptions.count }} véhicules disponibles
        </div>
      </div>
    </div>
    
    <!-- Slider pour les prix -->
    <div class="filter-section">
      <h2>Prix</h2>
      <div v-if="priceRange?.rangeOptions" class="range-slider">
        <div class="range-values">
          <span>{{ formatNumber(selectedFilters.minPrice, 'price') }}</span>
          <span>{{ formatNumber(selectedFilters.maxPrice, 'price') }}</span>
        </div>
        
        <div class="slider-controls">
          <input 
            type="range" 
            :min="priceSliderRange[0]" 
            :max="priceSliderRange[1]"
            :value="selectedFilters.minPrice"
            @input="updatePriceFilter(parseInt($event.target.value), selectedFilters.maxPrice)"
            class="min-slider"
          />
          
          <input 
            type="range" 
            :min="priceSliderRange[0]" 
            :max="priceSliderRange[1]"
            :value="selectedFilters.maxPrice"
            @input="updatePriceFilter(selectedFilters.minPrice, parseInt($event.target.value))"
            class="max-slider"
          />
        </div>
        
        <div class="vehicles-count">
          {{ priceRange.rangeOptions.count }} véhicules disponibles
        </div>
      </div>
    </div>
    
    <!-- Slider pour le kilométrage -->
    <div class="filter-section">
      <h2>Kilométrage</h2>
      <div v-if="mileageRange?.rangeOptions" class="range-slider">
        <div class="range-values">
          <span>{{ formatNumber(selectedFilters.minMileage, 'mileage') }}</span>
          <span>{{ formatNumber(selectedFilters.maxMileage, 'mileage') }}</span>
        </div>
        
        <div class="slider-controls">
          <input 
            type="range" 
            :min="mileageSliderRange[0]" 
            :max="mileageSliderRange[1]"
            :value="selectedFilters.minMileage"
            @input="updateMileageFilter(parseInt($event.target.value), selectedFilters.maxMileage)"
            class="min-slider"
          />
          
          <input 
            type="range" 
            :min="mileageSliderRange[0]" 
            :max="mileageSliderRange[1]"
            :value="selectedFilters.maxMileage"
            @input="updateMileageFilter(selectedFilters.minMileage, parseInt($event.target.value))"
            class="max-slider"
          />
        </div>
        
        <div class="vehicles-count">
          {{ mileageRange.rangeOptions.count }} véhicules disponibles
        </div>
      </div>
    </div>
    
    <!-- Bouton de recherche -->
    <div class="search-button">
      <button @click="searchVehicles">Rechercher</button>
    </div>
  </div>
</template>

<style scoped>
.vehicle-filters {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.filter-section {
  margin-bottom: 30px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-option {
  display: flex;
  align-items: center;
}

.range-slider {
  margin-top: 10px;
}

.range-values {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.slider-controls {
  position: relative;
  height: 40px;
}

.min-slider, .max-slider {
  position: absolute;
  width: 100%;
  top: 0;
  pointer-events: all;
}

.vehicles-count {
  margin-top: 10px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.search-button {
  margin-top: 20px;
  text-align: center;
}

.search-button button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.search-button button:hover {
  background-color: #45a049;
}
</style>
