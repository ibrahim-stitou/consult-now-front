// src/schemas/acquesitionSchema.ts
import { z } from 'zod';

// Document schema for file uploads
const documentSchema = z.object({
  path: z.string().min(1, 'Le chemin du fichier est requis'),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});

export const acquisitionSchema = z.object({
  vehicule_id: z.number({
    required_error: 'Le véhicule est requis',
    invalid_type_error: 'Le véhicule doit être sélectionné'
  }).min(1, 'Veuillez sélectionner un véhicule'),

  type_acquesition: z.enum(['LEASING', 'ACHAT', 'LOCATION'], {
    required_error: 'Le type d\'acquisition est requis',
  }),

  fournisseur_id: z.number({
    required_error: 'Le fournisseur est requis',
    invalid_type_error: 'Le fournisseur doit être sélectionné'
  }).min(1, 'Veuillez sélectionner un fournisseur'),

  date_acquesition: z.date({
    required_error: 'La date d\'acquisition est requise',
    invalid_type_error: 'La date doit être valide'
  }),

  prix_acquesition: z.union([z.number(), z.string()])
    .nullable()
    .optional()
    .refine(val => val === null || val === undefined || Number(val) >= 0, {
      message: 'Le prix doit être supérieur ou égal à 0'
    }),

  duree_contrat: z.number()
    .nullable()
    .optional()
    .refine(val => val === null || val === undefined || val >= 1, {
      message: 'La durée doit être supérieure ou égale à 1'
    }),

  loyer_mensuel: z.union([z.number(), z.string()])
    .nullable()
    .optional()
    .refine(val => val === null || val === undefined || Number(val) >= 0, {
      message: 'Le loyer mensuel doit être supérieur ou égal à 0'
    }),

  option_achat: z.union([z.boolean(), z.number()]).default(false),

  date_fin_contrat: z.date()
    .nullable()
    .optional()
    //@ts-ignore
    .refine((date, ctx) => {
      if (!date) return true;
      const dateAcq = ctx?.parent?.date_acquesition;
      return !(dateAcq instanceof Date) || date > dateAcq;
    }, {
      message: 'La date de fin doit être postérieure à la date d\'acquisition'
    }),

  valeur_residuelle: z.number()
    .nullable()
    .optional()
    .refine(val => val === null || val === undefined || val >= 0, {
      message: 'La valeur résiduelle doit être supérieure ou égale à 0'
    }),

  documents: z.array(documentSchema)
    .max(3, 'Vous pouvez télécharger au maximum 3 documents')
    .optional(),
});

export type Acquisition = z.infer<typeof acquisitionSchema>;

export const DEFAULT_VALUES: Partial<Acquisition> = {
  vehicule_id: undefined,
  type_acquesition: undefined,
  fournisseur_id: undefined,
  date_acquesition: new Date(),
  prix_acquesition: null,
  duree_contrat: null,
  loyer_mensuel: null,
  option_achat: false,
  date_fin_contrat: null,
  valeur_residuelle: null,
  documents: [],
};