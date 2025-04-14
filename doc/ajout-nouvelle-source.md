# Guide d'ajout d'une nouvelle source de données

Ce document explique comment ajouter une nouvelle source de données de véhicules à l'API NJI Auto Pro.

## Architecture de l'API

L'API est conçue selon un modèle d'abstraction qui permet d'intégrer facilement de nouvelles sources de données. Chaque source implémente une interface commune `VehicleSource`, ce qui permet au service principal `VehiclesService` de traiter toutes les sources de manière uniforme.

## Étapes d'ajout d'une nouvelle source

### 1. Créer le dossier de la source

Créez un nouveau dossier dans `src/vehicles/sources/` pour votre nouvelle source, par exemple `src/vehicles/sources/ma-nouvelle-source/`.

### 2. Définir les types spécifiques à la source

Créez un fichier `ma-nouvelle-source.types.ts` qui définit les interfaces pour les données brutes spécifiques à votre source :

```typescript
// src/vehicles/sources/ma-nouvelle-source/ma-nouvelle-source.types.ts

export interface RawVehicleNouvelle {
  // Définissez ici la structure des données brutes de votre source
  id: string;
  marque: string;
  modele: string;
  // ... autres propriétés spécifiques à votre source
}

export interface NouvelleSourceConfig {
  url: string;
  apiKey?: string;
  refreshInterval: number; // en millisecondes
}
```

### 3. Créer un transformateur

Créez un fichier `ma-nouvelle-source.transformer.ts` qui contient les fonctions de transformation des données brutes en objets `Vehicle` :

```typescript
// src/vehicles/sources/ma-nouvelle-source/ma-nouvelle-source.transformer.ts

import { RawVehicleNouvelle } from './ma-nouvelle-source.types';
import { Vehicle } from '../../entities/vehicle.entity';

/**
 * Transforme les données brutes en objet Vehicle
 */
export function transformVehicle(rawVehicle: RawVehicleNouvelle, sourceId: string): Vehicle {
  return {
    id: `${sourceId}-${rawVehicle.id}`,
    reference: rawVehicle.id,
    brand: rawVehicle.marque,
    model: rawVehicle.modele,
    // Transformez toutes les propriétés nécessaires
    // Assurez-vous de remplir tous les champs obligatoires du type Vehicle
    // Pour les champs manquants, utilisez des valeurs par défaut appropriées
    
    // ...
    
    // N'oubliez pas d'ajouter l'origine
    origin: 'Nom de votre nouvelle source',
    // Et l'ID de la source
    sourceId: sourceId
  };
}
```

### 4. Implémenter la source

Créez un fichier `ma-nouvelle-source.source.ts` qui implémente l'interface `VehicleSource` :

