import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from './entities/source.entity';
import { CreateSourceInput } from './dto/create-source.input';
import { UpdateSourceInput } from './dto/update-source.input';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  async create(createSourceInput: CreateSourceInput): Promise<Source> {
    const newSource = this.sourcesRepository.create(createSourceInput);
    return this.sourcesRepository.save(newSource);
  }

  async findAll(): Promise<Source[]> {
    return this.sourcesRepository.find();
  }

  async findOne(id: number): Promise<Source> {
    const source = await this.sourcesRepository.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException(`Source avec l'ID ${id} non trouvée`);
    }
    return source;
  }

  async update(id: number, updateSourceInput: UpdateSourceInput): Promise<Source> {
    const source = await this.findOne(id);
    
    // Mettre à jour les propriétés
    Object.assign(source, updateSourceInput);
    
    return this.sourcesRepository.save(source);
  }

  async remove(id: number): Promise<boolean> {
    const source = await this.findOne(id);
    await this.sourcesRepository.remove(source);
    return true;
  }
}
