import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUrl, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

@InputType()
export class CreateSourceInput {
  @Field()
  @IsNotEmpty({ message: 'Le nom est requis' })
  name: string;

  @Field()
  @IsUrl({}, { message: 'URL invalide' })
  url: string;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Taux de commission invalide' })
  @Min(0, { message: 'Le taux de commission ne peut pas être négatif' })
  @Max(100, { message: 'Le taux de commission ne peut pas dépasser 100%' })
  commission_rate?: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Frais de transport invalides' })
  @Min(0, { message: 'Les frais de transport ne peuvent pas être négatifs' })
  transport_fee?: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Frais additionnels invalides' })
  @Min(0, { message: 'Les frais additionnels ne peuvent pas être négatifs' })
  additional_fees?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean({ message: 'Le statut doit être un booléen' })
  active?: boolean;
}
