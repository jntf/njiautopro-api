import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Vehicle } from '../entities/vehicle.entity';

@ObjectType()
export class PaginatedVehicles {
  @Field(() => [Vehicle])
  items: Vehicle[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
} 