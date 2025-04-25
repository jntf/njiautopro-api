import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsService } from './publications.service';
import { PublicationsResolver } from './publications.resolver';
import { VehiclePublication } from '../entities/vehicle-publication.entity';
import { VehicleInterest } from '../entities/vehicle-interest.entity';
import { Source } from '../../sources/entities/source.entity';
import { VehiclesService } from '../vehicles.service';
import { VehiclesModule } from '../vehicles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VehiclePublication, VehicleInterest, Source]),
    forwardRef(() => VehiclesModule)
  ],
  providers: [PublicationsService, PublicationsResolver],
  exports: [PublicationsService]
})
export class PublicationsModule {}
