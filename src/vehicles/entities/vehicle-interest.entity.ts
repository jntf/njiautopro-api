import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { 
  Column, 
  Entity, 
  JoinColumn, 
  OneToOne, 
  PrimaryGeneratedColumn 
} from 'typeorm';
import { VehiclePublication } from './vehicle-publication.entity';

@ObjectType()
@Entity('vehicle_interest')
export class VehicleInterest {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ default: 0 })
  view_count: number;

  @Field(() => Int)
  @Column({ default: 0 })
  favorite_count: number;

  @Field(() => Int)
  @Column({ default: 0 })
  contact_count: number;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  last_view_at: Date;

  @Field(() => String, { defaultValue: '{}' })
  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, any>;

  @Column()
  publication_id: number;

  // Relations
  @OneToOne(() => VehiclePublication, publication => publication.interest)
  @JoinColumn({ name: 'publication_id' })
  publication: VehiclePublication;
}