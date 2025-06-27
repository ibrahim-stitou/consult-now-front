'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Shield, Car, Gauge } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FileUploader, UploadedFile } from '@/components/custom/fileUpload';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { FormSubmitButtons } from '@/components/custom/FormSubmitButtons';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { assuranceSchema, Assurance, DEFAULT_VALUES } from '@/schemas/assuranceSchema';

interface Media {
  id: number;
  model_type: string;
  model_id: number;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  custom_properties: {
    type: string;
    description: string | null;
  };
  original_url: string;
  preview_url: string;
}

interface FormFile {
  path: string;
  name: string;
  size: number;
  type: string;
  customId?: string;
}

export default function ModifierAssurance() {
  const router = useRouter();
  const params = useParams();
  const assuranceId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [assurance, setAssurance] = useState<Assurance | null>(null);
  const [existingDocuments, setExistingDocuments] = useState<Media[]>([]);
  const [documentsToDelete, setDocumentsToDelete] = useState<number[]>([]);
  const [documentFiles, setDocumentFiles] = useState<FormFile[]>([]);
  const [vehicles, setVehicles] = useState<{ id: number; immatriculation: string }[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [garanties, setGaranties] = useState<{ id: number; nom: string }[]>([]);
  const [garantiesLoading, setGarantiesLoading] = useState(true);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<Assurance>({
    resolver: zodResolver(assuranceSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur'
  });

  const assuranceType = watch('type_assurance');

  // Fetch assurance details
  useEffect(() => {
    const fetchAssuranceDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.admin.assurances.get(assuranceId));

        if (response.data.success) {
          const data = response.data.data;

          // Format dates
          if (data.date_debut) {
            data.date_debut = new Date(data.date_debut);
          }
          if (data.date_fin) {
            data.date_fin = new Date(data.date_fin);
          }

          // Format vehicules
          if (data.vehicules) {
            data.vehicules = data.vehicules.map((v: any) => v.id);
          }

          // Format garanties
          if (data.garanties) {
            data.garanties = data.garanties.map((g: any) => g.id);
          }

          // Set media/documents
          if (data.media) {
            setExistingDocuments(data.media);
          }

          setAssurance(data);

          // Set form values
          setValue('compagnie', data.compagnie);
          setValue('reference', data.reference);
          setValue('date_debut', new Date(data.date_debut));
          setValue('date_fin', new Date(data.date_fin));
          setValue('type_couverture', data.type_couverture);
          setValue('type_assurance', data.type_assurance);
          setValue('is_international', data.is_international);
          setValue('vehicules', data.vehicules);
          setValue('garanties', data.garanties);
        } else {
          toast.error('Impossible de récupérer les détails de cette assurance');
        }
      } catch (error) {
        console.error('Error fetching assurance details:', error);
        toast.error('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchAssuranceDetails();
  }, [assuranceId, setValue]);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setVehiclesLoading(true);
      try {
        const response = await apiClient.get(apiRoutes.admin.vehicules.list);
        if (response.data.status === 'success') {
          setVehicles(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setVehiclesLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Fetch garanties
  useEffect(() => {
    const fetchGaranties = async () => {
      setGarantiesLoading(true);
      try {
        const response = await apiClient.get(apiRoutes.admin.garanties.list);
        if (response.data.status === 'success') {
          setGaranties(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching garanties:', error);
      } finally {
        setGarantiesLoading(false);
      }
    };

    fetchGaranties();
  }, []);

  const getError = (field: string) => {
    return errors[field as keyof Assurance]?.message || backendErrors[field];
  };

  const clearBackendError = (field: string) => {
    if (backendErrors[field]) {
      setBackendErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatDate = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    if (date instanceof Date) {
      return format(date, 'yyyy-MM-dd');
    }
    return String(date);
  };

  const handleDeleteDocument = (documentId: number) => {
    setDocumentsToDelete(prev => [...prev, documentId]);
    setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const onSubmit = async (data: Assurance) => {
    try {
      setBackendErrors({});
      setIsSubmitting(true);

      // Vérifier que les véhicules sont sélectionnés
      if (!data.vehicules || data.vehicules.length === 0) {
        setBackendErrors({ vehicules: "Veuillez sélectionner au moins un véhicule" });
        toast.error("Veuillez sélectionner au moins un véhicule");
        return;
      }

      // Préparer les données
      const payload = {
        compagnie: data.compagnie,
        reference: data.reference,
        date_debut: formatDate(data.date_debut),
        date_fin: formatDate(data.date_fin),
        type_couverture: data.type_couverture,
        type_assurance: data.type_assurance,
        is_international: data.is_international || false,
        vehicules: data.vehicules || [],
        garanties: data.garanties || [],
        documents: documentFiles.length > 0 ? documentFiles.map(file => ({
          path: file.path,
          name: file.name,
          type: 'assurance',
          description: 'Document d\'assurance'
        })) : [],
        delete_documents: documentsToDelete
      };

      console.log('Submitting form with data:', payload);
      const response = await apiClient.put(apiRoutes.admin.assurances.update(assuranceId), payload);

      if (response.data.success || response.data.status === 'success') {
        toast.success('Assurance mise à jour avec succès');
        router.push('/admin/flotte/assurances');
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
        const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la modification de l'assurance";
        toast.error(errorMessage);
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
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Separator />
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!assurance) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <Heading
              title="Erreur"
              description="Impossible de charger les détails de l'assurance"
            />
            <Button onClick={() => router.push('/admin/flotte/assurances')}>
              Retour à la liste
            </Button>
          </div>
          <Separator />
          <Card>
            <CardContent className="p-6 text-center text-red-500">
              Les données de l&apos;assurance n&apos;ont pas pu être chargées. Veuillez réessayer plus tard.
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Heading
            title="Modifier l'assurance"
            description={`Modifier l'assurance ${assurance.reference}`}
          />
          <Button
            variant="outline"
            onClick={() => router.push('/admin/flotte/assurances')}
            size="sm"
          >
            Retour
          </Button>
        </div>
        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Informations de l&apos;Assurance</h3>
              </div>

              {/* Compagnie et Référence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Controller
                  name="compagnie"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="compagnie"
                      label="Compagnie d'assurance"
                      required
                      error={getError('compagnie')}
                      onFocus={() => clearBackendError('compagnie')}
                    >
                      <Input
                        placeholder="Nom de la compagnie"
                        {...field}
                      />
                    </FormFieldCustom>
                  )}
                />

                <Controller
                  name="reference"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="reference"
                      label="Référence de la police"
                      required
                      error={getError('reference')}
                      onFocus={() => clearBackendError('reference')}
                    >
                      <Input
                        placeholder="ex: ASS-12345"
                        {...field}
                      />
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Controller
                  name="date_debut"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="date_debut"
                      label="Date de début"
                      required
                      error={getError('date_debut')}
                      onFocus={() => clearBackendError('date_debut')}
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
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormFieldCustom>
                  )}
                />

                <Controller
                  name="date_fin"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="date_fin"
                      label="Date de fin"
                      required
                      error={getError('date_fin')}
                      onFocus={() => clearBackendError('date_fin')}
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
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            fromDate={watch('date_debut') ? new Date(watch('date_debut')) : undefined}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Controller
                  name="type_couverture"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="type_couverture"
                      label="Type de couverture"
                      required
                      error={getError('type_couverture')}
                      onFocus={() => clearBackendError('type_couverture')}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner le type de couverture" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="responsabilite_civile">Responsabilité Civile</SelectItem>
                          <SelectItem value="tiers">Tiers</SelectItem>
                          <SelectItem value="tous_risques">Tous Risques</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormFieldCustom>
                  )}
                />

                <Controller
                  name="type_assurance"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="type_assurance"
                      label="Type d'assurance"
                      required
                      error={getError('type_assurance')}
                      onFocus={() => clearBackendError('type_assurance')}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner le type d'assurance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individuelle">Individuelle</SelectItem>
                          <SelectItem value="flotte">Flotte</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Checkbox international */}
              <div className="mb-6">
                <Controller
                  name="is_international"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="is_international"
                      error={getError('is_international')}
                      onFocus={() => clearBackendError('is_international')}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          id="is_international"
                        />
                        <Label
                          htmlFor="is_international"
                          className="font-medium text-sm cursor-pointer"
                        >
                          Assurance internationale
                        </Label>
                      </div>
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Sélection des véhicules */}
              <div className="mb-6">
                <Controller
                  name="vehicules"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="vehicules"
                      label={`Véhicule${assuranceType === 'flotte' ? 's' : ''}`}
                      required
                      error={getError('vehicules')}
                      onFocus={() => clearBackendError('vehicules')}
                    >
                      {assuranceType === 'individuelle' ? (
                        <Select
                          value={field.value && field.value.length > 0 ? String(field.value[0]) : ''}
                          onValueChange={(value) => {
                            if (value) field.onChange([parseInt(value, 10)]);
                          }}
                          disabled={vehiclesLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={vehiclesLoading ? "Chargement..." : "Sélectionner un véhicule"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                {vehicle.immatriculation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                          {vehiclesLoading ? (
                            <div className="py-2 text-center">Chargement des véhicules...</div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {vehicles.map((vehicle) => (
                                <div key={vehicle.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`vehicle-${vehicle.id}`}
                                    checked={(field.value || []).includes(vehicle.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), vehicle.id]);
                                      } else {
                                        field.onChange(
                                          (field.value || []).filter((id) => id !== vehicle.id)
                                        );
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`vehicle-${vehicle.id}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {vehicle.immatriculation}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Sélection des garanties */}
              <div className="mb-6">
                <Controller
                  name="garanties"
                  control={control}
                  render={({ field }) => (
                    <FormFieldCustom
                      name="garanties"
                      label="Garanties"
                      error={getError('garanties')}
                      onFocus={() => clearBackendError('garanties')}
                    >
                      <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                        {garantiesLoading ? (
                          <div className="py-2 text-center">Chargement des garanties...</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {garanties.map((garantie) => (
                              <div key={garantie.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`garantie-${garantie.id}`}
                                  checked={(field.value || []).includes(garantie.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), garantie.id]);
                                    } else {
                                      field.onChange(
                                        (field.value || []).filter((id) => id !== garantie.id)
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`garantie-${garantie.id}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {garantie.nom}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormFieldCustom>
                  )}
                />
              </div>

              {/* Documents existants */}
              {existingDocuments.length > 0 && (
                <div className="mb-6">
                  <FormFieldCustom
                    name="existing_documents"
                    label="Documents existants"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {existingDocuments.map((doc) => (
                        <div key={doc.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <Badge variant="outline">
                              {doc.mime_type.split('/')[1] || 'Document'}
                            </Badge>
                          </div>

                          {doc.mime_type.startsWith('image/') ? (
                            <div className="relative h-40 w-full overflow-hidden rounded-md mb-2">
                              <img
                                src={doc.original_url}
                                alt={doc.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="relative h-40 w-full overflow-hidden rounded-md mb-2 bg-gray-100 flex items-center justify-center">
                              <Shield className="h-16 w-16 text-gray-400" />
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => window.open(doc.original_url, '_blank')}
                            >
                              Voir
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormFieldCustom>
                </div>
              )}

              {/* Upload de documents */}
              <div>
                <FormFieldCustom
                  name="documents"
                  label="Ajouter des documents"
                  error={backendErrors['documents']}
                  onFocus={() => clearBackendError('documents')}
                >
                  <FileUploader
                    //@ts-ignore
                    value={documentFiles}
                    onChange={(files) => {
                      //@ts-ignore
                      setDocumentFiles(files);
                      clearBackendError('documents');
                    }}
                    accept={{
                      'application/pdf': ['.pdf'],
                      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
                    }}
                    maxSize={5} // 5MB
                    maxFiles={2}
                    multiple={true}
                    showPreview={true}
                    className="h-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formats acceptés: PDF, PNG, JPG, JPEG, WEBP (max 5MB par fichier)
                  </p>
                </FormFieldCustom>
              </div>
            </CardContent>
          </Card>

          {/* Boutons de soumission */}
          <FormSubmitButtons
            isSubmitting={isSubmitting}
            onCancel={() => router.push('/admin/flotte/assurances')}
          />
        </form>
      </div>
    </PageContainer>
  );
}