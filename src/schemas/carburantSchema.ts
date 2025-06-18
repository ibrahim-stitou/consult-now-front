import { z } from 'zod';

// Document schema for file uploads
const documentSchema = z.object({
  path: z.string().min(1, 'Le chemin du fichier est requis'),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});

export const carburantSchema = z.object({
  vehicule_id: z.number({
    required_error: 'Le véhicule est requis',
    invalid_type_error: 'Le véhicule doit être sélectionné'
  }).min(1, 'Veuillez sélectionner un véhicule'),

  station_id: z.number({
    required_error: 'La station est requise',
    invalid_type_error: 'La station doit être sélectionnée'
  }).min(1, 'Veuillez sélectionner une station'),

  litres: z.union([
    z.string(),
    z.number()
  ]).pipe(
    z.coerce.number({
      required_error: 'Les litres sont requis',
      invalid_type_error: 'Les litres doivent être un nombre'
    }).min(0.1, 'Les litres doivent être supérieurs à 0.1')
  ),

  date: z.date({
    required_error: 'La date est requise',
    invalid_type_error: 'La date doit être valide'
  }).refine((date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  }, 'La date ne peut pas être dans le futur'),

  prix_total: z.union([
    z.string(),
    z.number()
  ]).pipe(
    z.coerce.number({
      required_error: 'Le prix total est requis',
      invalid_type_error: 'Le prix total doit être un nombre'
    }).min(0, 'Le prix total doit être positif')
  ),

  kilometrage_avant: z.union([
    z.string(),
    z.number()
  ]).pipe(
    z.coerce.number({
      required_error: 'Le kilométrage est requis',
      invalid_type_error: 'Le kilométrage doit être un nombre'
    }).int('Le kilométrage doit être un nombre entier').min(0, 'Le kilométrage ne peut pas être négatif')
  ),
  notes: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});

export type Carburant = z.infer<typeof carburantSchema>;

export const DEFAULT_VALUES: Partial<Carburant> = {
  vehicule_id: undefined,
  station_id: undefined,
  litres: undefined,
  date: new Date(),
  prix_total: undefined,
  kilometrage_avant: undefined,
  notes: '',
  documents: [],
};