'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
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

interface Doctor {
  id: number;
  full_name: string;
  speciality: string;
  avatar?: string;
  isOnline?: boolean;
}

// Liste des spécialités médicales
const SPECIALITIES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Endocrinologie',
  'Gastro-entérologie',
  'Gynécologie',
  'Hématologie',
  'Neurologie',
  'Oncologie',
  'Ophtalmologie',
  'ORL',
  'Pédiatrie',
  'Pneumologie',
  'Psychiatrie',
  'Radiologie',
  'Rhumatologie',
  'Urologie',
  'Chirurgie générale',
  'Chirurgie orthopédique',
  'Anesthésiologie'
];

const ITEMS_PER_PAGE = 9; // 3x3 grid

export default function MedecinList() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('all');
  const [availableSpecialities, setAvailableSpecialities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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
          //@ts-ignore
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

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [nameFilter, specialityFilter]);

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

  // Fonction pour obtenir les initiales à partir du nom complet
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

  // Traduire les spécialités en anglais pour correspondre au design
  const getSpecialityBadge = (speciality: string) => {
    const translations: { [key: string]: string } = {
      'Cardiologie': 'Cardiologist',
      'Chirurgie orthopédique': 'Orthopedic Surgeon',
      'Pédiatrie': 'Pediatrician',
      'Dermatologie': 'Dermatologist',
      'Gynécologie': 'Gynecologist',
      'Neurologie': 'Neurologist',
      'Endocrinologie': 'Endocrinologist',
      'Radiologie': 'Radiologist',
      'Psychiatrie': 'Psychiatrist',
      'Gastro-entérologie': 'Gastroenterologist',
      'Ophtalmologie': 'Ophthalmologist',
      'Pneumologie': 'Pulmonologist'
    };
    return translations[speciality] || speciality;
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Heading
            title="Medecines"
            description=""
          />
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push('/patient/consultation/new')}
          >
            Fais une consultation
          </Button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name..."
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="h-[200px] rounded-lg bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : currentDoctors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="relative cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gray-50 hover:bg-white rounded-2xl overflow-hidden"
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
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
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
                          {getSpecialityBadge(doctor.speciality)}
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
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredDoctors.length)} of {filteredDoctors.length}
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icons.user2 className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun médecin trouvé</h3>
            <p className="text-sm text-gray-500 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}