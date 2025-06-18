// src/types/extincteurType.ts
export interface Vehicule {
  id: number;
  immatriculation: string;
  immatriculation_anterieur?: string;
  model_id?: number;
  vehicule_type_id?: number;
  carte_grise?: string;
  annee_fabrication?: number;
  vin?: string;
  statut: string;
  usage?: string;
  date_mutation?: string;
  date_mc?: string;
  proprietaire?: string;
  carburant: string;
  nombre_cylindre?: number;
  puissance_fiscale?: number;
  nombre_place?: number;
  kilometrage_initial: number;
  pv?: string;
  ptac?: string;
  ptmct?: string;
  created_at?: string;
  updated_at?: string;
  media?: Media[];
}

export interface Media {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk?: string;
  size: number;
  manipulations?: any[];
  custom_properties: {
    type?: string;
    description?: string | null;
  };
  generated_conversions?: any[];
  responsive_images?: any[];
  order_column?: number;
  created_at: string;
  updated_at: string;
  original_url: string;
  preview_url?: string;
}
export interface Extincteur {
  id?: number;
  numero_serie: string;
  type_extincteur: string;
  capacite: number;
  date_fabrication: Date | string;
  date_premiere_verification: Date | string;
  date_prochaine_verification: Date | string;
  statut: 'FONCTIONNELLE' | 'DEFAILLANT' | 'EXPIRE' | 'EN_MAINTENANCE';
  observation?: string;
  vehicule_id: number;
  vehicule?: string;
  jours_restants?: string;
  alerte_verification?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  actions?: number;
}