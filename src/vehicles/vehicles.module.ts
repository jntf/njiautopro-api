import { Module, forwardRef } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesResolver } from './vehicles.resolver';
import { McAutomobilesModule } from './sources/mc-automobiles/mc-automobiles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclePublication } from './entities/vehicle-publication.entity';
import { VehicleInterest } from './entities/vehicle-interest.entity';
import { Source } from '../sources/entities/source.entity';
import { PublicationsModule } from './publications/publications.module';

@Module({
  imports: [
    McAutomobilesModule,
    TypeOrmModule.forFeature([VehiclePublication, VehicleInterest, Source]),
    forwardRef(() => PublicationsModule)
  ],
  providers: [VehiclesResolver, VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
