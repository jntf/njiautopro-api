import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleSource } from './sources/vehicle-source.interface';
import { McAutomobilesSource } from './sources/mc-automobiles/mc-automobiles.source';

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
      this.logger.error(`Error initializing data sources: ${error.message}`, error.stack);
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

  async search(filters: any): Promise<Vehicle[]> {
    const results = await Promise.all(
      this.sources.map((source) => source.searchVehicles(filters)),
    );
    return results.flat();
  }
}
