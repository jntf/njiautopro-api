import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { VehicleSource } from '../vehicle-source.interface';
import { Vehicle } from '../../entities/vehicle.entity';
import { RawVehicle, VehicleData, McSourceConfig } from './mc-automobiles.types';
import { transformVehicle } from './mc-automobiles.transformer';

@Injectable()
export class McAutomobilesSource implements VehicleSource {
  private readonly logger = new Logger(McAutomobilesSource.name);
  readonly sourceId = 'mc-automobiles';
  readonly sourceName = 'MC Automobiles';
  
  private config: McSourceConfig = {
    url: 'https://www.mcautomobiles.com/gestion/export/mca-stock.xml',
    refreshInterval: 30 * 60 * 1000, // 30 minutes
  };
  
  private rawData: VehicleData | null = null;
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
      return this.vehicles.find(v => v.id === id || v.reference === rawId) || null;
    }
    
    // Sinon, on cherche par référence
    return this.vehicles.find(v => v.reference === id) || null;
  }
  
  async searchVehicles(filters: any): Promise<Vehicle[]> {
    await this.ensureFreshCache();
    
    let filteredVehicles = [...this.vehicles];
    
    // Appliquer les filtres
    if (filters) {
      if (filters.brand) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.brand.toLowerCase().includes(filters.brand.toLowerCase())
        );
      }
      
      if (filters.model) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.model.toLowerCase().includes(filters.model.toLowerCase())
        );
      }
      
      if (filters.fuel) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.fuel.toLowerCase() === filters.fuel.toLowerCase()
        );
      }
      
      if (filters.minPrice) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.price >= filters.minPrice
        );
      }
      
      if (filters.maxPrice) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.price <= filters.maxPrice
        );
      }
      
      if (filters.minYear) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.year >= filters.minYear
        );
      }
      
      if (filters.maxYear) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.year <= filters.maxYear
        );
      }
      
      if (filters.maxMileage) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.mileage <= filters.maxMileage
        );
      }
    }
    
    return filteredVehicles;
  }
  
  async refreshCache(): Promise<void> {
    try {
      this.logger.log('Refreshing cache from XML source');
      
      const response = await axios.get(this.config.url, {
        responseType: 'text'
      });
      
      const result = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true
      }) as VehicleData;
      
      this.rawData = result;
      this.lastFetchTime = Date.now();
      
      // Transformer les données
      const rawVehicles = Array.isArray(result.client.annonce) 
        ? result.client.annonce 
        : [result.client.annonce];
      
      this.vehicles = rawVehicles.map(vehicle => 
        transformVehicle(vehicle, this.sourceId)
      );
      
      this.logger.log(`Cache refreshed with ${this.vehicles.length} vehicles`);
    } catch (error) {
      this.logger.error(`Error refreshing cache: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  private async ensureFreshCache(): Promise<void> {
    const now = Date.now();
    if (!this.rawData || (now - this.lastFetchTime > this.config.refreshInterval)) {
      await this.refreshCache();
    }
  }
}
