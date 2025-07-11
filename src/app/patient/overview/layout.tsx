'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search, ChevronLeft, ChevronRight, Calendar, Clock, User,
  ArrowRight, FileText, CheckCircle, AlertCircle, CalendarClock, Plus
} from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface RecentEvent {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  doctor_name: string;
  type: string;
  created_at: string;
}

interface Doctor {
  id: number;
  full_name: string;
  speciality: string;
  avatar?: string;
  isOnline?: boolean;
}

const ITEMS_PER_PAGE = 6; // 3x2 grid pour les médecins

export default function PtientDashboard() {
  const router = useRouter();

  // État pour les événements récents
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // État pour la liste des médecins
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('all');
  const [availableSpecialities, setAvailableSpecialities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Chargement des événements récents
  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setLoadingEvents(true);
        const response = await apiClient.get(apiRoutes.patient.recentFourEvents);

        if (response.data.success) {
          setRecentEvents(response.data.data);
        } else {
          console.error('Erreur lors du chargement des événements récents:', response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements récents:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchRecentEvents();
  }, []);

  // Chargement des médecins
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await apiClient.get(apiRoutes.patient.completeProfile.getDoctors);

        if (response.data.doctors) {
          setDoctors(response.data.doctors);

          // Extraire les spécialités uniques pour le filtre
          const uniqueSpecialities = Array.from(
            new Set(response.data.doctors.map((doc: Doctor) => doc.speciality))
          );
          setAvailableSpecialities(uniqueSpecialities.filter(Boolean) as string[]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des médecins:', error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [nameFilter, specialityFilter]);

  // Formatage des dates
  const formatDateTime = (dateTimeString: string) => {
    try {
      return format(new Date(dateTimeString), 'dd MMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir les initiales à partir du nom complet
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Filtrer les médecins en fonction des critères de recherche
  const filteredDoctors = doctors.filter(doctor => {
    const nameMatch = doctor.full_name.toLowerCase().includes(nameFilter.toLowerCase());
    const specialityMatch = specialityFilter === 'all' || doctor.speciality === specialityFilter;
    return nameMatch && specialityMatch;
  });

  // Calculs pour la pagination
  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

  // Fonctions de navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Obtenir la couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'canceled':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'pending':
        return <CalendarClock className="h-4 w-4 mr-1" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'canceled':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return <Calendar className="h-4 w-4 mr-1" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planifiée';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejetée';
      case 'canceled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-8 pb-12">
        {/* Section 1: Événements récents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading title="Événements récents" description="Vos dernières consultations et demandes" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/patient/consultation/mes-consultation')}
              className="flex items-center gap-1"
            >
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {loadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentEvents.map(event => (
                <Card
                  key={event.id}
                  className="hover:shadow-md transition-all cursor-pointer border-0 shadow-sm ring-1 ring-slate-200"
                  onClick={() => router.push(`/patient/consultation/mes-consultation/${event.id}/details?type=${event.type.toLowerCase()}`)}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${event.type === 'Consultation' ? 'bg-blue-100' : 'bg-amber-100'} mr-3`}>
                          {event.type === 'Consultation' ? (
                            <FileText className={`h-5 w-5 ${event.type === 'Consultation' ? 'text-blue-600' : 'text-amber-600'}`} />
                          ) : (
                            <Calendar className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{event.title}</p>
                          <p className="text-xs text-gray-500">
                            {event.type} · Dr. {event.doctor_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDateTime(event.start_time)}
                      </div>

                      <Badge
                        variant="outline"
                        className={cn("flex w-fit items-center text-xs font-normal px-2 py-0.5 rounded-md", getStatusColor(event.status))}
                      >
                        {getStatusIcon(event.status)}
                        {getStatusLabel(event.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm border-0 ring-1 ring-slate-200">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Calendar className="h-10 w-10 text-gray-300 mb-3" />
                <h3 className="font-medium text-gray-900">Aucun événement récent</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Vous n'avez pas encore de consultations ou de demandes</p>
                <Button onClick={() => router.push('patient/consultation/new')}>
                  Demander une consultation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Section 2: Liste des médecins */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Heading
              title="Nos médecins"
              description="Trouvez un spécialiste pour votre prochaine consultation"
            />
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push('/patient/consultation/new')}
            >
              <Plus className="h-4 w-4 mr-2" /> Demander une consultation
            </Button>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom..."
                className="pl-9"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>

            <Select
              value={specialityFilter}
              onValueChange={setSpecialityFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les spécialités</SelectItem>
                {availableSpecialities.map(speciality => (
                  <SelectItem key={speciality} value={speciality}>
                    {speciality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Liste des médecins */}
          {loadingDoctors ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-[180px] rounded-xl bg-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : currentDoctors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="relative cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gray-50 hover:bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200"
                    onClick={() => router.push(`/patient/medecin/${doctor.id}/details`)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      {/* Avatar avec indicateur en ligne */}
                      <div className="relative inline-block">
                        <Avatar className="h-16 w-16 mx-auto border-4 border-white shadow-sm">
                          {doctor.avatar ? (
                            <AvatarImage src={doctor.avatar} alt={doctor.full_name} />
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                              {getInitials(doctor.full_name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {/* Indicateur en ligne */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${doctor.isOnline ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white rounded-full`}></div>
                      </div>

                      {/* Nom du médecin */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {doctor.full_name}
                        </h3>
                      </div>

                      {/* Badge de spécialité */}
                      {doctor.speciality && (
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal px-3 py-1 bg-white border-gray-200 text-gray-600 rounded-full"
                          >
                            {doctor.speciality}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-500">
                    Affichage {startIndex + 1}-{Math.min(endIndex, filteredDoctors.length)} sur {filteredDoctors.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm text-gray-700 px-3">
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="shadow-sm border-0 ring-1 ring-slate-200">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <User className="h-10 w-10 text-gray-300 mb-3" />
                <h3 className="font-medium text-gray-900">Aucun médecin trouvé</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Essayez de modifier vos critères de recherche
                </p>
              </CardContent>
            </Card>
          )}

          {doctors.length > 0 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => router.push('/patient/medecin')}
              >
                Voir tous les médecins
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}