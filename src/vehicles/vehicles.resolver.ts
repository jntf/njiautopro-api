import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleFilterInput } from './dto/vehicle-filter.input';

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

  @Query(() => [Vehicle], { name: 'searchVehicles' })
  async search(@Args('filters', { nullable: true }) filters?: VehicleFilterInput) {
    return this.vehiclesService.search(filters || {});
  }
}
