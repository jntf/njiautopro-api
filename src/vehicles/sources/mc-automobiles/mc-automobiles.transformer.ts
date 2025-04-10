import { RawVehicle } from './mc-automobiles.types';
import { Vehicle } from '../../entities/vehicle.entity';

/**
 * Convertit une chaîne séparée par des séparateurs en tableau
 */
export function stringToArray(str: string | undefined, separator: string = '/'): string[] {
  if (!str) return [];
  return str.split(separator)
    .map(item => item.trim())
    .filter(item => item !== '');
}

/**
 * Parse en toute sécurité une chaîne en nombre
 */
export function safeParseInt(str: string | undefined, defaultValue: number = 0): number {
  if (!str) return defaultValue;
  const num = parseInt(str);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Extrait les photos d'un objet ou d'une chaîne
 */
export function extractPhotos(photos: string | { photo: string | string[] } | undefined): string[] {
  if (!photos) return [];
  
  if (typeof photos === 'string') {
    return photos.trim() ? [photos] : [];
  }
  
  if (photos && 'photo' in photos) {
    if (Array.isArray(photos.photo)) {
      return photos.photo;
    } else if (photos.photo) {
      return [photos.photo as string];
    }
  }
  
  return [];
}

/**
 * Extrait les équipements d'un objet ou d'une chaîne
 */
export function extractEquipments(equipments: string | { equipement: string | string[] } | undefined): string[] {
  if (!equipments) return [];
  
  if (typeof equipments === 'string') {
    return stringToArray(equipments);
  }
  
  if (equipments && 'equipement' in equipments) {
    if (Array.isArray(equipments.equipement)) {
      return equipments.equipement;
    } else if (equipments.equipement) {
      return stringToArray(equipments.equipement as string);
    }
  }
  
  return [];
}

/**
 * Extrait les options d'un objet ou d'une chaîne
 */
export function extractOptions(options: string | { option: string | string[] } | undefined): string[] {
  if (!options) return [];
  
  if (typeof options === 'string') {
    return stringToArray(options);
  }
  
  if (options && 'option' in options) {
    if (Array.isArray(options.option)) {
      return options.option;
    } else if (options.option) {
      return stringToArray(options.option as string);
    }
  }
  
  return [];
}

/**
 * Traite les détails d'expertise en un objet structuré
 */
export function processExpertise(expertise: { element: Array<{ _?: string; nom: string }> } | string | undefined): Record<string, string> | undefined {
  if (!expertise) return undefined;
  if (typeof expertise === 'string') return undefined;
  
  if ('element' in expertise && Array.isArray(expertise.element)) {
    // Si l'expertise est vide ou malformée, retourner undefined
    if (expertise.element.length === 0) return undefined;
    
    // Construire l'objet d'expertise
    const expertiseObject = expertise.element.reduce((acc, item) => {
      if (item.nom && item._) {
        // Convert spaces to underscores and remove accents for property names
        const key = item.nom.toLowerCase()
          .replace(/ /g, '_')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9_]/g, '');
          
        acc[key] = item._;
      }
      return acc;
    }, {} as Record<string, string>);
    
    // Si aucune propriété n'a été ajoutée, retourner undefined
    return Object.keys(expertiseObject).length > 0 ? expertiseObject : undefined;
  }
  
  return undefined;
}

/**
 * Transforme une annonce brute en véhicule formaté
 */
export function transformVehicle(rawVehicle: RawVehicle, sourceId: string): Vehicle {
  const price = safeParseInt(rawVehicle.prix);
  const fees = safeParseInt(rawVehicle.frais);
  
  return {
    id: `${sourceId}-${rawVehicle.id}`,
    reference: rawVehicle.reference,
    type: rawVehicle.type,
    bodyType: rawVehicle.carrosserie,
    brand: rawVehicle.marque,
    model: rawVehicle.modele,
    version: rawVehicle.version,
    fuel: rawVehicle.energie,
    year: safeParseInt(rawVehicle.millesime),
    registrationDate: rawVehicle.date_mec,
    mileage: safeParseInt(rawVehicle.kilometrage),
    doors: safeParseInt(rawVehicle.nb_portes),
    seats: safeParseInt(rawVehicle.nb_places),
    color: rawVehicle.couleur,
    transmission: rawVehicle.boite_de_vitesse,
    power: safeParseInt(rawVehicle.puissance_reelle),
    fiscalPower: safeParseInt(rawVehicle.puissance_fiscale),
    price: price,
    vatRate: safeParseInt(rawVehicle.taux_tva),
    fees: fees,
    features: extractEquipments(rawVehicle.equipements),
    missingFeatures: extractEquipments(rawVehicle.equipements_absents),
    options: extractOptions(rawVehicle.options),
    co2Emission: safeParseInt(rawVehicle.emission_co2),
    images: extractPhotos(rawVehicle.photos),
    location: rawVehicle.stock,
    licensePlate: rawVehicle.immat,
    vin: rawVehicle.vin,
    weight: safeParseInt(rawVehicle.poids),
    tourUrl: rawVehicle.tour,
    expertiseUrl: rawVehicle.expertise,
    expertise: processExpertise(rawVehicle.expertise_details),
    damageImages: extractPhotos(rawVehicle.photos_frais),
    newValue: rawVehicle.valeur_neuve ? safeParseInt(rawVehicle.valeur_neuve) : undefined,
    origin: rawVehicle.origine,
    totalPrice: price + fees,
    sourceId: sourceId
  };
}
