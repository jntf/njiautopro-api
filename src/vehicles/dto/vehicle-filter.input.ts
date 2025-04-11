import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class VehicleFilterInput {
  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  fuel?: string;

  @Field({ nullable: true })
  bodyType?: string;

  @Field(() => Int, { nullable: true })
  minYear?: number;

  @Field(() => Int, { nullable: true })
  maxYear?: number;

  @Field(() => Int, { nullable: true })
  minPrice?: number;

  @Field(() => Int, { nullable: true })
  maxPrice?: number;

  @Field(() => Int, { nullable: true })
  maxMileage?: number;

  @Field({ nullable: true })
  search?: string;
}
