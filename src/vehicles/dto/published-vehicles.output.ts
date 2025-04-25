import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublishedVehiclesResponse {
  @Field(() => [String])
  vehicleIds: string[];
}
