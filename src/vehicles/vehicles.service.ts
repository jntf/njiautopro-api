import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleSource } from './sources/vehicle-source.interface';
import { McAutomobilesSource } from './sources/mc-automobiles/mc-automobiles.source';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedVehicles } from './dto/paginated-vehicles.output';
import { VehicleFilterInput } from './dto/vehicle-filter.input';

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
}
