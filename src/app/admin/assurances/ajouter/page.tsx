'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarIcon, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { FormSubmitButtons } from '@/components/custom/FormSubmitButtons';
import { FileUploader } from '@/components/custom/fileUpload';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { assuranceSchema, DEFAULT_VALUES, type Assurance } from '@/schemas/assuranceSchema';
import { Vehicule, Garantie } from '@/types/assuranceType';

export default function NewInsurance() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  const [documentFiles, setDocumentFiles] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [garanties, setGaranties] = useState<Garantie[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [garantiesLoading, setGarantiesLoading] = useState(true);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<Assurance>({
    resolver: zodResolver(assuranceSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched'
  });

  const assuranceType = watch('type_assurance');

  // Load vehicles data
  useEffect(() => {
    const fetchVehicles = async () => {
      setVehiclesLoading(true);
      try {
        const response = await apiClient.get(apiRoutes.admin.vehicules.list);
        if (response.data.data) {
          setVehicles(response.data.data.map((v: any) => ({
            id: v.id,
            immatriculation: v.immatriculation
          })));
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast.error('Erreur lors du chargement des véhicules');
        // Fallback avec quelques véhicules fictifs pour éviter un état vide
        setVehicles([
          { id: 1, immatriculation: 'ABC-123-45' },
          { id: 2, immatriculation: 'DEF-678-90' }
        ]);
      } finally {
        setVehiclesLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Load garanties data
  useEffect(() => {
    const fetchGaranties = async () => {
      setGarantiesLoading(true);
      try {
        const response = await apiClient.get(apiRoutes.admin.garanties?.list || '/api/garanties');
        if (response.data.data) {
          setGaranties(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching garanties:', error);
        // Utiliser des données fictives si l'API échoue
        setGaranties([
          { id: 1, nom: 'Dommages matériels', description: 'Couverture des dommages matériels' },
          { id: 2, nom: 'Dommages corporels', description: 'Couverture des dommages corporels' },
          { id: 3, nom: 'Vol', description: 'Protection contre le vol du véhicule' },
          { id: 4, nom: 'Incendie', description: 'Protection contre l\'incendie' },
          { id: 5, nom: 'Bris de glace', description: 'Couverture des bris de glace' }
        ]);
      } finally {
        setGarantiesLoading(false);
      }
    };

    fetchGaranties();
  }, []);

  // Update form documents when files change
  useEffect(() => {
    if (documentFiles.length > 0) {
      const documentsData = documentFiles.map(file => ({
        path: file.path || '',
        name: file.name || '',
        type: 'assurance',
        description: 'Document d\'assurance'
      }));
      setValue('documents', documentsData);
    }
  }, [documentFiles, setValue]);

  const getError = (field: keyof Assurance): string | undefined => {
    return errors[field]?.message as string || backendErrors[field];
  };

  const clearBackendError = (field: keyof Assurance) => {
    if (backendErrors[field]) {
      setBackendErrors(prev => {
        const newErrors = { ...prev };
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
        })) : []
      };

      console.log('Submitting form with data:', payload);
      const response = await apiClient.post(apiRoutes.admin.assurances.create, payload);

      if (response.data.success || response.data.status === 'success') {
        toast.success('Assurance ajoutée avec succès');
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
        const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'ajout de l'assurance";
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
            title="Nouvelle Assurance"
            description="Enregistrez une nouvelle assurance"
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
                            type="button" // Important pour éviter soumission accidentelle
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
                            type="button" // Important pour éviter soumission accidentelle
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
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Réinitialiser les véhicules lors du changement du type d'assurance
                          setValue('vehicules', []);
                        }}
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

              {/* Upload de documents */}
              <div className="mt-6">
                <FormFieldCustom
                  name="documents"
                  label="Documents d'assurance"
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
                    maxFiles={1}
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