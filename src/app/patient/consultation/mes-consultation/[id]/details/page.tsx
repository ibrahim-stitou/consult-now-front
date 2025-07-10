'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft, Calendar, User, Clock, CheckCircle, XCircle, MessageSquare,
  Phone, Mail, FileText, AlertTriangle, Link as LinkIcon, Calendar as CalendarIcon,
  Info, Shield, LayoutDashboard, Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface DetailsData {
  id: number;
  title: string;
  description?: string;
  status: string;
  start_time?: string;
  end_time?: string;
  requested_start_time?: string;
  requested_end_time?: string;
  patient?: {
    id: number;
    full_name: string;
    email: string;
    telephone: string;
  };
  doctor?: {
    id: number;
    full_name: string;
    email: string;
    telephone: string;
    speciality?: string;
  };
  meet_url?: string;
  reject_reason?: string;
  created_at: string;
  updated_at: string;
  rejects?: Array<{
    id: number;
    reason: string;
    created_at: string;
  }>;
  [key: string]: any;
}

export default function DetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id;
  const type = searchParams.get('type');

  const [loading, setLoading] = useState(true);
  const [detailsData, setDetailsData] = useState<DetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!type || !id) {
      setError('Paramètres manquants');
      setLoading(false);
      return;
    }

    const fetchDetailsData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          apiRoutes.patient.consultations.getDetailsByTypeAndId(type, id as string)
        );

        if (response.data.success) {
          setDetailsData(response.data.data.details);
        } else {
          setError('Impossible de charger les détails');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
        setError(errorMessage);
        toast.error(`Erreur: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsData();
  }, [type, id]);

  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string, itemType: string | null) => {
    if (itemType === 'consultation') {
      switch (status) {
        case 'scheduled':
          return <Badge
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200 font-medium px-3 py-1">Planifiée</Badge>;
        case 'completed':
          return <Badge
            className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200 font-medium px-3 py-1">Terminée</Badge>;
        case 'cancelled':
          return <Badge
            className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 font-medium px-3 py-1">Annulée</Badge>;
        default:
          return <Badge
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 font-medium px-3 py-1">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'pending':
          return <Badge
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200 font-medium px-3 py-1">En
            attente</Badge>;
        case 'approved':
          return <Badge
            className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200 font-medium px-3 py-1">Approuvée</Badge>;
        case 'rejected':
          return <Badge
            className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 font-medium px-3 py-1">Rejetée</Badge>;
        default:
          return <Badge
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 font-medium px-3 py-1">{status}</Badge>;
      }
    }
  };

  const renderPageTitle = () => {
    if (!type) return "Détails du rendez-vous";
    return type === 'consultation' ? "Détails de la consultation" : "Détails de la demande";
  };

  const getStartTime = () => {
    if (type === 'consultation') {
      return detailsData?.start_time;
    } else {
      return detailsData?.requested_start_time;
    }
  };

  const getEndTime = () => {
    if (type === 'consultation') {
      return detailsData?.end_time;
    } else {
      return detailsData?.requested_end_time;
    }
  };

  // Composant de squelette pour le chargement
  const DetailsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse w-full">
      <Card className="col-span-1 lg:col-span-2 shadow-lg">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-3/12 mb-2" />
          <Skeleton className="h-5 w-6/12" />
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-4/12" />
                <Skeleton className="h-7 w-9/12" />
              </div>
            </div>
            <Skeleton className="h-px w-full bg-gray-200" />
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-4/12" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
            </div>
            <Skeleton className="h-px w-full bg-gray-200" />
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/12" />
                <Skeleton className="h-7 w-8/12" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 shadow-lg">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-8/12 mb-2" />
          <Skeleton className="h-4 w-6/12" />
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/12" />
              <Skeleton className="h-6 w-8/12" />
            </div>
          </div>
          <Skeleton className="h-px w-full bg-gray-200" />
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/12" />
              <Skeleton className="h-6 w-10/12" />
            </div>
          </div>
          <Skeleton className="h-px w-full bg-gray-200" />
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-4/12" />
              <Skeleton className="h-6 w-6/12" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderErrorState = () => (
    <Card className="mx-auto w-full max-w-2xl shadow-lg border border-red-100">
      <CardHeader className="bg-red-50 border-b border-red-100">
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Erreur
        </CardTitle>
        <CardDescription className="text-red-700 font-medium">
          Nous avons rencontré un problème lors du chargement des données
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-12">
        <p className="text-lg text-red-500 mb-8 font-medium">{error}</p>
        <Button
          onClick={() => router.back()}
          className="px-8 py-6 h-auto text-base"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retourner à la liste des consultations
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6 pb-12 w-full max-w-7xl mx-auto">
        <div
          className="flex flex-col md:flex-row items-start justify-between gap-4 bg-gradient-to-r from-white to-slate-50 p-6 rounded-xl shadow border border-slate-100">
          <Heading
            title={renderPageTitle()}
            description={detailsData?.title || ""}
          />
          <Button
            variant="outline"
            onClick={() => router.push('/patient/consultation/mes-consultation')}
            className="flex items-center gap-2 hover:bg-slate-100 transition-colors border-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        </div>
        <Separator className="my-2" />

        {loading ? (
          <DetailsSkeleton />
        ) : error ? (
          renderErrorState()
        ) : detailsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations principales */}
            <Card className={cn(
              "col-span-1 lg:col-span-2 overflow-hidden shadow-lg transition-all hover:shadow-xl",
              "border-0 ring-1 ring-slate-200",
              type === 'consultation'
                ? "bg-gradient-to-br from-white to-blue-50"
                : "bg-gradient-to-br from-white to-emerald-50"
            )}>
              <CardHeader className={cn(
                "border-b pb-6",
                type === 'consultation' ? "bg-blue-50/60" : "bg-emerald-50/60"
              )}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    {type === 'consultation' ?
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                      </div> :
                      <div className="p-1.5 bg-emerald-100 rounded-full">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                    }
                    <span className={type === 'consultation' ? "text-blue-800" : "text-emerald-800"}>
                      {type === 'consultation' ? 'Consultation' : 'Demande de consultation'}
                    </span>
                  </CardTitle>
                  <div>
                    {getStatusBadge(detailsData.status, type)}
                  </div>
                </div>
                <CardDescription className="mt-3 text-base font-medium">
                  {detailsData.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8 px-8">
                <div className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-full shrink-0",
                      type === 'consultation' ? "bg-blue-50" : "bg-emerald-50"
                    )}>
                      <Clock className={cn(
                        "h-6 w-6",
                        type === 'consultation' ? "text-blue-600" : "text-emerald-600"
                      )} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Horaire prévu</p>
                      <p className="text-base font-semibold">
                        {getStartTime() ? formatDateTime(getStartTime()!) : 'Non défini'}
                        {getEndTime() && ` - ${formatDateTime(getEndTime()!)}`}
                      </p>
                    </div>
                  </div>
                </div>

                {detailsData.description && (
                  <div className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-full shrink-0",
                        type === 'consultation' ? "bg-blue-50" : "bg-emerald-50"
                      )}>
                        <MessageSquare className={cn(
                          "h-6 w-6",
                          type === 'consultation' ? "text-blue-600" : "text-emerald-600"
                        )} />
                      </div>
                      <div className="space-y-2 w-full">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Description</p>
                        <div className="text-base bg-slate-50 p-4 rounded-lg border shadow-inner">
                          {detailsData.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailsData.meet_url && (
                  <div
                    className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full shrink-0">
                        <LinkIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-blue-700 font-medium uppercase tracking-wide">Lien de
                          consultation</p>
                        <p className="text-base">
                          <a
                            href={detailsData.meet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold"
                          >
                            Rejoindre la consultation en ligne
                            <LinkIcon className="h-3 w-3 ml-1" />
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {detailsData.rejects && detailsData.rejects.length > 0 && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 p-3 rounded-full shrink-0">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="space-y-2 w-full">
                        <p className="text-sm text-red-700 font-medium uppercase tracking-wide">Raison du rejet</p>
                        <div className="text-base space-y-3">
                          {detailsData.rejects.map((reject, index) => (
                            <div key={reject.id} className="bg-white rounded-lg p-3 border border-red-100 shadow-sm">
                              <p className="text-gray-800">{reject.reason}</p>
                              <p className="text-xs text-gray-500 mt-2 italic">
                                Le {formatDateTime(reject.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-full shrink-0",
                      "bg-slate-100"
                    )}>
                      <Calendar className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Date de création</p>
                      <p className="text-base font-semibold">{formatDateTime(detailsData.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations du médecin */}
            {detailsData.doctor && (
              <Card
                className="col-span-1 shadow-lg overflow-hidden hover:shadow-xl transition-all bg-gradient-to-br from-white to-indigo-50 border-0 ring-1 ring-indigo-200">
                <CardHeader className="bg-indigo-50/70 border-b pb-6">
                  <CardTitle className="flex items-center gap-2 font-bold">
                    <div className="p-1.5 bg-indigo-100 rounded-full">
                      <Stethoscope className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-indigo-800">Informations du médecin</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8 px-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 p-3 rounded-full shrink-0">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Nom complet</p>
                      <p className="text-base font-semibold">{detailsData.doctor.full_name}</p>
                    </div>
                  </div>

                  {detailsData.doctor.speciality && (
                    <>
                      <div className="h-px w-full bg-indigo-100" />
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-50 p-3 rounded-full shrink-0">
                          <Stethoscope className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Spécialité</p>
                          <p className="text-base font-semibold">{detailsData.doctor.speciality}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="h-px w-full bg-indigo-100" />

                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 p-3 rounded-full shrink-0">
                      <Mail className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Email</p>
                      <a
                        href={`mailto:${detailsData.doctor.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {detailsData.doctor.email}
                      </a>
                    </div>
                  </div>

                  <div className="h-px w-full bg-indigo-100" />

                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 p-3 rounded-full shrink-0">
                      <Phone className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Téléphone</p>
                      <a
                        href={`tel:${detailsData.doctor.telephone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {detailsData.doctor.telephone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bouton de démarrage pour consultation planifiée */}
            {type === 'consultation' && detailsData.status === 'scheduled' && detailsData.meet_url && (
              <Card
                className="col-span-1 lg:col-span-3 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-50 to-white border-0 ring-1 ring-blue-200">
                <CardHeader className="border-b border-blue-100 pb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-full">
                      <LayoutDashboard className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="font-bold text-blue-800">
                      Actions disponibles
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm mt-2 ml-9 text-slate-600">
                    Votre consultation est planifiée et prête à démarrer
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4 pt-8 px-8">
                  <Button
                    variant="default"
                    size="lg"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-6 h-auto text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                    onClick={() => window.open(detailsData.meet_url, '_blank')}
                  >
                    <Calendar className="h-5 w-5" /> Rejoindre la consultation en ligne
                  </Button>
                </CardContent>
                <CardFooter className="text-sm text-slate-500 italic border-t border-blue-100 mt-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>En cliquant sur ce bouton, vous serez redirigé vers la plateforme de visioconférence</span>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        ) : (
          <Card
            className="mx-auto max-w-md shadow-lg border-0 ring-1 ring-slate-200 bg-gradient-to-r from-white to-slate-50">
            <CardHeader className="border-b pb-6">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                Aucune donnée
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-lg mb-8 text-gray-500">Aucune information disponible pour cette consultation</p>
              <Button
                onClick={() => router.push('/patient/consultation/mes-consultation')}
                size="lg"
                className="px-8 py-6 h-auto text-base rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Retourner à la liste des consultations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}