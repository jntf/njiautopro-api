import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleFilterInput } from './dto/vehicle-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedVehicles } from './dto/paginated-vehicles.output';
import { VehicleMetadata } from './dto/vehicle-metadata.output';

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

  @Query(() => VehicleMetadata, { name: 'vehicleMetadata', description: 'Récupère les métadonnées des véhicules (listes de valeurs distinctes)' })
  async getMetadata() {
    return this.vehiclesService.getMetadata();
  }
}
