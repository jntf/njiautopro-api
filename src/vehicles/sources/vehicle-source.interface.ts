import { Vehicle } from '../entities/vehicle.entity';
import { VehicleFilterInput } from '../dto/vehicle-filter.input';

export interface VehicleSource {
  sourceId: string;
  sourceName: string;

  initialize(): Promise<void>;
  getVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | null>;
  searchVehicles(filters: VehicleFilterInput): Promise<Vehicle[]>;
  refreshCache(): Promise<void>;
}
