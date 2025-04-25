import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleSource } from './sources/vehicle-source.interface';
import { McAutomobilesSource } from './sources/mc-automobiles/mc-automobiles.source';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedVehicles } from './dto/paginated-vehicles.output';
import { VehicleFilterInput } from './dto/vehicle-filter.input';
import { VehicleMetadata } from './dto/vehicle-metadata.output';
import { FilterOptions } from './dto/filter-options.output';
import { RangeOptions } from './dto/range-options.output';
import { SelectedFiltersInput } from './dto/selected-filters.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePublication } from './entities/vehicle-publication.entity';

@Injectable()
export class VehiclesService implements OnModuleInit {
  private readonly logger = new Logger(VehiclesService.name);
  private sources: VehicleSource[] = [];
  private sourceMap: Map<string, VehicleSource> = new Map();

  constructor(
    private readonly mcAutomobilesSource: McAutomobilesSource,
    @InjectRepository(VehiclePublication)
    private publicationsRepository?: Repository<VehiclePublication>
  ) {}

  async onModuleInit() {
    // Ajouter les sources de données
    this.sources = [
      this.mcAutomobilesSource,
      // Ajouter d'autres sources ici au besoin
    ];
    
    for (const source of this.sources) {
      this.sourceMap.set(source.sourceId, source);
    }

    this.logger.log(`Initializing ${this.sources.length} vehicle data sources`);
    
    // Initialiser toutes les sources
    try {
      await Promise.all(this.sources.map((source) => source.initialize()));
      this.logger.log('All data sources initialized successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error initializing data sources: ${message}`, stack);
    }
  }

  async findAll(): Promise<Vehicle[]> {
    const vehiclesArrays = await Promise.all(
      this.sources.map((source) => source.getVehicles()),
    );
    return vehiclesArrays.flat();
  }

  async findOne(id: string): Promise<Vehicle | null> {
    for (const source of this.sources) {
      const vehicle = await source.getVehicleById(id);
      if (vehicle) return vehicle;
    }
    return null;
  }
  
  async findByInternalId(internalId: string): Promise<Vehicle | null> {
    if (!this.publicationsRepository) {
      throw new Error('Publications repository not available');
    }
    
    // Trouver la publication par ID interne
    const publication = await this.publicationsRepository.findOne({
      where: { internal_id: internalId }
    });
    
    if (!publication) return null;
    
    // Trouver le véhicule correspondant
    return this.findOne(publication.vehicle_id);
  }

  async search(
    filters: VehicleFilterInput,
    pagination: PaginationInput,
  ): Promise<PaginatedVehicles> {
    const results = await Promise.all(
      this.sources.map((source) => source.searchVehicles(filters)),
    );
    
    const allVehicles = results.flat();
    const total = allVehicles.length;
    
    // Calculer les indices de pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    
    // Appliquer la pagination
    const paginatedVehicles = allVehicles.slice(startIndex, endIndex);
    
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(total / pagination.limit);
    
    return {
      items: paginatedVehicles,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  /**
   * Récupère les métadonnées des véhicules (valeurs distinctes) avec possibilité de filtrage
   * @param filters Filtres optionnels à appliquer avant de récupérer les métadonnées
   * @returns Un objet contenant les listes de valeurs uniques
   */
  async getMetadata(filters?: VehicleFilterInput): Promise<VehicleMetadata> {
    // Récupérer tous les véhicules
    const allVehicles = await this.findAll();
    
    // Filtrer les véhicules si des filtres sont fournis
    let vehicles = allVehicles;
    
    if (filters) {
      vehicles = this.applyFiltersToVehicles(allVehicles, filters);
    }
    
    // Extraire les valeurs uniques pour chaque propriété
    const getUniqueValues = <T>(property: keyof Vehicle): T[] => {
      const values = new Set<T>();
      vehicles.forEach(vehicle => {
        const value = vehicle[property] as T;
        if (value !== undefined && value !== null) {
          values.add(value);
        }
      });
      return Array.from(values).sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') {
          return a - b;
        }
        return String(a).localeCompare(String(b));
      });
    };
    
    return {
      brands: getUniqueValues<string>('brand'),
      models: getUniqueValues<string>('model'),
      versions: getUniqueValues<string>('version'),
      fuels: getUniqueValues<string>('fuel'),
      colors: getUniqueValues<string>('color'),
      years: getUniqueValues<number>('year'),
      bodyTypes: getUniqueValues<string>('bodyType'),
      transmissions: getUniqueValues<string>('transmission'),
    };
  }

