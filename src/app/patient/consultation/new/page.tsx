'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addMinutes, parseISO, isWeekend, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Check, Clock, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Search } from 'lucide-react';

// Types
interface Doctor {
  id: number;
  full_name: string;
  speciality: string;
  avatar?: string;
  isOnline?: boolean;
}

interface BusyHour {
  start_time: string;
  end_time: string;
}

interface TimeSlot {
  id: number;
  startTime: Date;
  endTime: Date;
  formattedTime: string;
  available: boolean;
}

// Constantes
const CONSULTATION_DURATION = 20; // minutes
const WORKING_HOURS_START = 9; // 9h
const WORKING_HOURS_END = 18; // 18h

export default function NewConsultation() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('all');
  const [availableSpecialities, setAvailableSpecialities] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [title, setTitle] = useState('');
  const [consultationDescription, setConsultationDescription] = useState('');
  const [busyHours, setBusyHours] = useState<BusyHour[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.patient.completeProfile.getDoctors);

        if (response.data.doctors) {
          setDoctors(response.data.doctors);

          // Extraire les spécialités uniques pour le filtre
          const uniqueSpecialities = Array.from(
            new Set(response.data.doctors.map((doc: Doctor) => doc.speciality))
          );
          setAvailableSpecialities(uniqueSpecialities.filter(Boolean));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des médecins:', error);
        toast.error("Impossible de charger la liste des médecins");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Génération des créneaux horaires en fonction des heures occupées
  const generateTimeSlots = (date: Date, busyHours: BusyHour[]): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const currentDate = new Date();

    // Définir les heures de début et de fin pour la journée sélectionnée
    const startHour = WORKING_HOURS_START; // 9h
    const endHour = WORKING_HOURS_END; // 18h

    // Convertir les heures occupées en objets Date pour faciliter la comparaison
    const busyPeriods = busyHours.map(busy => ({
      start: parseISO(busy.start_time),
      end: parseISO(busy.end_time)
    }));

    // Pour chaque tranche de 20 minutes entre les heures de travail
    let slotId = 0;
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += CONSULTATION_DURATION) {
        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);

        const endTime = addMinutes(startTime, CONSULTATION_DURATION);

        // Vérifier si le créneau est déjà passé pour la journée courante
        const isPastTime = isSameDay(startTime, currentDate) && isBefore(startTime, currentDate);

        // Vérifier si le créneau chevauche une période occupée
        const isOverlapping = busyPeriods.some(
          busy => isOverlapping2(startTime, endTime, busy.start, busy.end)
        );

        // Le créneau est disponible s'il n'est pas passé et ne chevauche pas une période occupée
        const available = !isPastTime && !isOverlapping;

        slots.push({
          id: slotId++,
          startTime,
          endTime,
          formattedTime: format(startTime, 'HH:mm'),
          available
        });
      }
    }

    return slots;
  };

  // Vérifie si deux périodes se chevauchent
  const isOverlapping2 = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return (start1 < end2 && start2 < end1);
  };

  // Vérifie si deux dates sont le même jour
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  useEffect(() => {
    // Récupérer les heures occupées lorsqu'un médecin et une date sont sélectionnés
    const fetchBusyHours = async () => {
      if (!selectedDoctor || !selectedDate) return;

      setLoadingTimeSlots(true);
      try {
        // Format de date YYYY-MM-DD pour l'API
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');

        const response = await apiClient.get(
          apiRoutes.patient.consultations.doctorBusyHours(selectedDoctor.id.toString()),
          { params: { date: formattedDate } }
        );

        if (response.data.success) {
          setBusyHours(response.data.data);
          // Générer les créneaux horaires en fonction des heures occupées
          const slots = generateTimeSlots(selectedDate, response.data.data);
          setTimeSlots(slots);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des heures occupées:", error);
        toast.error("Impossible de charger les disponibilités du médecin");
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    if (selectedDoctor && selectedDate && currentStep === 2) {
      fetchBusyHours();
    }
  }, [selectedDate, selectedDoctor, currentStep]);

  // Filtrer les médecins en fonction des critères de recherche
  const filteredDoctors = doctors.filter(doctor => {
    const nameMatch = doctor.full_name.toLowerCase().includes(nameFilter.toLowerCase());
    const specialityMatch = specialityFilter === 'all' || doctor.speciality === specialityFilter;
    return nameMatch && specialityMatch;
  });

  // Obtenir les initiales à partir du nom complet
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const nextStep = () => {
    const stepValidation = validateCurrentStep();
    if (!stepValidation.valid) {
      toast.error(stepValidation.message);
      return;
    }

    if (currentStep === 3) {
      submitConsultation();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!selectedDoctor) {
          return { valid: false, message: "Veuillez sélectionner un médecin" };
        }
        break;
      case 2:
        if (!selectedTimeSlot) {
          return { valid: false, message: "Veuillez sélectionner un créneau horaire" };
        }
        break;
      case 3:
        if (!title) {
          return { valid: false, message: "Veuillez indiquer le motif de votre consultation" };
        }
        break;
    }
    return { valid: true, message: "" };
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTimeSlot(null); // Réinitialiser le créneau sélectionné
  };

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedTimeSlot(slot);
    }
  };

  const submitConsultation = async () => {
    if (!selectedDoctor || !selectedTimeSlot || !title) {
      toast.error("Informations incomplètes");
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        doctor_id: selectedDoctor.id,
        title,
        description: consultationDescription,
        requested_start_time: selectedTimeSlot.startTime.toISOString(),
        requested_end_time: selectedTimeSlot.endTime.toISOString(),
      };

      const response = await apiClient.post(
        apiRoutes.patient.consultations.addDemandeConsultation,
        payload
      );

      if (response.data.success) {
        toast.success("Demande de consultation envoyée avec succès");
        router.push('/patient/consultations/mes-consultations');
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la demande:", error);

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const errorMessages: Record<string, string> = {};

        Object.entries(serverErrors).forEach(([key, value]) => {
          errorMessages[key] = Array.isArray(value) ? value[0] as string : value as string;
        });

        setFormErrors(errorMessages);
        toast.error("Veuillez corriger les erreurs dans le formulaire");
      } else {
        toast.error("Échec de l'envoi de la demande");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Rendu du stepper
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8 max-w-3xl mx-auto">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          {currentStep > 1 ? <Check className="w-6 h-6" /> : 1}
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          {currentStep > 2 ? <Check className="w-6 h-6" /> : 2}
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          3
        </div>
      </div>
    );
  };

  // Étape 1: Sélection du médecin
  const renderStep1 = () => (
    <div className="space-y-6">
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-[180px] rounded-lg bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={`relative cursor-pointer hover:shadow-lg transition-all duration-200 border ${
                selectedDoctor?.id === doctor.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-100'
              } bg-gray-50 hover:bg-white rounded-xl overflow-hidden`}
              onClick={() => handleSelectDoctor(doctor)}
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
                  {doctor.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
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

                {selectedDoctor?.id === doctor.id && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-500">
                      <Check className="w-4 h-4 mr-1" /> Sélectionné
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.stethoscope className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun médecin trouvé</h3>
          <p className="text-sm text-gray-500 mt-1">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </div>
  );

  // Étape 2: Sélection du créneau horaire
  const renderStep2 = () => (
    <div className="space-y-6">
      {selectedDoctor && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            {selectedDoctor.avatar ? (
              <AvatarImage src={selectedDoctor.avatar} alt={selectedDoctor.full_name} />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                {getInitials(selectedDoctor.full_name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">{selectedDoctor.full_name}</h3>
            <p className="text-sm text-gray-500">{selectedDoctor.speciality}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Sélectionner une date
          </h3>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setSelectedTimeSlot(null); // Réinitialiser le créneau sélectionné
              }
            }}
            locale={fr}
            className="rounded-md border"
            disabled={(date) =>
              // Désactiver les dates passées, les weekends, et les dates au-delà de 30 jours
              isBefore(date, new Date(new Date().setHours(0, 0, 0, 0))) ||
              isWeekend(date) ||
              isAfter(date, new Date(new Date().setDate(new Date().getDate() + 30)))
            }
          />
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Sélectionner un créneau ({CONSULTATION_DURATION} min)
          </h3>

          {loadingTimeSlots ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 animate-pulse rounded"></div>
              ))}
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                  className={slot.available
                    ? "font-medium"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400"
                  }
                  onClick={() => slot.available && handleSelectTimeSlot(slot)}
                  disabled={!slot.available}
                >
                  {slot.formattedTime}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun créneau disponible pour cette date
            </div>
          )}

          {selectedTimeSlot && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
              Vous avez sélectionné le créneau de <span className="font-semibold">{selectedTimeSlot.formattedTime}</span> le <span className="font-semibold">{format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Étape 3: Détails de la consultation
  const renderStep3 = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {selectedDoctor?.avatar ? (
                <AvatarImage src={selectedDoctor.avatar} alt={selectedDoctor.full_name} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600 text-base font-medium">
                  {selectedDoctor ? getInitials(selectedDoctor.full_name) : ""}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold">{selectedDoctor?.full_name}</h3>
              <p className="text-sm text-gray-500">{selectedDoctor?.speciality}</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-sm font-medium">{format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</div>
            <div className="text-sm text-gray-500">{selectedTimeSlot?.formattedTime}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Motif de la consultation*
          </label>
          <Input
            id="title"
            placeholder="Ex: Douleurs abdominales, Consultation de suivi..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={formErrors.title ? "border-red-500" : ""}
          />
          {formErrors.title && (
            <p className="text-xs text-red-500">{formErrors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" /> Description de votre consultation
          </label>
          <Textarea
            id="description"
            placeholder="Décrivez brièvement la raison de votre consultation..."
            className={`min-h-[180px] resize-none ${formErrors.description ? "border-red-500" : ""}`}
            value={consultationDescription}
            onChange={(e) => setConsultationDescription(e.target.value)}
          />
          {formErrors.description && (
            <p className="text-xs text-red-500">{formErrors.description}</p>
          )}
          <p className="text-xs text-gray-500">
            Indiquez vos symptômes, depuis quand vous les avez et toute information pertinente pour le médecin.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
        <h4 className="flex items-center gap-2 font-medium text-yellow-800">
          <Icons.alertTriangle className="h-4 w-4" /> Important
        </h4>
        <p className="text-sm text-yellow-700 mt-1">
          En confirmant cette demande, un créneau sera réservé pour vous. Si vous ne pouvez pas vous présenter, veuillez annuler votre rendez-vous au moins 24h à l'avance.
        </p>
      </div>
    </div>
  );

  // Titre et description selon l'étape
  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Sélectionner un médecin",
          description: "Choisissez le médecin pour votre consultation"
        };
      case 2:
        return {
          title: "Choisir un créneau",
          description: "Sélectionnez une date et un horaire disponible"
        };
      case 3:
        return {
          title: "Détails de la consultation",
          description: "Précisez la raison de votre consultation"
        };
      default:
        return {
          title: "",
          description: ""
        };
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Heading
            title={`Nouvelle consultation - Étape ${currentStep}`}
            description={getStepContent().description}
          />
        </div>
        <Separator />

        {renderStepIndicator()}

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => router.push('/patient/medecin') : prevStep}
            className="flex items-center gap-2"
            disabled={submitting}
          >
            <ChevronLeft className="h-4 w-4" />
            {currentStep === 1 ? "Annuler" : "Retour"}
          </Button>

          <Button
            onClick={nextStep}
            className="flex items-center gap-2"
            disabled={
              submitting ||
              (currentStep === 1 && !selectedDoctor) ||
              (currentStep === 2 && !selectedTimeSlot) ||
              (currentStep === 3 && !title)
            }
          >
            {currentStep === 3 ? (
              submitting ? "Envoi en cours..." : "Confirmer"
            ) : (
              <>
                Continuer
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}