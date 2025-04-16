import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class SelectedFiltersInput {
  @Field(() => [String], { nullable: true })
  brands?: string[];
  
  @Field(() => [String], { nullable: true })
  models?: string[];
  
  @Field(() => [String], { nullable: true })
  versions?: string[];
  
  @Field(() => [String], { nullable: true })
  fuels?: string[];
  
  @Field(() => [String], { nullable: true })
  transmissions?: string[];
  
  @Field(() => [String], { nullable: true })
  bodyTypes?: string[];
  
  // Filtres numériques
  @Field(() => Int, { nullable: true })
  minYear?: number;
  
  @Field(() => Int, { nullable: true })
  maxYear?: number;
  
  @Field(() => Int, { nullable: true })
  minPrice?: number;
  
  @Field(() => Int, { nullable: true })
  maxPrice?: number;
  
  @Field(() => Int, { nullable: true })
  minMileage?: number;
  
  @Field(() => Int, { nullable: true })
  maxMileage?: number;
}