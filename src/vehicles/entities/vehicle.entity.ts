import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Expertise {
  @Field(() => String, { nullable: true })
  date_expertise?: string;

  @Field(() => String, { nullable: true })
  boite_motorisation?: string;

  @Field(() => String, { nullable: true })
  pare_brise?: string;

  @Field(() => String, { nullable: true })
  pare_choc_av?: string;

  @Field(() => String, { nullable: true })
  anti_brouillard?: string;

  @Field(() => String, { nullable: true })
  feux_av?: string;

  @Field(() => String, { nullable: true })
  calandre?: string;

  @Field(() => String, { nullable: true })
  capot?: string;
  
  @Field(() => String, { nullable: true })
  nbre_places?: string;
  
  @Field(() => String, { nullable: true })
  vitres_electriques?: string;
  
  @Field(() => String, { nullable: true })
  jantes_alu?: string;
  
  @Field(() => String, { nullable: true })
  gps?: string;
  
  @Field(() => String, { nullable: true })
  bluetooth?: string;
  
  @Field(() => String, { nullable: true })
  radar_recul?: string;
  
  @Field(() => String, { nullable: true })
  feux_automatique?: string;
  
  @Field(() => String, { nullable: true })
  phares?: string;
  
  @Field(() => String, { nullable: true })
  sellerie?: string;
  
  @Field(() => String, { nullable: true })
  retros_rab_elec?: string;

  @Field(() => String, { nullable: true })
  accoudoir?: string;

  // Index signature pour les autres champs dynamiques
  [key: string]: string | undefined;
}

@ObjectType()
export class Vehicle {
  @Field(() => ID)
  id: string;
  
  @Field()
  reference: string;
  
  @Field()
  type: string;
  
  @Field()
  bodyType: string;
  
  @Field()
  brand: string;
  
  @Field()
  model: string;
  
  @Field()
  version: string;
  
  @Field()
  fuel: string;
  
  @Field(() => Int)
  year: number;
  
  @Field()
  registrationDate: string;
  
  @Field(() => Int)
  mileage: number;
  
  @Field(() => Int)
  doors: number;
  
  @Field(() => Int)
  seats: number;
  
  @Field()
  color: string;
  
  @Field()
  transmission: string;
  
  @Field(() => Int)
  power: number;
  
  @Field(() => Int)
  fiscalPower: number;
  
  @Field(() => Int)
  price: number;
  
  @Field(() => Int)
  vatRate: number;
  
  @Field(() => Int)
  fees: number;
  
  @Field(() => [String])
  features: string[];
  
  @Field(() => [String])
  missingFeatures: string[];
  
  @Field(() => [String])
  options: string[];
  
  @Field(() => Int)
  co2Emission: number;
  
  @Field(() => [String])
  images: string[];
  
  @Field()
  location: string;
  
  @Field()
  licensePlate: string;
  
  @Field()
  vin: string;
  
  @Field(() => Int)
  weight: number;
  
  @Field({ nullable: true })
  tourUrl?: string;
  
  @Field({ nullable: true })
  expertiseUrl?: string;
  
  @Field(() => Expertise, { nullable: true })
  expertise?: Record<string, string>;
  
  @Field(() => [String], { nullable: true })
  damageImages?: string[];
  
  @Field(() => Int, { nullable: true })
  newValue?: number;
  
  @Field()
  origin: string;
  
  @Field(() => Int)
  totalPrice: number;
  
  @Field({ nullable: true })
  sourceId?: string;
}