```typescript
// src/vehicles/sources/ma-nouvelle-source/ma-nouvelle-source.source.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { VehicleSource } from '../vehicle-source.interface';
import { Vehicle } from '../../entities/vehicle.entity';
import { RawVehicleNouvelle, NouvelleSourceConfig } from './ma-nouvelle-source.types';
import { transformVehicle } from './ma-nouvelle-source.transformer';
import { VehicleFilterInput } from '../../dto/vehicle-filter.input';

@Injectable()
export class MaNouvelleSource implements VehicleSource {
  private readonly logger = new Logger(MaNouvelleSource.name);
  readonly sourceId = 'ma-nouvelle-source';
  readonly sourceName = 'Ma Nouvelle Source';
  
  private config: NouvelleSourceConfig = {
    url: 'https://api.ma-nouvelle-source.com/vehicles',
    apiKey: 'votre-clé-api',
    refreshInterval: 30 * 60 * 1000, // 30 minutes
  };
  
  private rawData: any = null;
  private vehicles: Vehicle[] = [];
  private lastFetchTime: number = 0;
  
  constructor() {
    this.logger.log(`Initializing ${this.sourceName} source`);
  }
  
  async initialize(): Promise<void> {
    await this.refreshCache();
  }
  
  async getVehicles(): Promise<Vehicle[]> {
    await this.ensureFreshCache();
    return this.vehicles;
  }
  
  async getVehicleById(id: string): Promise<Vehicle | null> {
    await this.ensureFreshCache();
    
    // Si l'ID contient le préfixe de notre source
    if (id.startsWith(`${this.sourceId}-`)) {
      const rawId = id.replace(`${this.sourceId}-`, '');
      return (
        this.vehicles.find((v) => v.id === id || v.reference === rawId) || null
      );
    }
    
    // Sinon, on cherche par référence
    return this.vehicles.find((v) => v.reference === id) || null;
  }
  
  async searchVehicles(filters: VehicleFilterInput): Promise<Vehicle[]> {
    await this.ensureFreshCache();
    
    let filteredVehicles = [...this.vehicles];
    
    // Appliquer les filtres
    if (filters) {
      // Implémentez ici tous les filtres similaires à ceux de McAutomobilesSource
      // ...
    }
    
    return filteredVehicles;
  }
  
  async refreshCache(): Promise<void> {
    try {
      this.logger.log('Refreshing cache from API source');
      
      const response = await axios.get(this.config.url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        }
      });
      
      // Supposons que la réponse contient un tableau de véhicules
      const rawVehicles: RawVehicleNouvelle[] = response.data;
      
      this.rawData = rawVehicles;
      this.lastFetchTime = Date.now();
      
      // Transformer les données
      this.vehicles = rawVehicles.map((vehicle) => 
        transformVehicle(vehicle, this.sourceId)
      );
      
      this.logger.log(`Cache refreshed with ${this.vehicles.length} vehicles`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error refreshing cache: ${message}`, stack);
      throw error;
    }
  }
  
  private async ensureFreshCache(): Promise<void> {
    const now = Date.now();
    if (!this.rawData || now - this.lastFetchTime > this.config.refreshInterval) {
      await this.refreshCache();
    }
  }
}
```

### 5. Créer un module pour la source

Créez un fichier `ma-nouvelle-source.module.ts` :

```typescript
// src/vehicles/sources/ma-nouvelle-source/ma-nouvelle-source.module.ts

import { Module } from '@nestjs/common';
import { MaNouvelleSource } from './ma-nouvelle-source.source';

@Module({
  providers: [MaNouvelleSource],
  exports: [MaNouvelleSource],
})
export class MaNouvelleSourceModule {}
```

### 6. Mettre à jour le fichier d'index des sources

Modifiez le fichier `src/vehicles/sources/index.ts` pour exporter votre nouvelle source :

```typescript
// src/vehicles/sources/index.ts

// Exporter toutes les sources de données
export * from './mc-automobiles/mc-automobiles.source';
export * from './mc-automobiles/mc-automobiles.module';
export * from './ma-nouvelle-source/ma-nouvelle-source.source';
export * from './ma-nouvelle-source/ma-nouvelle-source.module';
```

### 7. Importer le module de la source dans le module des véhicules

Modifiez le fichier `src/vehicles/vehicles.module.ts` pour importer votre nouveau module :

```typescript
// src/vehicles/vehicles.module.ts

import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesResolver } from './vehicles.resolver';
import { McAutomobilesModule } from './sources/mc-automobiles/mc-automobiles.module';
import { MaNouvelleSourceModule } from './sources/ma-nouvelle-source/ma-nouvelle-source.module';

