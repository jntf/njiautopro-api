import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class RangeOptions {
  @Field(() => Int)
  min: number;
  
  @Field(() => Int)
  max: number;
  
  @Field(() => Int)
  count: number;
}