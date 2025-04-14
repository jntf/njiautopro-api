import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}
