import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class FilterOptions {
  @Field(() => [String])
  options: string[];
  
  @Field(() => Int)
  count: number;
}