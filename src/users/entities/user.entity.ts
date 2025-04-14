import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Field()
  @Column({ default: 'user' })
  role: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
