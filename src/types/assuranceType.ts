export interface Vehicule {
  id: number;
  immatriculation: string;
}

export interface Garantie {
  id: number;
  nom: string;
  description?: string;
}

export interface AssuranceDocument {
  path: string;
  name?: string;
  description?: string;
  type?: string;
}

export interface Assurance {
  id?: number;
  compagnie: string;
  reference: string;
  date_debut: string | Date;
  date_fin: string | Date;
  type_couverture: 'responsabilite_civile' | 'tiers' | 'tous_risques';
  type_assurance: 'individuelle' | 'flotte';
  is_international: boolean;
  vehicules?: number[];
  garanties?: number[];
  documents?: AssuranceDocument[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}