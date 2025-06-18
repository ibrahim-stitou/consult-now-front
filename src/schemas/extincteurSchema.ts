// src/schemas/extincteurSchema.ts
import { z } from 'zod';

// Extincteur schema definition
export const extincteurSchema = z.object({
  numero_serie: z.string({
    required_error: 'Le numéro de série est requis'
  }).min(1, 'Le numéro de série est requis').max(255, 'Le numéro de série ne doit pas dépasser 255 caractères'),

  type_extincteur: z.string({
    required_error: 'Le type d\'extincteur est requis'
  }).min(1, 'Le type d\'extincteur est requis'),

  capacite: z.number({
    required_error: 'La capacité est requise',
    invalid_type_error: 'La capacité doit être un nombre'
  }).positive('La capacité doit être positive'),

  date_fabrication: z.date({
    required_error: 'La date de fabrication est requise',
    invalid_type_error: 'La date doit être valide'
  }),

  date_premiere_verification: z.date({
    required_error: 'La date de première vérification est requise',
    invalid_type_error: 'La date doit être valide'
  }),

  date_prochaine_verification: z.date({
    required_error: 'La date de prochaine vérification est requise',
    invalid_type_error: 'La date doit être valide'
  }),

  statut: z.enum(['FONCTIONNELLE', 'DEFAILLANT', 'EXPIRE', 'EN_MAINTENANCE'], {
    required_error: 'Le statut est requis',
  }),

  observation: z.string().optional(),

  vehicule_id: z.number({
    required_error: 'Le véhicule est requis',
    invalid_type_error: 'Veuillez sélectionner un véhicule'
  }),

  documents: z.array(z.object({
    path: z.string().min(1, 'Le chemin du fichier est requis'),
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
  })).optional(),
}).refine(
  (data) => {
    // Validation: date_prochaine_verification doit être après date_premiere_verification
    if (!data.date_premiere_verification || !data.date_prochaine_verification) return true;
    return data.date_prochaine_verification > data.date_premiere_verification;
  },
  {
    message: 'La date de prochaine vérification doit être postérieure à la date de première vérification',
    path: ['date_prochaine_verification']
  }
);

export type Extincteur = z.infer<typeof extincteurSchema>;

export const DEFAULT_VALUES: Partial<Extincteur> = {
  numero_serie: '',
  type_extincteur: '',
  capacite: 6.0,
  date_fabrication: new Date(),
  date_premiere_verification: new Date(),
  date_prochaine_verification: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  statut: 'FONCTIONNELLE',
  observation: '',
  documents: [],
};