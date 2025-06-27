'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarIcon, FileEdit, Shield, ListChecks, Calendar, Car, Globe, Check, Receipt, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { formatDate, formatNumber, cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

interface Media {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  manipulations: any[];
  custom_properties: {
    type: string;
    description: string | null;
  };
  generated_conversions: any[];
  responsive_images: any[];
  order_column: number;
  created_at: string;
  updated_at: string;
  original_url: string;
  preview_url: string;
}

interface Vehicule {
  id: number;
  immatriculation: string;
  immatriculation_anterieur: string;
  model_id: number;
  vehicule_type_id: number;
  carte_grise: string;
  annee_fabrication: number;
  vin: string;
  statut: string;
  usage: string;
  date_mutation: string;
  date_mc: string;
  proprietaire: string;
  carburant: string;
  nombre_cylindre: number;
  puissance_fiscale: number;
  nombre_place: number;
  kilometrage_initial: number;
  pv: string;
  ptac: string;
  ptmct: string;
  created_at: string;
  updated_at: string;
  media: Media[];
  pivot: {
    assurance_id: number;
    vehicule_id: number;
  };
}

interface Garantie {
  id: number;
  nom: string;
  created_at: string;
  updated_at: string;
  pivot: {
    assurance_id: number;
    garantie_id: number;
  };
}

interface AssuranceData {
  id: number;
  compagnie: string;
  reference: string;
  date_debut: string;
  date_fin: string;
  type_couverture: string;
  type_assurance: string;
  is_international: boolean;
  created_at: string;
  updated_at: string;
  documents: Record<string, any>;
  vehicules: Vehicule[];
  garanties: Garantie[];
  media: Media[];
}