@Module({
  imports: [McAutomobilesModule, MaNouvelleSourceModule],
  providers: [VehiclesResolver, VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
```

### 8. Ajouter la source au service des véhicules

Modifiez le fichier `src/vehicles/vehicles.service.ts` pour injecter et utiliser votre nouvelle source :

```typescript
// src/vehicles/vehicles.service.ts

// ... imports existants
import { MaNouvelleSource } from './sources/ma-nouvelle-source/ma-nouvelle-source.source';

@Injectable()
export class VehiclesService implements OnModuleInit {
  private readonly logger = new Logger(VehiclesService.name);
  private sources: VehicleSource[] = [];

  constructor(
    private readonly mcAutomobilesSource: McAutomobilesSource,
    private readonly maNouvelleSource: MaNouvelleSource
  ) {}

  async onModuleInit() {
    // Ajouter les sources de données
    this.sources = [
      this.mcAutomobilesSource,
      this.maNouvelleSource,
      // Ajouter d'autres sources ici au besoin
    ];

    // ... reste du code inchangé
  }

  // ... reste des méthodes inchangées
}
```

## Adapter la source à des formats de données différents

Selon le format des données de votre nouvelle source, vous devrez peut-être adapter les méthodes de récupération et de transformation :

### Pour une API REST JSON

```typescript
async refreshCache(): Promise<void> {
  try {
    const response = await axios.get(this.config.url, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    // Traiter les données JSON
    const rawVehicles = response.data;
    // ...
  } catch (error) {
    // ...
  }
}
```

### Pour un fichier XML

```typescript
async refreshCache(): Promise<void> {
  try {
    const response = await axios.get(this.config.url, {
      responseType: 'text'
    });
    
    const result = (await parseStringPromise(response.data, {
      explicitArray: false,
      mergeAttrs: true
    }));
    
    // Traiter les données XML
    // ...
  } catch (error) {
    // ...
  }
}
```

### Pour une API GraphQL

```typescript
async refreshCache(): Promise<void> {
  try {
    const response = await axios.post(this.config.url, {
      query: `
        query {
          vehicles {
            id
            brand
            model
            # ... autres champs nécessaires
          }
        }
      `,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Traiter les données GraphQL
    const rawVehicles = response.data.data.vehicles;
    // ...
  } catch (error) {
    // ...
  }
}
```

## Tests

N'oubliez pas de créer des tests pour votre nouvelle source :

```typescript
// src/vehicles/sources/ma-nouvelle-source/ma-nouvelle-source.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MaNouvelleSource } from './ma-nouvelle-source.source';
import axios from 'axios';
import { VehicleFilterInput } from '../../dto/vehicle-filter.input';

// Mock pour axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MaNouvelleSource', () => {
  let source: MaNouvelleSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaNouvelleSource],
    }).compile();

    source = module.get<MaNouvelleSource>(MaNouvelleSource);
  });

  it('should be defined', () => {
    expect(source).toBeDefined();
  });

  describe('refreshCache', () => {
    it('should fetch and transform data', async () => {
      // Configurer le mock
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            id: '123',
            marque: 'AUDI',
            modele: 'A3',
            // ... autres propriétés
          },
          // ... autres véhicules
        ]
      });

      await source.refreshCache();
      
      // Vérifier que les données ont été correctement transformées
      const vehicles = await source.getVehicles();
      expect(vehicles.length).toBeGreaterThan(0);
      expect(vehicles[0].brand).toBe('AUDI');
      // ... autres assertions
    });
  });

  describe('searchVehicles', () => {
    beforeEach(async () => {
      // Configurer le mock et initialiser le cache
      mockedAxios.get.mockResolvedValue({
        data: [
          {
            id: '123',
            marque: 'AUDI',
            modele: 'A3',
            // ... autres propriétés
          },
          {
            id: '456',
            marque: 'BMW',
            modele: 'Serie 3',
            // ... autres propriétés
          },
          // ... autres véhicules
        ]
      });

      await source.refreshCache();
    });

    it('should filter vehicles by brand', async () => {
      const filters: VehicleFilterInput = {
        brand: 'AUDI'
      };

      const filteredVehicles = await source.searchVehicles(filters);
      
      expect(filteredVehicles.length).toBeGreaterThan(0);
      filteredVehicles.forEach(vehicle => {
        expect(vehicle.brand).toBe('AUDI');
      });
    });

    // ... autres tests de filtrage
  });
});
```

## Exemples de transformations spécifiques

### Transformation de dates

Il est souvent nécessaire de transformer des formats de date :

```typescript
// Convertir une date au format DD/MM/YYYY en objet Date
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Les mois dans Date sont 0-indexed
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
}

