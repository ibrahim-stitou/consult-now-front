import * as z from 'zod';

const currentYear = new Date().getFullYear();

const vehiculeSchema = z.object({
  immatriculation: z
    .string()
    .min(1, { message: "L'immatriculation est requise" })
    .max(255, { message: "L'immatriculation ne peut pas dépasser 255 caractères" }),
  immatriculation_anterieur: z
    .string()
    .max(255, { message: "L'immatriculation antérieure ne peut pas dépasser 255 caractères" })
    .optional()
    .nullable(),
  model_id: z.coerce
    .number()
    .int()
    .min(1, { message: 'Le modèle est requis' }),
  vehicule_type_id: z.coerce
    .number()
    .int()
    .min(1, { message: 'Le type de véhicule est requis' }),
  carte_grise: z
    .string()
    .min(1, { message: 'Le numéro de carte grise est requis' })
    .max(255, { message: 'Le numéro de carte grise ne peut pas dépasser 255 caractères' }),
  annee_fabrication: z.coerce
    .number()
    .int()
    .min(1900, { message: "L'année de fabrication doit être au minimum 1900" })
    .max(currentYear + 1, { message: `L'année de fabrication doit être au maximum ${currentYear + 1}` }),
  vin: z
    .string()
    .min(1, { message: 'Le numéro de chassis est requis' })
    .max(17, { message: 'Le numéro de chassis ne peut pas dépasser 17 caractères' }),
  statut: z.enum(['actif', 'en_maintenance', 'hors_service'], {
    required_error: 'Le statut est requis'
  }),
  usage: z
    .string()
    .min(1, { message: "L'usage est requis" })
    .max(255, { message: "L'usage ne peut pas dépasser 255 caractères" })
    .nullable()
    .optional(),
  date_mutation: z.date().nullable().optional(),
  date_mc: z.date().nullable().optional(),
  proprietaire: z
    .string()
    .min(1, { message: 'Le propriétaire est requis' })
    .max(255, { message: 'Le propriétaire ne peut pas dépasser 255 caractères' }),
  carburant: z.enum(['diesel', 'essence', 'electrique', 'hybride'], {
    required_error: 'Le type de carburant est requis'
  }),
  nombre_cylindre: z.coerce
    .number()
    .int()
    .min(1, { message: 'Le nombre de cylindres doit être supérieur à 0' })
    .max(20, { message: 'Le nombre de cylindres doit être inférieur à 20' })
    .nullable()
    .optional(),
  puissance_fiscale: z.coerce
    .number()
    .int()
    .min(1, { message: 'La puissance fiscale est requise et doit être supérieure à 0' }),
  nombre_place: z.coerce
    .number()
    .int()
    .min(1, { message: 'Le nombre de places est requis et doit être supérieur à 0' })
    .max(100, { message: 'Le nombre de places doit être inférieur à 100' }),
  kilometrage_initial: z.coerce
    .number()
    .int()
    .min(0, { message: 'Le kilométrage initial est requis et doit être positif' }),
  pv: z.coerce
    .number()
    .min(0, { message: 'Le poids à vide doit être positif' })
    .nullable()
    .optional(),
  ptac: z.coerce
    .number()
    .min(0, { message: 'Le PTAC doit être positif' })
    .nullable()
    .optional(),
  ptmct: z.coerce
    .number()
    .min(0, { message: 'Le PTMCT doit être positif' })
    .nullable()
    .optional(),
  // Remove the FileList validation as we're handling files separately with the FileUploader
  images: z.array(z.any()).optional(),
  carte_grise_document: z.any().optional()
});

const DEFAULT_VALUES: Vehicule = {
  immatriculation: '',
  immatriculation_anterieur: '',
  carte_grise: '',
  annee_fabrication: new Date().getFullYear(),
  model_id: 0,
  vehicule_type_id: 0,
  vin: '',
  statut: 'actif',
  usage: '',
  proprietaire: '',
  date_mutation: undefined,
  date_mc: undefined,
  carburant: 'diesel',
  nombre_cylindre: undefined,
  puissance_fiscale: 1,
  nombre_place: 5,
  kilometrage_initial: 0,
  pv: undefined,
  ptac: undefined,
  ptmct: undefined,
  images: [],
  carte_grise_document: undefined
};

export { vehiculeSchema, DEFAULT_VALUES };
export type Vehicule = z.infer<typeof vehiculeSchema>;