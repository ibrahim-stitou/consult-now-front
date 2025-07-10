'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Building,
  Clock,
  CreditCard,
  FileText,
  MapPin
} from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Media {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  url: string;
}

interface Doctor {
  id: number;
  full_name: string;
  email: string;
  telephone: string;
  speciality: string;
  birth_date: string;
  gender: string;
  qualifications: string;
  years_of_experience: number;
  office_phone: string;
  office_address: string;
  hospital_affiliation: string;
  working_hours: string | null;
  consultation_fee: string;
  avatar: string | null;
  media: Media[];
}

export default function MedecinDetails() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.patient.doctors.get(doctorId));

        if (response.data.success) {
          setDoctorData(response.data.data);
        } else {
          toast.error(response.data.message || "Une erreur est survenue");
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails du médecin:', error);
        toast.error('Impossible de charger les informations du médecin');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[350px]" />
            </div>
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] md:col-span-2" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[300px] md:col-span-3" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!doctorData) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <Heading
              title="Médecin non trouvé"
              description="Le médecin demandé n'existe pas ou a été supprimé"
            />
            <Button
              variant="outline"
              onClick={() => router.push('/patient/medecin')}
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </div>
          <Separator />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Heading
            title={doctorData.full_name}
            description={`Spécialiste en ${doctorData.speciality}`}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/patient/medecin')}
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <Card className="col-span-1 lg:col-span-2 shadow-lg overflow-hidden border-0 ring-1 ring-slate-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-blue-50/70 border-b pb-6">
              <CardTitle className="flex items-center gap-2 font-bold text-blue-800">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <span>Informations personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 px-8">
              <div className="flex flex-col md:flex-row gap-6">
                {doctorData.avatar && (
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <div className="relative h-32 w-32 overflow-hidden rounded-xl border-4 border-white shadow-lg">
                      <Image
                        src={doctorData.avatar}
                        alt={doctorData.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full shrink-0 bg-blue-50">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Nom complet</p>
                      <p className="text-base font-semibold">{doctorData.full_name}</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100" />

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full shrink-0 bg-blue-50">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Email</p>
                      <a
                        href={`mailto:${doctorData.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {doctorData.email}
                      </a>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100" />

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full shrink-0 bg-blue-50">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Téléphone</p>
                      <a
                        href={`tel:${doctorData.telephone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {doctorData.telephone}
                      </a>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100" />

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full shrink-0 bg-blue-50">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Date de naissance</p>
                      <p className="text-base font-semibold">{formatDate(doctorData.birth_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card className="col-span-1 shadow-lg overflow-hidden border-0 ring-1 ring-indigo-200 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="bg-indigo-50/70 border-b pb-6">
              <CardTitle className="flex items-center gap-2 font-bold text-indigo-800">
                <div className="p-1.5 bg-indigo-100 rounded-full">
                  <Stethoscope className="h-5 w-5 text-indigo-600" />
                </div>
                <span>Informations professionnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 px-8">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-3 rounded-full shrink-0">
                  <Stethoscope className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Spécialité</p>
                  <p className="text-base font-semibold">{doctorData.speciality}</p>
                </div>
              </div>

              <div className="h-px w-full bg-indigo-100" />

              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-3 rounded-full shrink-0">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Qualifications</p>
                  <p className="text-base font-semibold">{doctorData.qualifications}</p>
                </div>
              </div>

              <div className="h-px w-full bg-indigo-100" />

              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-3 rounded-full shrink-0">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Années d'expérience</p>
                  <p className="text-base font-semibold">{doctorData.years_of_experience} ans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de cabinet */}
          <Card className="col-span-1 lg:col-span-2 shadow-lg overflow-hidden border-0 ring-1 ring-emerald-200 bg-gradient-to-br from-white to-emerald-50">
            <CardHeader className="bg-emerald-50/70 border-b pb-6">
              <CardTitle className="flex items-center gap-2 font-bold text-emerald-800">
                <div className="p-1.5 bg-emerald-100 rounded-full">
                  <Building className="h-5 w-5 text-emerald-600" />
                </div>
                <span>Informations de cabinet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 px-8">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-full shrink-0">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Adresse du cabinet</p>
                  <p className="text-base font-semibold">{doctorData.office_address}</p>
                </div>
              </div>

              <div className="h-px w-full bg-emerald-100" />

              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-full shrink-0">
                  <Phone className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Téléphone du cabinet</p>
                  <a
                    href={`tel:${doctorData.office_phone}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  >
                    {doctorData.office_phone}
                  </a>
                </div>
              </div>

              <div className="h-px w-full bg-emerald-100" />

              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-full shrink-0">
                  <Building className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Affiliation hospitalière</p>
                  <p className="text-base font-semibold">{doctorData.hospital_affiliation}</p>
                </div>
              </div>

              {doctorData.working_hours && (
                <>
                  <div className="h-px w-full bg-emerald-100" />
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-50 p-3 rounded-full shrink-0">
                      <Clock className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Horaires de travail</p>
                      <p className="text-base font-semibold">{doctorData.working_hours}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="h-px w-full bg-emerald-100" />

              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-full shrink-0">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Tarif de consultation</p>
                  <p className="text-base font-semibold">{doctorData.consultation_fee} MAD</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents du médecin */}
          {doctorData.media && doctorData.media.length > 0 && (
            <Card className="col-span-1 shadow-lg overflow-hidden border-0 ring-1 ring-amber-200 bg-gradient-to-br from-white to-amber-50">
              <CardHeader className="bg-amber-50/70 border-b pb-6">
                <CardTitle className="flex items-center gap-2 font-bold text-amber-800">
                  <div className="p-1.5 bg-amber-100 rounded-full">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <span>Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-8 px-8">
                {doctorData.media.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 py-1 px-3 rounded-full transition-colors"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}