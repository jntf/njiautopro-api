import { Vehicle } from '../entities/vehicle.entity';

export interface VehicleSource {
  sourceId: string;
  sourceName: string;

  initialize(): Promise<void>;
  getVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | null>;
  searchVehicles(filters: any): Promise<Vehicle[]>;
  refreshCache(): Promise<void>;
}
