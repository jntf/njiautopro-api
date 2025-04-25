import { Field, ID, Float, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VehiclePublication } from '../../vehicles/entities/vehicle-publication.entity';

@ObjectType()
@Entity('sources')
export class Source {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  url: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_rate: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  transport_fee: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  additional_fees: number;

  @Field()
  @Column({ default: true })
  active: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  
  @Field()
  @Column()
  source_id: string;

  @Field()
  @Column()
  source_type: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', default: () => "'{}'", nullable: true })
  config: Record<string, any>;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  last_sync: Date;
  
  // Relations
  @OneToMany(() => VehiclePublication, publication => publication.source)
  publications: VehiclePublication[];
}
