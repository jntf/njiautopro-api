import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePublication, PriceHistoryEntry } from '../entities/vehicle-publication.entity';
import { VehicleInterest } from '../entities/vehicle-interest.entity';
import { Source } from '../../sources/entities/source.entity';
import { VehiclesService } from '../vehicles.service';

@Injectable()
export class PublicationsService {
  private readonly logger = new Logger(PublicationsService.name);

  constructor(
    @InjectRepository(VehiclePublication)
    private publicationsRepository: Repository<VehiclePublication>,
    @InjectRepository(VehicleInterest)
    private interestRepository: Repository<VehicleInterest>,
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
    @Inject(forwardRef(() => VehiclesService))
    private vehiclesService: VehiclesService
  ) {}

  async findAll(): Promise<VehiclePublication[]> {
    return this.publicationsRepository.find({
      relations: ['source', 'interest']
    });
  }

  async findPublished(): Promise<VehiclePublication[]> {
    return this.publicationsRepository.find({
      where: { published: true },
      relations: ['source', 'interest']
    });
  }

  async findByInternalId(internalId: string): Promise<VehiclePublication | null> {
    return this.publicationsRepository.findOne({
      where: { internal_id: internalId },
      relations: ['source', 'interest']
    });
  }

  async findByVehicleId(vehicleId: string, sourceId: number): Promise<VehiclePublication | null> {
    return this.publicationsRepository.findOne({
      where: { vehicle_id: vehicleId, source_id: sourceId },
      relations: ['source', 'interest']
    });
  }

  async publishVehicle(
    vehicleId: string,
    sourceId: number,
    priceOverride?: number,
    discount?: number
  ): Promise<VehiclePublication> {
    // Vérifier si la source existe
    const source = await this.sourcesRepository.findOne({ where: { id: sourceId } });
    if (!source) {
      throw new NotFoundException(`Source with ID ${sourceId} not found`);
    }

    // Vérifier si le véhicule existe dans la source
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    // Vérifier si une publication existe déjà
    let publication = await this.findByVehicleId(vehicleId, sourceId);

    if (publication) {
      // Mise à jour de la publication existante
      publication.published = true;
      
      if (priceOverride !== undefined) {
        // Ajouter l'ancien prix à l'historique si le prix change
        if (publication.price_override !== priceOverride) {
          let priceHistory: PriceHistoryEntry[] = [];
          try {
            if (typeof publication.price_history === 'string') {
              priceHistory = JSON.parse(publication.price_history);
            } else if (Array.isArray(publication.price_history)) {
              priceHistory = publication.price_history;
            }
          } catch (e) {
            this.logger.warn('Erreur lors du parse de price_history, réinitialisation', e);
          }
          
          priceHistory.push({
            price: publication.price_override || vehicle.price,
            date: new Date().toISOString()
          });
          publication.price_history = priceHistory;
        }
        publication.price_override = priceOverride;
      }
      
      if (discount !== undefined) {
        publication.discount = discount;
      }
      
      return this.publicationsRepository.save(publication);
    } else {
      // Créer une nouvelle publication
      const newPublication = this.publicationsRepository.create({
        vehicle_id: vehicleId,
        source_id: sourceId,
        published: true,
        price_override: priceOverride,
        discount,
        price_history: priceOverride ? [{ 
          price: vehicle.price, 
          date: new Date().toISOString() 
        }] : []
      });
      
      const savedPublication = await this.publicationsRepository.save(newPublication);
      
      // Créer une entrée de statistiques d'intérêt
      const interest = this.interestRepository.create({
        publication_id: savedPublication.id
      });
      await this.interestRepository.save(interest);
      
      return savedPublication;
    }
  }

  async unpublishVehicle(publicationId: number): Promise<VehiclePublication> {
    const publication = await this.publicationsRepository.findOne({
      where: { id: publicationId },
      relations: ['source', 'interest']
    });
    
    if (!publication) {
      throw new NotFoundException(`Publication with ID ${publicationId} not found`);
    }
    
    publication.published = false;
    return this.publicationsRepository.save(publication);
  }

  async updatePrice(publicationId: number, priceOverride: number): Promise<VehiclePublication> {
    const publication = await this.publicationsRepository.findOne({
      where: { id: publicationId },
      relations: ['source', 'interest']
    });
    
    if (!publication) {
      throw new NotFoundException(`Publication with ID ${publicationId} not found`);
    }
    
    // Récupérer le véhicule pour obtenir le prix d'origine si nécessaire
    const vehicle = await this.vehiclesService.findOne(publication.vehicle_id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${publication.vehicle_id} not found`);
    }
    
    // Ajouter l'ancien prix à l'historique si le prix change
    if (publication.price_override !== priceOverride) {
      let priceHistory: PriceHistoryEntry[] = [];
      try {
        if (typeof publication.price_history === 'string') {
          priceHistory = JSON.parse(publication.price_history);
        } else if (Array.isArray(publication.price_history)) {
          priceHistory = publication.price_history;
        }
      } catch (e) {
        this.logger.warn('Erreur lors du parse de price_history, réinitialisation', e);
      }
      
      priceHistory.push({
        price: publication.price_override || vehicle.price,
        date: new Date().toISOString()
      });
      publication.price_history = priceHistory;
    }
    
    publication.price_override = priceOverride;
    return this.publicationsRepository.save(publication);
  }

  async updateDiscount(publicationId: number, discount: number): Promise<VehiclePublication> {
    const publication = await this.publicationsRepository.findOne({
      where: { id: publicationId },
      relations: ['source', 'interest']
    });
    
    if (!publication) {
      throw new NotFoundException(`Publication with ID ${publicationId} not found`);
    }
    
    publication.discount = discount;
    return this.publicationsRepository.save(publication);
  }

  async trackView(internalId: string): Promise<void> {
    const publication = await this.findByInternalId(internalId);
    if (!publication || !publication.interest) return;
    
    publication.interest.view_count += 1;
    publication.interest.last_view_at = new Date();
    await this.interestRepository.save(publication.interest);
  }

  async trackFavorite(internalId: string): Promise<void> {
    const publication = await this.findByInternalId(internalId);
    if (!publication || !publication.interest) return;
    
    publication.interest.favorite_count += 1;
    await this.interestRepository.save(publication.interest);
  }

  async trackContact(internalId: string): Promise<void> {
    const publication = await this.findByInternalId(internalId);
    if (!publication || !publication.interest) return;
    
    publication.interest.contact_count += 1;
    await this.interestRepository.save(publication.interest);
  }

  async getPublishedVehicleIds(): Promise<string[]> {
    const publications = await this.publicationsRepository.find({
      where: { published: true },
      select: ['vehicle_id']
    });
    
    return publications.map(pub => pub.vehicle_id);
  }
}
