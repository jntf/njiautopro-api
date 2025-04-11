import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehicleMetadata {
  @Field(() => [String], { description: 'Liste des marques disponibles' })
  brands: string[];

  @Field(() => [String], { description: 'Liste des modèles disponibles' })
  models: string[];

  @Field(() => [String], { description: 'Liste des versions disponibles' })
  versions: string[];

  @Field(() => [String], { description: 'Liste des types de carburant disponibles' })
  fuels: string[];

  @Field(() => [String], { description: 'Liste des couleurs disponibles' })
  colors: string[];

  @Field(() => [Number], { description: 'Liste des années disponibles' })
  years: number[];

  @Field(() => [String], { description: 'Liste des types de carrosserie disponibles' })
  bodyTypes: string[];

  @Field(() => [String], { description: 'Liste des types de transmission disponibles' })
  transmissions: string[];
} 