// Puis dans votre transformateur :
const registrationDate = parseDate(rawVehicle.dateMiseEnCirculation);
return {
  // ...
  registrationDate: registrationDate ? registrationDate.toISOString().split('T')[0] : '',
  // ...
};
```

### Normalisation des marques et modèles

Il est souvent utile de normaliser les noms de marques et modèles pour faciliter les recherches :

```typescript
// Fonction pour normaliser les noms de marques
function normalizeBrand(brand: string): string {
  const brandMap: Record<string, string> = {
    'MERCEDES': 'MERCEDES-BENZ',
    'MERCEDES BENZ': 'MERCEDES-BENZ',
    'VW': 'VOLKSWAGEN',
    // ... autres mappings
  };
  
  const normalizedBrand = brand.toUpperCase().trim();
  return brandMap[normalizedBrand] || normalizedBrand;
}

// Puis dans votre transformateur :
return {
  // ...
  brand: normalizeBrand(rawVehicle.marque),
  // ...
};
```

### Calcul de valeurs dérivées

Certaines propriétés peuvent nécessiter des calculs :

```typescript
// Calculer l'âge du véhicule en années
function calculateAge(year: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - year;
}

// Puis dans votre transformateur :
const year = parseInt(rawVehicle.annee, 10);
return {
  // ...
  year: year,
  age: calculateAge(year), // Si vous avez ajouté ce champ au modèle Vehicle
  // ...
};
```

## Gestion des erreurs

Il est important de bien gérer les erreurs lors de la récupération et de la transformation des données :

```typescript
async refreshCache(): Promise<void> {
  try {
    // Votre code pour récupérer les données...
  } catch (error) {
    // Journaliser l'erreur
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    this.logger.error(`Error refreshing cache: ${message}`, stack);
    
    // Vous pouvez aussi implémenter une stratégie de retry
    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      this.logger.log(`Retrying (${this.retryCount}/${this.config.maxRetries})...`);
      
      // Attendre avant de réessayer (avec backoff exponentiel)
      const delay = this.config.retryDelay * Math.pow(2, this.retryCount - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Réessayer
      return this.refreshCache();
    }
    
    // Si on a atteint le nombre maximum de retries, on lance l'erreur
    throw error;
  }
}
```

## Intégration de sources payantes ou avec authentification

Si votre source nécessite une authentification plus complexe, vous pouvez implémenter un système de gestion de tokens :

```typescript
private async getAuthToken(): Promise<string> {
  // Vérifier si le token existe et est encore valide
  if (this.authToken && this.tokenExpiry > Date.now()) {
    return this.authToken;
  }
  
  // Sinon, obtenir un nouveau token
  try {
    const response = await axios.post(this.config.authUrl, {
      username: this.config.username,
      password: this.config.password,
    });
    
    this.authToken = response.data.token;
    // Définir l'expiration (par exemple, 1h avant l'expiration réelle)
    this.tokenExpiry = Date.now() + (response.data.expiresIn * 1000) - 3600000;
    
    return this.authToken;
  } catch (error) {
    this.logger.error('Failed to obtain auth token');
    throw error;
  }
}

async refreshCache(): Promise<void> {
  try {
    // Obtenir un token valide
    const token = await this.getAuthToken();
    
    // Utiliser le token dans la requête
    const response = await axios.get(this.config.url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // ... reste du code
  } catch (error) {
    // ... gestion des erreurs
  }
}
```

## Conclusion

En suivant ce guide, vous pourrez intégrer facilement de nouvelles sources de données de véhicules à l'API NJI Auto Pro. La conception modulaire de l'application permet d'ajouter, de modifier ou de supprimer des sources sans affecter le reste du système.

N'oubliez pas de respecter l'interface `VehicleSource` et de vous assurer que toutes les propriétés obligatoires du type `Vehicle` sont correctement remplies lors de la transformation des données.
