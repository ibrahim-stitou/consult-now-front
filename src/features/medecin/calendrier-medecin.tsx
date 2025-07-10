  import React, { useEffect, useState } from 'react';
  import { format, parseISO, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
  import { AlertCircle, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle } from 'lucide-react';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { EventCard } from '@/features/medecin/event-card';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  import apiClient from '@/lib/api';
  import { apiRoutes } from '@/config/apiRoutes';

  interface Consultation {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    patient_name: string;
  }

  interface ConsultationEvent {
    id: number;
    title: string;
    start: string;
    end: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }

  // Composant Skeleton simple
  const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  export const CalendrierMedecin: React.FC = () => {
    const [consultations, setConsultations] = useState<ConsultationEvent[]>([]);
    const [recentEvents, setRecentEvents] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [viewType, setViewType] = useState<'day' | 'week'>('week');

    const fetchConsultations = async () => {
      setLoading(true);
      try {
        // Appel à l'API pour récupérer les consultations
        const consultationsResponse = await apiClient.get(apiRoutes.medecin.calendrier.myconsultationsList);
        if (consultationsResponse.data.success) {
          setConsultations(consultationsResponse.data.data);
        }

        // Appel à l'API pour récupérer les événements récents
        const recentEventsResponse = await apiClient.get(apiRoutes.medecin.calendrier.recentEvents);
        if (recentEventsResponse.data.success) {
          setRecentEvents(recentEventsResponse.data.data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Une erreur est survenue lors du chargement du calendrier.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchConsultations();
    }, []);

    const getStatsData = () => {
      const total = consultations.length;
      const scheduled = consultations.filter(e => e.status === 'scheduled').length;
      const completed = consultations.filter(e => e.status === 'completed').length;
      const cancelled = consultations.filter(e => e.status === 'cancelled').length;

      return { total, scheduled, completed, cancelled };
    };

    const stats = getStatsData();

    // Créer les créneaux horaires pour l'affichage du calendrier
    const hourSlots = Array.from({ length: 10 }, (_, i) => {
      const hour = i + 8; // Heures de 8h à 18h
      return {
        time: `${hour}:00`,
        hour
      };
    });

    // Générer les jours de la semaine pour l'affichage hebdomadaire
    const generateWeekDays = (date: Date) => {
      const start = startOfWeek(date, { weekStartsOn: 1 }); // Commence la semaine le lundi
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    };

    const weekDays = generateWeekDays(currentDate);

    // Vérifier si une consultation est à une heure et un jour spécifiques
    const getConsultationsForSlot = (day: Date, hour: number) => {
      return consultations.filter(consultation => {
        const startDate = parseISO(consultation.start);
        return isSameDay(startDate, day) && new Date(startDate).getHours() === hour;
      });
    };

    // Navigation dans le calendrier
    const navigateCalendar = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (viewType === 'day') {
        direction === 'prev' ? newDate.setDate(newDate.getDate() - 1) : newDate.setDate(newDate.getDate() + 1);
      } else {
        direction === 'prev' ? newDate.setDate(newDate.getDate() - 7) : newDate.setDate(newDate.getDate() + 7);
      }
      setCurrentDate(newDate);
    };

    const renderDayView = () => {
      return (
        <div className="flex flex-col">
          <div className="text-center p-4 font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            {format(currentDate, 'EEEE dd MMMM yyyy', { locale: fr })}
          </div>
          <div className="grid grid-cols-1 gap-1 bg-white rounded-b-lg">
            {hourSlots.map((slot) => {
              const consultationsForHour = getConsultationsForSlot(currentDate, slot.hour);

              return (
                <div key={slot.time} className="border-b last:border-b-0">
                  <div className="flex">
                    <div className="w-20 p-2 font-medium text-gray-600 border-r flex-shrink-0">
                      {slot.time}
                    </div>
                    <div className={`flex-grow min-h-[100px] p-2 ${isWorkingHour(slot.hour) ? 'bg-blue-50' : 'bg-gray-100'}`}>
                      {consultationsForHour.length > 0 ? (
                        consultationsForHour.map((consultation) => (
                          <ConsultationCard key={consultation.id} consultation={consultation} />
                        ))
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                          Aucun rendez-vous
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const renderWeekView = () => {
      return (
        <div className="flex flex-col">
          <div className="grid grid-cols-8 gap-1">
            {/* En-tête avec les jours */}
            <div className="p-4 text-center font-medium text-gray-600"></div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-4 text-center font-medium ${
                  isToday(day)
                    ? 'bg-blue-600 text-white rounded-t-lg'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div>{format(day, 'EEEE', { locale: fr })}</div>
                <div className="text-sm">{format(day, 'dd/MM', { locale: fr })}</div>
              </div>
            ))}

            {/* Créneaux horaires */}
            {hourSlots.map((slot) => (
              <React.Fragment key={slot.time}>
                <div className="p-2 font-medium text-gray-600 border-t border-r flex items-center justify-center">
                  {slot.time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const consultationsForSlot = getConsultationsForSlot(day, slot.hour);
                  const isWorking = isWorkingHour(slot.hour);

                  return (
                    <div
                      key={`${dayIndex}-${slot.hour}`}
                      className={`border-t min-h-[80px] ${
                        isWorking
                          ? isToday(day)
                            ? 'bg-blue-50'
                            : 'bg-indigo-50'
                          : 'bg-gray-100'
                      } p-1 transition-all hover:bg-opacity-70`}
                    >
                      {consultationsForSlot.length > 0 ? (
                        <div className="h-full">
                          {consultationsForSlot.map((consultation) => (
                            <ConsultationCardMini key={consultation.id} consultation={consultation} />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    };

    // Vérifier si une heure est pendant les heures de travail
    const isWorkingHour = (hour: number) => {
      // Heures de travail 9h-12h et 14h-18h
      return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
    };

    // Composant pour afficher une consultation dans la vue quotidienne
    const ConsultationCard = ({ consultation }: { consultation: ConsultationEvent }) => {
      const startTime = parseISO(consultation.start);
      const endTime = parseISO(consultation.end);
      const formattedStartTime = format(startTime, 'HH:mm');
      const formattedEndTime = format(endTime, 'HH:mm');

      const getStatusStyle = (status: string) => {
        switch (status) {
          case 'scheduled':
            return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
          case 'completed':
            return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
          case 'cancelled':
            return 'bg-gradient-to-r from-red-400 to-red-500 text-white opacity-70';
          default:
            return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
      };

      return (
        <div
          className={`rounded-md p-3 mb-2 shadow-md transition-all hover:shadow-lg ${getStatusStyle(consultation.status)}`}
        >
          <div className="font-semibold">{consultation.title || 'Consultation'}</div>
          <div className="text-sm flex items-center mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {formattedStartTime} - {formattedEndTime}
          </div>
        </div>
      );
    };

    // Composant pour afficher une consultation en format mini dans la vue hebdomadaire
    const ConsultationCardMini = ({ consultation }: { consultation: ConsultationEvent }) => {
      const getStatusStyle = (status: string) => {
        switch (status) {
          case 'scheduled':
            return 'bg-blue-500 border-blue-600';
          case 'completed':
            return 'bg-green-500 border-green-600';
          case 'cancelled':
            return 'bg-red-400 border-red-500 opacity-70';
          default:
            return 'bg-gray-500 border-gray-600';
        }
      };

      const startTime = parseISO(consultation.start);
      const formattedTime = format(startTime, 'HH:mm');

      return (
        <div
          className={`text-white text-xs p-1 mb-1 rounded border-l-4 ${getStatusStyle(consultation.status)}`}
        >
          <div className="font-medium truncate">{formattedTime}</div>
          <div className="truncate">{consultation.title || 'Consultation'}</div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header avec statistiques */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              Calendrier Médical
            </h1>
            <p className="text-gray-600">Gérez vos consultations et rendez-vous</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm opacity-90">Total consultations</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.scheduled}</div>
                <div className="text-sm opacity-90">Programmées</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm opacity-90">Terminées</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.cancelled}</div>
                <div className="text-sm opacity-90">Annulées</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Événements récents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="pt-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[700px] w-full rounded-xl" />
                </div>
              ) : error ? (
                <Alert className="max-w-md mx-auto border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <Card className="shadow-2xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl text-gray-800">Planning des consultations</CardTitle>
                      <div className="flex items-center gap-3">
                        <Select
                          value={viewType}
                          onValueChange={(value) => setViewType(value as 'day' | 'week')}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Vue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Jour</SelectItem>
                            <SelectItem value="week">Semaine</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateCalendar('prev')}
                          >
                            Précédent
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                          >
                            Aujourd'hui
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateCalendar('next')}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="custom-calendar">
                      {viewType === 'day' ? renderDayView() : renderWeekView()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recent" className="pt-6">
              <Card className="shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Événements récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : error ? (
                    <Alert className="max-w-md mx-auto border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : recentEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Aucun événement récent à afficher</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentEvents.map((event) => (
                        <EventCard key={event.id} {...event} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };