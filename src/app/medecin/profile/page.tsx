'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserCircle, CalendarIcon, FileText } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileUploader } from '@/components/custom/fileUpload';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { FormSubmitButtons } from '@/components/custom/FormSubmitButtons';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { DoctorProfileDetails } from '@/components/doctor/DoctorProfileDetails';

// Schema de validation
const profileSchema = z.object({
  user: z.object({
    full_name: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
    email: z.string().email("Format d'email invalide"),
    password: z.string().optional(),
  }),
  doctor: z.object({
    speciality_id: z.coerce.number().min(1, "Veuillez sélectionner une spécialité"),
    birth_date: z.date({
      required_error: "La date de naissance est requise",
    }),
    gender: z.string().min(1, "Veuillez sélectionner un genre"),
    national_id: z.string().min(1, "Le numéro d'identité nationale est requis"),
    license_number: z.string().min(1, "Le numéro de licence médicale est requis"),
    qualifications: z.string().min(1, "Les qualifications sont requises"),
    years_of_experience: z.coerce.number().min(0, "Veuillez entrer une valeur valide"),
    office_phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
    office_address: z.string().min(1, "L'adresse du cabinet est requise"),
    hospital_affiliation: z.string().optional(),
    consultation_fee: z.coerce.number().min(0, "Les frais de consultation doivent être positifs"),
  }),
  documents: z.array(z.object({
    path: z.string(),
    name: z.string(),
    description: z.string(),
  })).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Speciality {
  id: number;
  name: string;
}

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [documentFiles, setDocumentFiles] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
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
        password: '',
      },
      doctor: {
        speciality_id: 0,
        birth_date: undefined,
        gender: '',
        national_id: '',
        license_number: '',
        qualifications: '',
        years_of_experience: 0,
        office_phone: '',
        office_address: '',
        hospital_affiliation: '',
        consultation_fee: 0,
      },
      documents: [],
    },
    mode: 'onTouched'
  });

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les spécialités
        const specialitiesResponse = await apiClient.get(`${apiRoutes.medecin.profile.get}/specialities`);
        if (specialitiesResponse.data.success) {
          setSpecialities(specialitiesResponse.data.data);
        } else {
          setSpecialities([
            { id: 1, name: 'Médecine générale' },
            { id: 2, name: 'Cardiologie' },
            { id: 3, name: 'Dermatologie' },
            { id: 4, name: 'Pédiatrie' },
            { id: 5, name: 'Psychiatrie' },
            { id: 6, name: 'Ophtalmologie' },
            { id: 7, name: 'Orthopédie' }
          ]);
        }

        // Charger le profil du médecin
        const profileResponse = await apiClient.get(apiRoutes.medecin.profile.get);
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

          if (data.doctor) {
            setValue('doctor.speciality_id', data.doctor.speciality_id || 0);
            setValue('doctor.gender', data.doctor.gender || '');
            setValue('doctor.national_id', data.doctor.national_id || '');
            setValue('doctor.license_number', data.doctor.license_number || '');
            setValue('doctor.qualifications', data.doctor.qualifications || '');
            setValue('doctor.years_of_experience', data.doctor.years_of_experience || 0);
            setValue('doctor.office_phone', data.doctor.office_phone || '');
            setValue('doctor.office_address', data.doctor.office_address || '');
            setValue('doctor.hospital_affiliation', data.doctor.hospital_affiliation || '');
            setValue('doctor.consultation_fee', parseFloat(data.doctor.consultation_fee) || 0);

            if (data.doctor.birth_date) {
              setValue('doctor.birth_date', new Date(data.doctor.birth_date));
            }
          }

          if (data.documents && data.documents.length > 0) {
            setDocumentFiles(data.documents);
            setValue('documents', data.documents);
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

  // Mettre à jour les documents dans le formulaire lorsque les fichiers changent
  useEffect(() => {
    if (documentFiles.length > 0) {
      const documentsData = documentFiles.map(file => ({
        path: file.path || '',
        name: file.name || '',
        description: file.description || 'Document médical',
      }));
      setValue('documents', documentsData);
    }
  }, [documentFiles, setValue]);

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

      // Convertir la date en format string
      const formattedData = {
        ...data,
        doctor: {
          ...data.doctor,
          birth_date: data.doctor.birth_date ? format(new Date(data.doctor.birth_date), 'yyyy-MM-dd') : null,
        }
      };

      // Si un profil existe déjà, utiliser l'API de mise à jour
      const endpoint = profileLoaded ?
        apiRoutes.medecin.profile.update :
        apiRoutes.medecin.profile.create;

      const response = await apiClient.post(endpoint, formattedData);

      if (response.data.success) {
        toast.success('Profil mis à jour avec succès');

        // Actualiser les données du profil
        const updatedProfileResponse = await apiClient.get(apiRoutes.medecin.profile.get);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-100 animate-pulse rounded h-[150px] md:col-span-3"></div>
            <div className="bg-slate-100 animate-pulse rounded h-[350px] md:col-span-2"></div>
            <div className="bg-slate-100 animate-pulse rounded h-[350px]"></div>
            <div className="bg-slate-100 animate-pulse rounded h-[350px] md:col-span-3"></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        {showEditForm ? (
          // Formulaire d'édition
          <>
            <div className="flex items-center justify-between">
              <Heading
                title="Compléter votre profil"
                description="Ajoutez vos informations professionnelles pour finaliser votre inscription"
              />
            </div>
            <Separator />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <Card className="overflow-hidden shadow-sm p-0">
                <CardHeader className="bg-slate-50 p-3">
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
                            placeholder="Dr. John Doe"
                            {...field}
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
                            placeholder="docteur@exemple.com"
                            type="email"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Genre */}
                    <Controller
                      name="doctor.gender"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.gender"
                          label="Genre"
                          required
                          error={getError('doctor.gender')}
                          onFocus={() => clearBackendError('doctor.gender')}
                        >
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
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
                      name="doctor.birth_date"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.birth_date"
                          label="Date de naissance"
                          required
                          error={getError('doctor.birth_date')}
                          onFocus={() => clearBackendError('doctor.birth_date')}
                        >
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
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
                                  date > new Date() || date < new Date(1940, 0, 1)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormFieldCustom>
                      )}
                    />

                    {/* Numéro d'identité nationale */}
                    <Controller
                      name="doctor.national_id"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.national_id"
                          label="Numéro d'identité nationale"
                          required
                          error={getError('doctor.national_id')}
                          onFocus={() => clearBackendError('doctor.national_id')}
                        >
                          <Input
                            placeholder="123456789"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Mot de passe (facultatif) */}
                    <Controller
                      name="user.password"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="user.password"
                          label="Mot de passe (laisser vide pour conserver l'actuel)"
                          error={getError('user.password')}
                          onFocus={() => clearBackendError('user.password')}
                        >
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations professionnelles */}
              <Card className="overflow-hidden shadow-sm p-0">
                <CardHeader className="bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg font-medium">Informations professionnelles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Spécialité */}
                    <Controller
                      name="doctor.speciality_id"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.speciality_id"
                          label="Spécialité"
                          required
                          error={getError('doctor.speciality_id')}
                          onFocus={() => clearBackendError('doctor.speciality_id')}
                        >
                          <Select
                            value={field.value ? field.value.toString() : ''}
                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner une spécialité" />
                            </SelectTrigger>
                            <SelectContent>
                              {specialities.map((speciality) => (
                                <SelectItem key={speciality.id} value={speciality.id.toString()}>
                                  {speciality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormFieldCustom>
                      )}
                    />

                    {/* Numéro de licence */}
                    <Controller
                      name="doctor.license_number"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.license_number"
                          label="Numéro de licence médicale"
                          required
                          error={getError('doctor.license_number')}
                          onFocus={() => clearBackendError('doctor.license_number')}
                        >
                          <Input
                            placeholder="MED12345"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Qualifications */}
                    <Controller
                      name="doctor.qualifications"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.qualifications"
                          label="Qualifications"
                          required
                          error={getError('doctor.qualifications')}
                          onFocus={() => clearBackendError('doctor.qualifications')}
                        >
                          <Input
                            placeholder="ex: MBBS, MD"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Années d'expérience */}
                    <Controller
                      name="doctor.years_of_experience"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.years_of_experience"
                          label="Années d'expérience"
                          required
                          error={getError('doctor.years_of_experience')}
                          onFocus={() => clearBackendError('doctor.years_of_experience')}
                        >
                          <Input
                            type="number"
                            min="0"
                            placeholder="10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Téléphone du cabinet */}
                    <Controller
                      name="doctor.office_phone"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.office_phone"
                          label="Téléphone du cabinet"
                          required
                          error={getError('doctor.office_phone')}
                          onFocus={() => clearBackendError('doctor.office_phone')}
                        >
                          <Input
                            placeholder="0123456789"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Adresse du cabinet */}
                    <Controller
                      name="doctor.office_address"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.office_address"
                          label="Adresse du cabinet"
                          required
                          error={getError('doctor.office_address')}
                          onFocus={() => clearBackendError('doctor.office_address')}
                        >
                          <Input
                            placeholder="123 Rue Médicale, Ville"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Affiliation hospitalière */}
                    <Controller
                      name="doctor.hospital_affiliation"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.hospital_affiliation"
                          label="Affiliation hospitalière"
                          error={getError('doctor.hospital_affiliation')}
                          onFocus={() => clearBackendError('doctor.hospital_affiliation')}
                        >
                          <Input
                            placeholder="Hôpital Central"
                            {...field}
                          />
                        </FormFieldCustom>
                      )}
                    />

                    {/* Frais de consultation */}
                    <Controller
                      name="doctor.consultation_fee"
                      control={control}
                      render={({ field }) => (
                        <FormFieldCustom
                          name="doctor.consultation_fee"
                          label="Frais de consultation (MAD)"
                          required
                          error={getError('doctor.consultation_fee')}
                          onFocus={() => clearBackendError('doctor.consultation_fee')}
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormFieldCustom>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="overflow-hidden shadow-sm p-0">
                <CardHeader className="bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg font-medium">Documents</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <FormFieldCustom
                    name="documents"
                    label="Documents professionnels"
                    error={backendErrors['documents']}
                    onFocus={() => clearBackendError('documents')}
                  >
                    <FileUploader
                      value={documentFiles}
                      onChange={(files) => {
                        setDocumentFiles(files);
                        clearBackendError('documents');
                      }}
                      accept={{
                        'application/pdf': ['.pdf'],
                        'image/*': ['.png', '.jpg', '.jpeg', '.webp']
                      }}
                      maxSize={5} // 5MB
                      maxFiles={3}
                      multiple={true}
                      showPreview={true}
                      className="h-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Documents requis: licence médicale, diplômes, certifications (formats acceptés: PDF, PNG, JPG, JPEG, WEBP - max 5MB par fichier)
                    </p>
                  </FormFieldCustom>
                </CardContent>
              </Card>

              {/* Boutons de soumission */}
              <FormSubmitButtons
                isSubmitting={isSubmitting}
                onCancel={() => {
                  if (profileData && profileData.user && profileData.user.status !== "new") {
                    setShowEditForm(false); // Revenir à la vue détaillée si le profil existe
                  } else {
                    router.push('/medecin/overview');
                  }
                }}
              />
            </form>
          </>
        ) : (
          // Vue détaillée du profil
          profileData && profileData.user && profileData.doctor && (
            //@ts-ignore
            <DoctorProfileDetails
              user={profileData.user}
              doctor={profileData.doctor}
              onEditClick={() => setShowEditForm(true)}
              documents={profileData.doctor.media || []}
            />
          )
        )}
      </div>
    </PageContainer>
  );
}