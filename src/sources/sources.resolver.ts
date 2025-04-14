import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SourcesService } from './sources.service';
import { Source } from './entities/source.entity';
import { CreateSourceInput } from './dto/create-source.input';
import { UpdateSourceInput } from './dto/update-source.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => Source)
export class SourcesResolver {
  constructor(private readonly sourcesService: SourcesService) {}

  @Mutation(() => Source)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createSource(@Args('createSourceInput') createSourceInput: CreateSourceInput) {
    return this.sourcesService.create(createSourceInput);
  }

  @Query(() => [Source], { name: 'sources' })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.sourcesService.findAll();
  }

  @Query(() => Source, { name: 'source' })
  @UseGuards(JwtAuthGuard)
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.sourcesService.findOne(id);
  }

  @Mutation(() => Source)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateSource(@Args('updateSourceInput') updateSourceInput: UpdateSourceInput) {
    return this.sourcesService.update(updateSourceInput.id, updateSourceInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  removeSource(@Args('id', { type: () => ID }) id: number) {
    return this.sourcesService.remove(id);
  }
}
