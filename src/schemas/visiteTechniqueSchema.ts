import { z } from 'zod';

// Document schema for file uploads
const documentSchema = z.object({
  path: z.string().min(1, 'Le chemin du fichier est requis'),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});

export const visiteTechniqueSchema = z.object({
  vehicule_id: z.number({
    required_error: 'Le véhicule est requis',
    invalid_type_error: 'Le véhicule doit être sélectionné'
  }).min(1, 'Veuillez sélectionner un véhicule'),

  date_visite: z.date({
    required_error: 'La date de visite est requise',
    invalid_type_error: 'La date doit être valide'
  }).refine((date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  }, 'La date ne peut pas être dans le futur'),

  date_expiration: z.date({
    required_error: 'La date d\'expiration est requise',
    invalid_type_error: 'La date d\'expiration doit être valide'
  }),

  type: z.enum(['periodique', 'complementaire', 'mutation', 'mutation_complementaire', 'volontaire'], {
    required_error: 'Le type de visite est requis',
  }),

  resultat: z.enum(['favorable', 'defavorable'], {
    required_error: 'Le résultat est requis',
  }),

  observations: z.string().optional(),

  centre: z.string({
    required_error: 'Le centre est requis'
  }).min(1, 'Le centre est requis'),

  documents: z.array(documentSchema).optional(),
});

export type VisiteTechnique = z.infer<typeof visiteTechniqueSchema>;

export const DEFAULT_VALUES: Partial<VisiteTechnique> = {
  vehicule_id: undefined,
  date_visite: new Date(),
  date_expiration: new Date(),
  type: 'periodique',
  resultat: 'favorable',
  observations: '',
  centre: '',
  documents: [],
};