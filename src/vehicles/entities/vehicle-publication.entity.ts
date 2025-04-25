import { Field, ID, Int, Float, ObjectType } from '@nestjs/graphql';
import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  JoinColumn, 
  ManyToOne, 
  OneToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Source } from '../../sources/entities/source.entity';
import { VehicleInterest } from './vehicle-interest.entity';

@ObjectType()
export class PriceHistoryEntry {
  @Field(() => Int)
  price: number;

  @Field()
  date: string;
}

@ObjectType()
@Entity('vehicle_publications')
export class VehiclePublication {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  vehicle_id: string;

  @Field(() => ID)
  @Column()
  source_id: number;

  @Field(() => ID)
  @Column({ type: 'uuid', default: () => 'gen_random_uuid()' })
  internal_id: string;

  @Field()
  @Column({ default: false })
  published: boolean;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  price_override: number;

  @Field(() => [PriceHistoryEntry], { defaultValue: [] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  price_history: PriceHistoryEntry[];

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number;

  @Field(() => String, { defaultValue: '{}' })
  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, any>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Source)
  @JoinColumn({ name: 'source_id' })
  source: Source;

  @OneToOne(() => VehicleInterest, interest => interest.publication, { cascade: true })
  interest: VehicleInterest;
}