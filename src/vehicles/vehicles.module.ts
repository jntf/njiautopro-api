import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesResolver } from './vehicles.resolver';
import { McAutomobilesModule } from './sources/mc-automobiles/mc-automobiles.module';

@Module({
  imports: [McAutomobilesModule],
  providers: [VehiclesResolver, VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
