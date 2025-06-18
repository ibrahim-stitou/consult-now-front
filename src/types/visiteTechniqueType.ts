export interface VisiteTechnique {
  id?: number;
  vehicule_id: number;
  date_visite: Date;
  date_expiration: Date;
  type: 'periodique' | 'complementaire' | 'mutation' | 'mutation_complementaire' | 'volontaire';
  resultat: 'favorable' | 'defavorable';
  observations: string;
  centre: string;
  documents?: VisiteTechniqueDocument[];
}

export interface VisiteTechniqueDocument {
  path: string;
  name?: string;
  description?: string;
  type?: string;
}

export interface Vehicule {
  id: number;
  immatriculation: string;
}