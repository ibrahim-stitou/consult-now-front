'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserCircle, CalendarIcon, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { FormSubmitButtons } from '@/components/custom/FormSubmitButtons';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Schéma de validation
const profileSchema = z.object({
  user: z.object({
    full_name: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
    email: z.string().email("Format d'email invalide"),
    telephone: z.string().optional(),
    password: z.string().optional().refine(value => !value || value.length >= 8, {
      message: "Le mot de passe doit contenir au moins 8 caractères",
    }),
  }),
  patient: z.object({
    birth_day: z.date().optional(),
    gender: z.string().optional(),
    blood_group: z.string().optional(),
    allergies: z.string().optional(),
    chronic_diseases: z.string().optional(),
    current_medications: z.string().optional(),
    weight: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    insurance_number: z.string().optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Reject {
  id: number;
  reason: string;
  rejectable_type: string;
  rejectable_id: number;
  created_at: string;
  updated_at: string;
}

interface PatientProfile {
  user: {
    id: number;
    role_id: number;
    full_name: string;
    telephone: string;
    email: string;
    status: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role: {
      id: number;
      name: string;
      code: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
    rejects?: Reject[];
  };
  patient: {
    id: number;
    user_id: number;
    birth_day: string | null;
    gender: string | null;
    blood_group: string | null;
    allergies: string | null;
    chronic_diseases: string | null;
    current_medications: string | null;
    weight: number | null;
    height: number | null;
    insurance_number: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    user?: {
      id: number;
      rejects?: Reject[];
    }
  };
}

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'new':
      return <Badge className="bg-blue-500">Nouveau</Badge>;
    case 'validated':
      return <Badge className="bg-green-500">Validé</Badge>;
    case 'to_validate':
      return <Badge className="bg-yellow-500">En attente</Badge>;
    case 'rejected':
      return <Badge className="bg-red-500">Rejeté</Badge>;
    case 'blocked':
      return <Badge className="bg-gray-500">Bloqué</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState<PatientProfile | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      user: {
        full_name: '',
        email: '',
        telephone: '',
        password: '',
      },
      patient: {
        birth_day: undefined,
        gender: '',
        blood_group: '',
        allergies: '',
        chronic_diseases: '',
        current_medications: '',
        weight: undefined,
        height: undefined,
        insurance_number: '',
      },
    },
    mode: 'onTouched'
  });

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger le profil du patient
        const profileResponse = await apiClient.get(apiRoutes.patient.completeProfile.get);
        if (profileResponse.data.success && profileResponse.data.data) {
          const data = profileResponse.data.data;
          setProfileData(data);

          // Si le status est différent de "new", ne montrez pas le formulaire par défaut
          if (data.user?.status && data.user.status !== "new") {
            setShowEditForm(false);
          } else {
            setShowEditForm(true);
          }

          // Pré-remplir le formulaire avec les données existantes
          setValue('user.full_name', data.user?.full_name || '');
          setValue('user.email', data.user?.email || '');
          setValue('user.telephone', data.user?.telephone || '');

          if (data.patient) {
            setValue('patient.gender', data.patient.gender || '');
            setValue('patient.blood_group', data.patient.blood_group || '');
            setValue('patient.allergies', data.patient.allergies || '');
            setValue('patient.chronic_diseases', data.patient.chronic_diseases || '');
            setValue('patient.current_medications', data.patient.current_medications || '');
            setValue('patient.weight', data.patient.weight ? parseFloat(data.patient.weight.toString()) : undefined);
            setValue('patient.height', data.patient.height ? parseFloat(data.patient.height.toString()) : undefined);
            setValue('patient.insurance_number', data.patient.insurance_number || '');

            if (data.patient.birth_day) {
              setValue('patient.birth_day', new Date(data.patient.birth_day));
            }
          }

          setProfileLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error("Impossible de charger les données du profil");
        setShowEditForm(true); // En cas d'erreur, montrer le formulaire d'édition
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setValue]);

  const getError = (fieldPath: string): string | undefined => {
    // Gestion des chemins imbriqués comme "user.full_name"
    const parts = fieldPath.split('.');
    let fieldError: any = errors;

    for (const part of parts) {
      if (!fieldError?.[part]) {
        fieldError = undefined;
        break;
      }
      fieldError = fieldError[part];
    }

    return fieldError?.message || backendErrors[fieldPath];
  };

  const clearBackendError = (field: string) => {
    if (backendErrors[field]) {
      setBackendErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setBackendErrors({});

      // Convertir la date en format string si elle existe
      const formattedData = {
        ...data,
        patient: {
          ...data.patient,
          birth_day: data.patient.birth_day ? format(new Date(data.patient.birth_day), 'yyyy-MM-dd') : null,
        }
      };

      // Si un profil existe déjà, utiliser l'API de mise à jour
      const endpoint = apiRoutes.patient.completeProfile.create;

      const response = await apiClient.post(endpoint, formattedData);

      if (response.data.success) {
        toast.success('Profil mis à jour avec succès');

        // Actualiser les données du profil
        const updatedProfileResponse = await apiClient.get(apiRoutes.patient.completeProfile.get);
        if (updatedProfileResponse.data.success) {
          setProfileData(updatedProfileResponse.data.data);
          setShowEditForm(false); // Revenir à la vue détails
        }
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission du formulaire:', error);

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.entries(serverErrors).forEach(([key, value]) => {
          const errorMessage = Array.isArray(value) ? value[0] : value;
          formattedErrors[key] = errorMessage as string;
        });

        setBackendErrors(formattedErrors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
      } else {
        toast.error(error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-6 w-[250px] bg-slate-200 animate-pulse rounded"></div>
              <div className="h-4 w-[350px] bg-slate-100 animate-pulse rounded"></div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-100 animate-pulse rounded h-[150px] md:col-span-2"></div>
            <div className="bg-slate-100 animate-pulse rounded h-[350px]"></div>
            <div className="bg-slate-100 animate-pulse rounded h-[350px]"></div>
          </div>
        </div>
      </PageContainer>
    );
  }
  const PatientProfileDetails = ({ user, patient, onEditClick }: PatientProfile & { onEditClick: () => void }) => (
    <>
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <Heading
            title="Profil patient"
            //@ts-ignore
            description={
              <div className="flex items-center gap-2 mt-1">
                <span>Vos informations personnelles et médicales</span>
                {getStatusBadge(user.status)}
              </div>
            }
          />
        </div>
      </div>
      <Separator />

      {/* Affichage des messages de rejet */}
      {/* Affichage des messages de rejet */}
      {user.status === 'rejected' && user.rejects && user.rejects.length > 0 && (
        <Alert variant="destructive" className="mb-6 mt-4">
          <AlertDescription className="mt-2">
            <p>Votre profil a été rejeté pour les raisons suivantes :</p>
            <ul className="list-disc pl-5 mt-2">
              {user.rejects.map((reject) => (
                <li key={reject.id}>{reject.reason || "Aucune raison fournie"}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-600" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{user.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{user.email}</dd>
              </div>
              {user.telephone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{user.telephone}</dd>
                </div>
              )}
              {patient.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genre</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}
                  </dd>
                </div>
              )}
              {patient.birth_day && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {format(new Date(patient.birth_day), 'dd MMMM yyyy', { locale: fr })}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Informations médicales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="space-y-4">
              {patient.insurance_number && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Numéro d'assurance</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{patient.insurance_number}</dd>
                </div>
              )}
              {patient.blood_group && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Groupe sanguin</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{patient.blood_group}</dd>
                </div>
              )}
              {(patient.height || patient.weight) && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mensurations</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {patient.height && `Taille: ${patient.height} cm`}
                    {patient.height && patient.weight && ' | '}
                    {patient.weight && `Poids: ${patient.weight} kg`}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {(patient.allergies || patient.chronic_diseases || patient.current_medications) && (
          <Card className="shadow-sm md:col-span-2 border-slate-200">
            <CardHeader className="bg-slate-50 border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
                Antécédents médicaux
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {patient.allergies && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Allergies</dt>
                    <dd className="text-sm text-gray-900">{patient.allergies}</dd>
                  </div>
                )}
                {patient.chronic_diseases && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Maladies chroniques</dt>
                    <dd className="text-sm text-gray-900">{patient.chronic_diseases}</dd>
                  </div>
                )}
                {patient.current_medications && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Médicaments actuels</dt>
                    <dd className="text-sm text-gray-900">{patient.current_medications}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        {showEditForm ? (
          // Formulaire d'édition
          <>
            <div className="flex items-center justify-between">
              <Heading
                title="Compléter votre profil"
                description="Ajoutez vos informations personnelles et médicales"
              />
            </div>
            <Separator />

            {profileData?.user?.status === 'rejected' && profileData.user.rejects && profileData.user.rejects.length > 0 && (
              <Alert variant="destructive" className="mb-6 mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Profil rejeté</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>Votre profil a été rejeté pour les raisons suivantes :</p>
                  <ul className="list-disc pl-5 mt-2">
                    {profileData.user.rejects.map((reject) => (
                      <li key={reject.id}>{reject.reason || "Aucune raison fournie"}</li>
                    ))}
                  </ul>
                  <p className="mt-2">Veuillez corriger les informations demandées et soumettre à nouveau votre profil.</p>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <Card className="overflow-hidden shadow-sm p-0 border-slate-200">
                <CardHeader className="bg-slate-50 p-4 border-b">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg font-medium">Informations personnelles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Nom complet */}
                    <Controller
                      name="user.full_name"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="user.full_name"
                          label="Nom complet"
                          required
                          error={getError('user.full_name')}
                          onFocus={() => clearBackendError('user.full_name')}
                        >
                          <Input
                            placeholder="Jean Dupont"
                            {...field}
                            className="h-10"
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Email */}
                    <Controller
                      name="user.email"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="user.email"
                          label="Email"
                          required
                          error={getError('user.email')}
                          onFocus={() => clearBackendError('user.email')}
                        >
                          <Input
                            placeholder="patient@exemple.com"
                            type="email"
                            {...field}
                            className="h-10"
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Téléphone */}
                    <Controller
                      name="user.telephone"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="user.telephone"
                          label="Téléphone"
                          error={getError('user.telephone')}
                          onFocus={() => clearBackendError('user.telephone')}
                        >
                          <Input
                            placeholder="0123456789"
                            {...field}
                            className="h-10"
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Genre */}
                    <Controller
                      name="patient.gender"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.gender"
                          label="Genre"
                          error={getError('patient.gender')}
                          onFocus={() => clearBackendError('patient.gender')}
                        >
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-10">
                              <SelectValue placeholder="Sélectionner un genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Homme</SelectItem>
                              <SelectItem value="female">Femme</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormFieldCustom>
                      )}
                    />

                    {/* Date de naissance */}
                    <Controller
                      name="patient.birth_day"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.birth_day"
                          label="Date de naissance"
                          error={getError('patient.birth_day')}
                          onFocus={() => clearBackendError('patient.birth_day')}
                        >
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-10",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "dd MMMM yyyy", { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value as Date}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormFieldCustom>
                      )}
                    />

                    {/* Mot de passe */}
                    <Controller
                      name="user.password"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="user.password"
                          label={profileLoaded ? "Mot de passe (laisser vide pour conserver l'actuel)" : "Mot de passe"}
                          required={!profileLoaded}
                          error={getError('user.password')}
                          onFocus={() => clearBackendError('user.password')}
                        >
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-10"
                          />
                        </FormFieldCustom>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations médicales */}
              <Card className="overflow-hidden shadow-sm p-0 border-slate-200">
                <CardHeader className="bg-slate-50 p-4 border-b">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg font-medium">Informations médicales</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Groupe sanguin */}
                    <Controller
                      name="patient.blood_group"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.blood_group"
                          label="Groupe sanguin"
                          error={getError('patient.blood_group')}
                          onFocus={() => clearBackendError('patient.blood_group')}
                        >
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-10">
                              <SelectValue placeholder="Sélectionner un groupe sanguin" />
                            </SelectTrigger>
                            <SelectContent>
                              {bloodGroups.map(group => (
                                <SelectItem key={group} value={group}>{group}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormFieldCustom>
                      )}
                    />

                    {/* Numéro d'assurance */}
                    <Controller
                      name="patient.insurance_number"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.insurance_number"
                          label="Numéro d'assurance"
                          error={getError('patient.insurance_number')}
                          onFocus={() => clearBackendError('patient.insurance_number')}
                        >
                          <Input
                            placeholder="INS12345678"
                            {...field}
                            className="h-10"
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Taille */}
                    <Controller
                      name="patient.height"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.height"
                          label="Taille (cm)"
                          error={getError('patient.height')}
                          onFocus={() => clearBackendError('patient.height')}
                        >
                          <Input
                            type="number"
                            placeholder="175"
                            {...field}
                            className="h-10"
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Poids */}
                    <Controller
                      name="patient.weight"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.weight"
                          label="Poids (kg)"
                          error={getError('patient.weight')}
                          onFocus={() => clearBackendError('patient.weight')}
                        >
                          <Input
                            type="number"
                            placeholder="70"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Allergies */}
                    <Controller
                      name="patient.allergies"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.allergies"
                          label="Allergies"
                          error={getError('patient.allergies')}
                          onFocus={() => clearBackendError('patient.allergies')}
                          className="md:col-span-2"
                        >
                          <Textarea
                            placeholder="Décrivez vos allergies connues"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Maladies chroniques */}
                    <Controller
                      name="patient.chronic_diseases"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.chronic_diseases"
                          label="Maladies chroniques"
                          error={getError('patient.chronic_diseases')}
                          onFocus={() => clearBackendError('patient.chronic_diseases')}
                          className="md:col-span-2"
                        >
                          <Textarea
                            placeholder="Listez vos maladies chroniques"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Médicaments actuels */}
                    <Controller
                      name="patient.current_medications"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="patient.current_medications"
                          label="Médicaments actuels"
                          error={getError('patient.current_medications')}
                          onFocus={() => clearBackendError('patient.current_medications')}
                          className="md:col-span-2"
                        >
                          <Textarea
                            placeholder="Listez les médicaments que vous prenez actuellement"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Boutons de soumission */}
              <FormSubmitButtons
                isSubmitting={isSubmitting}
                onCancel={() => {
                  if (profileData && profileData.user && profileData.user.status !== "new") {
                    setShowEditForm(false); // Revenir à la vue détaillée si le profil existe
                  } else {
                    router.push('/patient/overview');
                  }
                }}
              />
            </form>
          </>
        ) : (
          // Vue détaillée du profil
          profileData && profileData.user && profileData.patient && (
            <PatientProfileDetails
              user={profileData.user}
              patient={profileData.patient}
              onEditClick={() => setShowEditForm(true)}
            />
          )
        )}
      </div>
    </PageContainer>
  );
}