  /**
   * Récupère les options de filtrage disponibles en fonction des filtres déjà sélectionnés
   * @param targetFilter Le filtre cible pour lequel on veut les options disponibles
   * @param selectedFilters Les filtres déjà sélectionnés par l'utilisateur
   * @returns Les options disponibles et leur count
   */
  async getFilterOptions(
    targetFilter: string,
    selectedFilters?: SelectedFiltersInput
  ): Promise<FilterOptions> {
    // Récupérer tous les véhicules
    const allVehicles = await this.findAll();
    
    // Appliquer les filtres sélectionnés, sauf celui ciblé
    let filteredVehicles = allVehicles;
    
    if (selectedFilters) {
      filteredVehicles = this.applySelectedFiltersToVehicles(allVehicles, selectedFilters, targetFilter);
    }

    // Déterminer la propriété cible en fonction du targetFilter
    let targetProperty: keyof Vehicle;
    
    switch (targetFilter) {
      case 'brand':
        targetProperty = 'brand';
        break;
      case 'model':
        targetProperty = 'model';
        break;
      case 'version':
        targetProperty = 'version';
        break;
      case 'fuel':
        targetProperty = 'fuel';
        break;
      case 'transmission':
        targetProperty = 'transmission';
        break;
      case 'bodyType':
        targetProperty = 'bodyType';
        break;
      case 'year':
        targetProperty = 'year';
        break;
      case 'color':
        targetProperty = 'color';
        break;
      default:
        throw new Error(`Filtre cible inconnu: ${targetFilter}`);
    }
    
    // Extraire les valeurs uniques et leur nombre d'occurrences
    const valueCounts = new Map<string, number>();
    
    filteredVehicles.forEach(vehicle => {
      const value = String(vehicle[targetProperty]);
      if (value !== undefined && value !== null) {
        const count = valueCounts.get(value) || 0;
        valueCounts.set(value, count + 1);
      }
    });
    
    // Trier les options par valeur
    const sortedOptions = Array.from(valueCounts.keys()).sort((a, b) => {
      if (targetProperty === 'year') {
        return Number(b) - Number(a); // Années décroissantes
      }
      return a.localeCompare(b); // Ordre alphabétique pour le reste
    });
    
    return {
      options: sortedOptions,
      count: filteredVehicles.length
    };
  }
  
  /**
   * Récupère les plages de valeurs numériques disponibles en fonction des filtres déjà sélectionnés
   * @param targetRange Le champ pour lequel on veut les plages (year, mileage, price)
   * @param selectedFilters Les filtres déjà sélectionnés par l'utilisateur
   * @returns La plage minimale et maximale disponible et le nombre de véhicules
   */
  async getRangeOptions(
    targetRange: string,
    selectedFilters?: SelectedFiltersInput
  ): Promise<RangeOptions> {
    // Récupérer tous les véhicules
    const allVehicles = await this.findAll();
    
    // Appliquer les filtres sélectionnés, sauf celui ciblé
    let filteredVehicles = allVehicles;
    
    if (selectedFilters) {
      // On détermine quels filtres min/max doivent être ignorés en fonction de targetRange
      const excludeFilters: string[] = [];
      
      if (targetRange === 'year') {
        excludeFilters.push('minYear', 'maxYear');
      } else if (targetRange === 'mileage') {
        excludeFilters.push('minMileage', 'maxMileage');
      } else if (targetRange === 'price') {
        excludeFilters.push('minPrice', 'maxPrice');
      }
      
      // Créons une copie des filtres sans les plages à exclure
      const filtersWithoutTargetRange = { ...selectedFilters };
      for (const filter of excludeFilters) {
        delete filtersWithoutTargetRange[filter];
      }
      
      filteredVehicles = this.applySelectedFiltersToVehicles(allVehicles, filtersWithoutTargetRange, 'none');
    }
    
    // Déterminer la propriété cible en fonction du targetRange
    let targetProperty: keyof Vehicle;
    
    switch (targetRange) {
      case 'year':
        targetProperty = 'year';
        break;
      case 'mileage':
        targetProperty = 'mileage';
        break;
      case 'price':
        targetProperty = 'price';
        break;
      default:
        throw new Error(`Plage cible inconnue: ${targetRange}`);
    }
    
    // Calculer les valeurs min et max
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    
    filteredVehicles.forEach(vehicle => {
      const value = vehicle[targetProperty] as number;
      if (value !== undefined && value !== null) {
        if (value < min) min = value;
        if (value > max) max = value;
      }
    });
    
    // Gérer le cas où il n'y a pas de véhicules correspondants
    if (filteredVehicles.length === 0 || min === Number.MAX_SAFE_INTEGER) {
      min = 0;
      max = 0;
    }
    
    return {
      min,
      max,
      count: filteredVehicles.length
    };
  }

  /**
   * Récupère les identifiants des véhicules publiés
   */
  async getPublishedVehicles(): Promise<{ vehicleIds: string[] }> {
    if (!this.publicationsRepository) {
      return { vehicleIds: [] };
    }
    
    const publications = await this.publicationsRepository.find({
      where: { published: true },
      select: ['vehicle_id']
    });
    
    return {
      vehicleIds: publications.map(pub => pub.vehicle_id)
    };
  }

