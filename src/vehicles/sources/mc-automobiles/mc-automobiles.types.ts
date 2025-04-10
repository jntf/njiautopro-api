/**
 * Types pour la source de données MC Automobiles
 */

export interface RawVehicle {
  id: string;
  reference: string;
  type: string;
  carrosserie: string;
  marque: string;
  modele: string;
  version: string;
  energie: string;
  millesime: string;
  date_mec: string;
  kilometrage: string;
  nb_portes: string;
  nb_places: string;
  couleur: string;
  boite_de_vitesse: string;
  puissance_reelle: string;
  puissance_fiscale: string;
  prix: string;
  taux_tva: string;
  frais: string;
  equipements: string | { equipement: string | string[] };
  equipements_absents: string | { equipement: string | string[] };
  options: string | { option: string | string[] };
  emission_co2: string;
  photos: string | { photo: string | string[] };
  stock: string;
  immat: string;
  vin: string;
  poids: string;
  tour?: string;
  expertise?: string;
  expertise_details?: { element: Array<{ _?: string; nom: string }> } | string;
  photos_frais?: string | { photo: string | string[] };
  valeur_neuve?: string;
  origine: string;
}

export interface VehicleData {
  client: {
    annonce: RawVehicle | RawVehicle[];
  };
}

export interface McSourceConfig {
  url: string;
  refreshInterval: number; // en millisecondes
}
