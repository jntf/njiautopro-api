import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleSource } from './sources/vehicle-source.interface';
import { McAutomobilesSource } from './sources/mc-automobiles/mc-automobiles.source';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedVehicles } from './dto/paginated-vehicles.output';
import { VehicleFilterInput } from './dto/vehicle-filter.input';
import { VehicleMetadata } from './dto/vehicle-metadata.output';

@Injectable()
export class VehiclesService implements OnModuleInit {
  private readonly logger = new Logger(VehiclesService.name);
  private sources: VehicleSource[] = [];

  constructor(private readonly mcAutomobilesSource: McAutomobilesSource) {}

  async onModuleInit() {
    // Ajouter les sources de données
    this.sources = [
      this.mcAutomobilesSource,
      // Ajouter d'autres sources ici au besoin
    ];

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
   * Récupère les métadonnées des véhicules (valeurs distinctes)
   * @returns Un objet contenant les listes de valeurs uniques
   */
  async getMetadata(): Promise<VehicleMetadata> {
    // Récupérer tous les véhicules
    const vehicles = await this.findAll();
    
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
}