  /**
   * Applique les filtres VehicleFilterInput à une liste de véhicules
   * @param vehicles Liste de véhicules à filtrer
   * @param filters Filtres à appliquer
   * @returns Liste filtrée de véhicules
   */
  private applyFiltersToVehicles(vehicles: Vehicle[], filters: VehicleFilterInput): Vehicle[] {
    return vehicles.filter(vehicle => {
      // Appliquer chaque filtre si présent
      if (filters.brand && vehicle.brand !== filters.brand) {
        return false;
      }
      
      if (filters.model && vehicle.model !== filters.model) {
        return false;
      }
      
      if (filters.fuel && vehicle.fuel !== filters.fuel) {
        return false;
      }
      
      if (filters.bodyType && vehicle.bodyType !== filters.bodyType) {
        return false;
      }
      
      if (filters.maxMileage && vehicle.mileage > filters.maxMileage) {
        return false;
      }
      
      if (filters.minPrice && vehicle.price < filters.minPrice) {
        return false;
      }
      
      if (filters.maxPrice && vehicle.price > filters.maxPrice) {
        return false;
      }
      
      if (filters.minYear && vehicle.year < filters.minYear) {
        return false;
      }
      
      if (filters.maxYear && vehicle.year > filters.maxYear) {
        return false;
      }
      
      // Recherche textuelle
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchFields = [
          vehicle.brand,
          vehicle.model,
          vehicle.version,
          vehicle.fuel,
          vehicle.bodyType,
          vehicle.transmission,
          vehicle.color,
          vehicle.reference,
          vehicle.vin,
          vehicle.licensePlate
        ].map(field => (field || '').toLowerCase());
        
        if (!searchFields.some(field => field.includes(searchLower))) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Applique les filtres sélectionnés à une liste de véhicules, en excluant le filtre ciblé
   * @param vehicles Liste de véhicules à filtrer
   * @param selectedFilters Filtres sélectionnés
   * @param excludeFilter Filtre à exclure de l'application
   * @returns Liste filtrée de véhicules
   */
  private applySelectedFiltersToVehicles(
    vehicles: Vehicle[],
    selectedFilters: SelectedFiltersInput,
    excludeFilter: string
  ): Vehicle[] {
    return vehicles.filter(vehicle => {
      // Filtre par marques
      if (selectedFilters.brands && selectedFilters.brands.length > 0 && excludeFilter !== 'brand') {
        if (!selectedFilters.brands.includes(vehicle.brand)) {
          return false;
        }
      }
      
      // Filtre par modèles
      if (selectedFilters.models && selectedFilters.models.length > 0 && excludeFilter !== 'model') {
        if (!selectedFilters.models.includes(vehicle.model)) {
          return false;
        }
      }
      
      // Filtre par versions
      if (selectedFilters.versions && selectedFilters.versions.length > 0 && excludeFilter !== 'version') {
        if (!selectedFilters.versions.includes(vehicle.version)) {
          return false;
        }
      }
      
      // Filtre par carburant
      if (selectedFilters.fuels && selectedFilters.fuels.length > 0 && excludeFilter !== 'fuel') {
        if (!selectedFilters.fuels.includes(vehicle.fuel)) {
          return false;
        }
      }
      
      // Filtre par transmission
      if (selectedFilters.transmissions && selectedFilters.transmissions.length > 0 && excludeFilter !== 'transmission') {
        if (!selectedFilters.transmissions.includes(vehicle.transmission)) {
          return false;
        }
      }
      
      // Filtre par type de carrosserie
      if (selectedFilters.bodyTypes && selectedFilters.bodyTypes.length > 0 && excludeFilter !== 'bodyType') {
        if (!selectedFilters.bodyTypes.includes(vehicle.bodyType)) {
          return false;
        }
      }
      
      // Filtre par année minimum
      if (selectedFilters.minYear && excludeFilter !== 'year') {
        if (vehicle.year < selectedFilters.minYear) {
          return false;
        }
      }
      
      // Filtre par année maximum
      if (selectedFilters.maxYear && excludeFilter !== 'year') {
        if (vehicle.year > selectedFilters.maxYear) {
          return false;
        }
      }
      
      // Filtre par prix minimum
      if (selectedFilters.minPrice && excludeFilter !== 'price') {
        if (vehicle.price < selectedFilters.minPrice) {
          return false;
        }
      }
      
      // Filtre par prix maximum
      if (selectedFilters.maxPrice && excludeFilter !== 'price') {
        if (vehicle.price > selectedFilters.maxPrice) {
          return false;
        }
      }
      
      // Filtre par kilométrage minimum
      if (selectedFilters.minMileage && excludeFilter !== 'mileage') {
        if (vehicle.mileage < selectedFilters.minMileage) {
          return false;
        }
      }
      
      // Filtre par kilométrage maximum
      if (selectedFilters.maxMileage && excludeFilter !== 'mileage') {
        if (vehicle.mileage > selectedFilters.maxMileage) {
          return false;
        }
      }
      
      return true;
    });
  }
}