export default function AssuranceDetails() {
  const router = useRouter();
  const params = useParams();
  const assuranceId = params.id as string;

  const [assurance, setAssurance] = useState<AssuranceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assurance details
  useEffect(() => {
    const fetchAssuranceDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.admin.assurances.get(assuranceId));

        if (response.data.success) {
          setAssurance(response.data.data);
        } else {
          setError('Impossible de récupérer les détails de cette assurance');
          toast.error('Impossible de récupérer les détails');
        }
      } catch (error) {
        console.error('Error fetching assurance details:', error);
        setError('Une erreur est survenue lors du chargement des données');
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchAssuranceDetails();
  }, [assuranceId]);

  // Format date correctly
  const formatFullDate = (dateString: string | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'PPpp', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Get status based on dates
  const getAssuranceStatus = () => {
    if (!assurance) return { label: 'Inconnue', color: 'bg-gray-100 text-gray-800' };

    const now = new Date();
    const endDate = new Date(assurance.date_fin);
    const startDate = new Date(assurance.date_debut);

    if (now > endDate) {
      return { label: 'Expirée', color: 'bg-red-100 text-red-800' };
    } else if (now < startDate) {
      return { label: 'À venir', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      // Check if expiring in 30 days
      const daysLeft = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30) {
        return { label: 'Expire bientôt', color: 'bg-orange-100 text-orange-800' };
      }
      return { label: 'Active', color: 'bg-green-100 text-green-800' };
    }
  };

  // Format type couverture for display
  const formatTypeCouverture = (type: string) => {
    switch (type) {
      case 'responsabilite_civile': return 'Responsabilité civile';
      case 'tiers': return 'Tiers';
      case 'tous_risques': return 'Tous risques';
      default: return type;
    }
  };

  // If loading, show skeleton UI
  if (loading) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  // If error, show error message
  if (error || !assurance) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <Heading
              title="Erreur"
              description={error || 'Impossible de charger les détails'}
            />
            <Button onClick={() => router.push('/admin/flotte/assurances')}>
              Retour à la liste
            </Button>
          </div>
          <Separator />
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-red-500">
                {error || 'Les données n\'ont pas pu être chargées. Veuillez réessayer plus tard.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const status = getAssuranceStatus();

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Heading
                title={`Assurance #${assurance.id} - ${assurance.compagnie}`}
                description="Détails de la police d'assurance"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/flotte/assurances/${assurance.id}/modifier`)}
              size="sm"
              className="px-3"
            >
              <FileEdit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="default"
              onClick={() => router.push('/admin/flotte/assurances')}
              size="sm"
              className="px-3"
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Liste des assurances
            </Button>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main Info Card */}
          <Card className="md:col-span-2 overflow-hidden shadow-sm p-0" >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  Détails de la police
                </h3>
                <Badge className={status.color}>
                  {status.label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Compagnie d&apos;assurance</p>
                  <p className="mt-1 text-base font-semibold">{assurance.compagnie}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Référence de la police</p>
                  <p className="mt-1 text-base font-medium">{assurance.reference}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Date de début</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <p className="text-base">{formatDate(assurance.date_debut)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Date de fin</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <p className="text-base">{formatDate(assurance.date_fin)}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Type d&apos;assurance</p>
                  <p className="text-base font-medium capitalize">{assurance.type_assurance}</p>
                </div>

                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Type de couverture</p>
                  <p className="text-base font-medium">{formatTypeCouverture(assurance.type_couverture)}</p>
                </div>

                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Couverture internationale</p>
                  <div className="flex items-center">
                    {assurance.is_international ? (
                      <>
                        <Globe className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">Oui</span>
                      </>
                    ) : (
                      <span>Non</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Garanties Section */}
              <div className="rounded-md border p-4 mb-6">
                <h4 className="font-medium mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Garanties incluses
                </h4>
                <div className="flex flex-wrap gap-2">
                  {assurance.garanties.map(garantie => (
                    <Badge key={garantie.id} variant="secondary" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {garantie.nom}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Documents Section */}
              {assurance.media && assurance.media.length > 0 && (
                <div className="mt-6">
                  <h4 className="flex items-center font-medium text-gray-700 mb-3">
                    <Receipt className="h-4 w-4 mr-2" />
                    Documents d&apos;assurance
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assurance.media.map((doc) => (
                      <div key={doc.id} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <Badge variant="outline">
                            {doc.custom_properties.type || 'Document'}
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
                            <FileText className="h-16 w-16 text-gray-400" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{(doc.size / 1024).toFixed(1)} Ko</span>
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => window.open(doc.original_url, '_blank')}
                          >
                            Voir le document
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
                <h4 className="flex items-center font-medium text-gray-700 mb-2">
                  Informations complémentaires
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="text-sm">{formatFullDate(assurance.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dernière modification</p>
                    <p className="text-sm">{formatFullDate(assurance.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles Info Card */}
          <Card className="overflow-hidden shadow-sm p-0">
            <CardContent className="p-0">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold">
                  Véhicules assurés ({assurance.vehicules.length})
                </h3>
              </div>

              <div className="divide-y">
                {assurance.vehicules.map((vehicule) => (
                  <div key={vehicule.id} className="p-4">
                    {vehicule.media && vehicule.media.length > 0 ? (
                      <Carousel className="w-full">
                        <CarouselContent>
                          {vehicule.media
                            .filter(m => m.collection_name === 'images')
                            .map((image) => (
                              <CarouselItem key={image.id}>
                                <div className="relative h-48 w-full overflow-hidden rounded-md">
                                  <img
                                    src={image.original_url}
                                    alt={`Véhicule ${vehicule.immatriculation}`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </Carousel>
                    ) : (
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100 rounded-md flex items-center justify-center">
                        <Car className="h-20 w-20 text-gray-300" />
                      </div>
                    )}

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Immatriculation</p>
                        <div className="mt-1 flex items-center">
                          <Car className="h-4 w-4 text-gray-500 mr-1" />
                          <p className="text-base font-semibold">{vehicule.immatriculation}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Type de carburant</p>
                          <p className="mt-1 capitalize text-sm">{vehicule.carburant}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500">Année</p>
                          <p className="mt-1 text-sm">{vehicule.annee_fabrication}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Statut du véhicule</p>
                        <p className="mt-1">
                          <Badge variant={vehicule.statut === 'actif' ? 'default' : 'outline'}>
                            {vehicule.statut.replace('_', ' ')}
                          </Badge>
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        size="sm"
                        onClick={() => router.push(`/admin/flotte/vehicules/${vehicule.id}/details`)}
                      >
                        Détails du véhicule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}