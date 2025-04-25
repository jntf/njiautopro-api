import { Resolver, Query, Mutation, Args, ID, Int, Float, ObjectType, Field } from '@nestjs/graphql';
import { PublicationsService } from './publications.service';
import { VehiclePublication } from '../entities/vehicle-publication.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VehiclesService } from '../vehicles.service';

@ObjectType()
class PublishedVehicleIds {
  @Field(() => [String])
  vehicleIds: string[];
}

@Resolver(() => VehiclePublication)
export class PublicationsResolver {
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly vehiclesService: VehiclesService
  ) {}

  @Query(() => [VehiclePublication])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async publications(): Promise<VehiclePublication[]> {
    return this.publicationsService.findAll();
  }
  
  @Query(() => [VehiclePublication])
  async publishedVehicles(): Promise<VehiclePublication[]> {
    return this.publicationsService.findPublished();
  }

  @Query(() => VehiclePublication, { nullable: true })
  async publicationByInternalId(
    @Args('internalId', { type: () => ID }) internalId: string,
  ): Promise<VehiclePublication | null> {
    return this.publicationsService.findByInternalId(internalId);
  }
  
  @Query(() => PublishedVehicleIds)
  async publishedVehicleIds(): Promise<{ vehicleIds: string[] }> {
    const ids = await this.publicationsService.getPublishedVehicleIds();
    return { vehicleIds: ids };
  }

  @Mutation(() => VehiclePublication)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async publishVehicle(
    @Args('vehicleId') vehicleId: string,
    @Args('sourceId', { type: () => ID }) sourceId: number,
    @Args('priceOverride', { nullable: true, type: () => Int }) priceOverride?: number,
    @Args('discount', { nullable: true, type: () => Float }) discount?: number,
  ): Promise<VehiclePublication> {
    return this.publicationsService.publishVehicle(vehicleId, sourceId, priceOverride, discount);
  }

  @Mutation(() => VehiclePublication)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async unpublishVehicle(
    @Args('publicationId', { type: () => ID }) publicationId: number,
  ): Promise<VehiclePublication> {
    return this.publicationsService.unpublishVehicle(publicationId);
  }

  @Mutation(() => VehiclePublication)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePublicationPrice(
    @Args('publicationId', { type: () => ID }) publicationId: number,
    @Args('priceOverride', { type: () => Int }) priceOverride: number,
  ): Promise<VehiclePublication> {
    return this.publicationsService.updatePrice(publicationId, priceOverride);
  }

  @Mutation(() => VehiclePublication)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePublicationDiscount(
    @Args('publicationId', { type: () => ID }) publicationId: number,
    @Args('discount', { type: () => Float }) discount: number,
  ): Promise<VehiclePublication> {
    return this.publicationsService.updateDiscount(publicationId, discount);
  }
  
  @Mutation(() => Boolean)
  async trackVehicleView(
    @Args('internalId', { type: () => ID }) internalId: string,
  ): Promise<boolean> {
    await this.publicationsService.trackView(internalId);
    return true;
  }
  
  @Mutation(() => Boolean)
  async trackVehicleFavorite(
    @Args('internalId', { type: () => ID }) internalId: string,
  ): Promise<boolean> {
    await this.publicationsService.trackFavorite(internalId);
    return true;
  }
  
  @Mutation(() => Boolean)
  async trackVehicleContact(
    @Args('internalId', { type: () => ID }) internalId: string,
  ): Promise<boolean> {
    await this.publicationsService.trackContact(internalId);
    return true;
  }
}
