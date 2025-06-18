'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { FormSubmitButtons } from '@/components/custom/FormSubmitButtons';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

// Schéma de validation pour le formulaire
const userSchema = z.object({
  full_name: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  email: z.string().email("Format d'email invalide"),
  telephone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role_id: z.string().min(1, "Veuillez sélectionner un rôle"),
  status: z.string().min(1, "Veuillez sélectionner un statut")
});

type UserFormData = z.infer<typeof userSchema>;

const DEFAULT_VALUES: UserFormData = {
  full_name: '',
  email: '',
  telephone: '',
  password: '',
  role_id: '',
  status: 'new'
};

export default function NewUser() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched'
  });

  const getError = (field: keyof UserFormData): string | undefined => {
    return errors[field]?.message || backendErrors[field];
  };

  const clearBackendError = (field: keyof UserFormData) => {
    if (backendErrors[field]) {
      setBackendErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setBackendErrors({});
      setIsSubmitting(true);

      // Préparer les données
      const payload = {
        full_name: data.full_name,
        email: data.email,
        telephone: data.telephone,
        password: data.password,
        role_id: parseInt(data.role_id, 10),
        status: data.status
      };

      console.log('Submitting form with data:', payload);
      const response = await apiClient.post(apiRoutes.admin.users.create, payload);

      if (response.data.success || response.status === 200 || response.status === 201) {
        toast.success('Utilisateur ajouté avec succès');
        router.push('/admin/users');
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.keys(serverErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(serverErrors[key])
            ? serverErrors[key][0]
            : serverErrors[key];
        });

        setBackendErrors(formattedErrors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
      } else {
        const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'ajout de l'utilisateur";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Heading
            title="Nouvel Utilisateur"
            description="Créer un nouvel utilisateur dans le système"
          />
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            size="sm"
          >
            Retour
          </Button>
        </div>
        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Informations de l&apos;utilisateur</h3>
              </div>

              {/* Nom complet */}
              <div className="mb-6">
                <Controller
                  name="full_name"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="full_name"
                      label="Nom complet"
                      required
                      error={getError('full_name')}
                      onFocus={() => clearBackendError('full_name')}
                    >
                      <Input
                        placeholder="Prénom et nom de l'utilisateur"
                        {...field}
                      />
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Email et Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="email"
                      label="Adresse email"
                      required
                      error={getError('email')}
                      onFocus={() => clearBackendError('email')}
                    >
                      <Input
                        type="email"
                        placeholder="exemple@domaine.com"
                        {...field}
                      />
                    </FormFieldCustom>
                  )}
                />

                <Controller
                  name="telephone"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="telephone"
                      label="Numéro de téléphone"
                      required
                      error={getError('telephone')}
                      onFocus={() => clearBackendError('telephone')}
                    >
                      <Input
                        placeholder="0XXXXXXXXX"
                        {...field}
                      />
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Mot de passe */}
              <div className="mb-6">
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="password"
                      label="Mot de passe"
                      required
                      error={getError('password')}
                      onFocus={() => clearBackendError('password')}
                    >
                      <Input
                        type="password"
                        placeholder="Mot de passe sécurisé"
                        {...field}
                      />
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Rôle et Statut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Controller
                  name="role_id"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="role_id"
                      label="Rôle"
                      required
                      error={getError('role_id')}
                      onFocus={() => clearBackendError('role_id')}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Patient</SelectItem>
                          <SelectItem value="2">Médecin</SelectItem>
                          <SelectItem value="3">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormFieldCustom>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="status"
                      label="Statut"
                      required
                      error={getError('status')}
                      onFocus={() => clearBackendError('status')}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nouveau</SelectItem>
                          <SelectItem value="validated">Validé</SelectItem>
                          <SelectItem value="blocked">Bloqué</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormFieldCustom>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Boutons de soumission */}
          <FormSubmitButtons
            isSubmitting={isSubmitting}
            onCancel={() => router.push('/admin/users')}
          />
        </form>
      </div>
    </PageContainer>
  );
}