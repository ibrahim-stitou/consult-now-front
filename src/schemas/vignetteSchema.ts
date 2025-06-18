// src/schemas/vignetteSchema.ts
import { z } from 'zod';

// Document schema for file uploads
const documentSchema = z.object({
  path: z.string().min(1, 'Le chemin du fichier est requis'),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});

// Calculate min and max years for validation
const currentYear = new Date().getFullYear();
const minYear = currentYear - 1;
const maxYear = currentYear + 5;

export const vignetteSchema = z.object({
  vehicule_id: z.number({
    required_error: 'Le véhicule est requis',
    invalid_type_error: 'Le véhicule doit être sélectionné'
  }).min(1, 'Veuillez sélectionner un véhicule'),

  reference: z.string({
    required_error: 'La référence est requise'
  }).min(1, 'La référence est requise').max(255, 'La référence ne peut pas dépasser 255 caractères'),

  annee: z.union([
    z.string(),
    z.number()
  ]).pipe(
    z.coerce.number({
      required_error: "L'année est requise",
      invalid_type_error: "L'année doit être un nombre"
    })
      .int("L'année doit être un nombre entier")
      .min(minYear, `L'année doit être ${minYear} ou supérieure`)
      .max(maxYear, `L'année ne peut pas dépasser ${maxYear}`)
  ),

  montant: z.union([
    z.string(),
    z.number()
  ]).pipe(
    z.coerce.number({
      required_error: 'Le montant est requis',
      invalid_type_error: 'Le montant doit être un nombre'
    }).min(0, 'Le montant doit être positif')
  ),

  date_debut_validite: z.date({
    required_error: 'La date de début de validité est requise',
    invalid_type_error: 'La date de début de validité doit être valide'
  }),

  date_fin_validite: z.date({
    required_error: 'La date de fin de validité est requise',
    invalid_type_error: 'La date de fin de validité doit être valide'
  }),

  documents: z.array(documentSchema).optional(),
}).refine((data) => {
  return data.date_fin_validite > data.date_debut_validite;
}, {
  message: 'La date de fin de validité doit être postérieure à la date de début',
  path: ['date_fin_validite']
});

export type Vignette = z.infer<typeof vignetteSchema>;

export const DEFAULT_VALUES: Partial<Vignette> = {
  vehicule_id: undefined,
  reference: '',
  annee: new Date().getFullYear(),
  montant: undefined,
  date_debut_validite: new Date(),
  date_fin_validite: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  documents: [],
};