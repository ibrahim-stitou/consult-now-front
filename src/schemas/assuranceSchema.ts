import { z } from 'zod';

// Document schema for file uploads
const documentSchema = z.object({
  path: z.string().min(1, 'Le chemin du fichier est requis'),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});

// Définir d'abord le schéma sans la validation relationnelle
const baseAssuranceSchema = z.object({
  compagnie: z.string({
    required_error: 'La compagnie est requise'
  }).min(1, 'Le nom de la compagnie est requis').max(255, 'Le nom ne doit pas dépasser 255 caractères'),

  reference: z.string({
    required_error: 'La référence est requise'
  }).min(1, 'La référence est requise').max(255, 'La référence ne doit pas dépasser 255 caractères'),

  date_debut: z.date({
    required_error: 'La date de début est requise',
    invalid_type_error: 'La date doit être valide'
  }),

  date_fin: z.date({
    required_error: 'La date de fin est requise',
    invalid_type_error: 'La date de fin doit être valide'
  }),

  type_couverture: z.enum(['responsabilite_civile', 'tiers', 'tous_risques'], {
    required_error: 'Le type de couverture est requis',
  }),

  type_assurance: z.enum(['individuelle', 'flotte'], {
    required_error: 'Le type d\'assurance est requis',
  }),

  is_international: z.boolean().default(false),

  vehicules: z.array(z.number()).min(1, 'Veuillez sélectionner au moins un véhicule'),

  garanties: z.array(z.number()).optional(),

  documents: z.array(documentSchema).optional(),
});

// Puis ajouter la validation relationnelle entre les dates
export const assuranceSchema = baseAssuranceSchema.refine(
  (data) => {
    if (!data.date_debut || !data.date_fin) return true; // Laissons la validation requise s'en charger
    return data.date_fin > data.date_debut;
  },
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['date_fin'] // Indiquer que l'erreur concerne le champ date_fin
  }
);

export type Assurance = z.infer<typeof assuranceSchema>;

export const DEFAULT_VALUES: Partial<Assurance> = {
  compagnie: '',
  reference: '',
  date_debut: new Date(),
  date_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  type_couverture: 'responsabilite_civile',
  type_assurance: 'individuelle',
  is_international: false,
  vehicules: [],
  garanties: [],
  documents: [],
};