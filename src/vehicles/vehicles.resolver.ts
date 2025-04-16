import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleFilterInput } from './dto/vehicle-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedVehicles } from './dto/paginated-vehicles.output';
import { VehicleMetadata } from './dto/vehicle-metadata.output';
import { FilterOptions } from './dto/filter-options.output';
import { RangeOptions } from './dto/range-options.output';
import { SelectedFiltersInput } from './dto/selected-filters.input';

@Resolver(() => Vehicle)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Query(() => [Vehicle], { name: 'vehicles' })
  async findAll() {
    return this.vehiclesService.findAll();
  }

  @Query(() => Vehicle, { name: 'vehicle', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Query(() => PaginatedVehicles, { name: 'searchVehicles' })
  async search(
    @Args('filters', { nullable: true }) filters?: VehicleFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.vehiclesService.search(filters || {}, pagination || { page: 1, limit: 20 });
  }

  @Query(() => VehicleMetadata, { 
    name: 'vehicleMetadata', 
    description: 'Récupère les métadonnées des véhicules avec filtrage optionnel' 
  })
  async getMetadata(
    @Args('filters', { nullable: true }) filters?: VehicleFilterInput,
  ) {
    return this.vehiclesService.getMetadata(filters);
  }

  @Query(() => FilterOptions, { 
    name: 'filterOptions', 
    description: 'Récupère les options de filtrage disponibles selon les filtres actuels' 
  })
  async getFilterOptions(
    @Args('targetFilter', { nullable: false }) targetFilter: string,
    @Args('selectedFilters', { nullable: true }) selectedFilters?: SelectedFiltersInput,
  ) {
    return this.vehiclesService.getFilterOptions(targetFilter, selectedFilters);
  }
  
  @Query(() => RangeOptions, { 
    name: 'rangeOptions', 
    description: 'Récupère les plages de valeurs numériques disponibles (année, kilométrage, prix) selon les filtres actuels' 
  })
  async getRangeOptions(
    @Args('targetRange', { nullable: false }) targetRange: string,
    @Args('selectedFilters', { nullable: true }) selectedFilters?: SelectedFiltersInput,
  ) {
    return this.vehiclesService.getRangeOptions(targetRange, selectedFilters);
  }
}