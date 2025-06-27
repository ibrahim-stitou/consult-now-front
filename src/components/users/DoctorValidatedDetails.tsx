// src/components/users/DoctorValidatedDetails.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail, Phone, UserCircle, Calendar, BadgeCheck, AlertCircle,
  MapPin, Award, GraduationCap, Building, CreditCard, FileText,
  ExternalLink, Download, Shield, Briefcase, User2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

interface DoctorValidatedDetailsProps {
  user: any;
}

export const DoctorValidatedDetails = ({ user }: DoctorValidatedDetailsProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const doctor = user.doctorProfile;

  const getUserStatus = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
            Nouveau
          </Badge>
        );
      case 'validated':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">
            <BadgeCheck className="w-3.5 h-3.5 mr-1" />
            Validé
          </Badge>
        );
      case 'blocked':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Bloqué
          </Badge>
        );
      case 'to_validate':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
            À valider
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleChangeStatus = async (newStatus: 'validated' | 'blocked') => {
    try {
      setIsUpdatingStatus(true);
      const response = await apiClient.put(apiRoutes.admin.users.update(user.id.toString()), {
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Statut modifié avec succès: ${newStatus}`);
        window.location.reload();
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du statut');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getDocumentTypeIcon = (docType: string | undefined) => {
    switch (docType?.toLowerCase()) {
      case 'medical':
      case 'médical':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'diploma':
      case 'diplôme':
        return <GraduationCap className="h-5 w-5 text-amber-600" />;
      case 'certification':
        return <Award className="h-5 w-5 text-green-600" />;
      case 'license':
      case 'licence':
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Homme';
      case 'female':
        return 'Femme';
      default:
        return gender;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec avatar et informations essentielles */}
      <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src="" alt={user.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xl">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            {doctor?.is_verified === 1 && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white">
                <BadgeCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              {getUserStatus(user.status)}
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                {user.role.name}
              </Badge>
            </div>
            {doctor && doctor.speciality && (
              <p className="text-gray-600 font-medium">
                Spécialité : {doctor.speciality.name} • {doctor.years_of_experience} ans d'expérience
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{user.telephone}</span>
              </div>
              {doctor && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>{doctor.consultation_fee} MAD / consultation</span>
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto">
            <div className="flex flex-col gap-2">
              {user.status !== 'blocked' && (
                <Button
                  variant="outline"
                  className="border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                  disabled={isUpdatingStatus}
                  onClick={() => handleChangeStatus('blocked')}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Bloquer le compte
                </Button>
              )}
              {user.status === 'blocked' && (
                <Button
                  variant="outline"
                  className="border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
                  disabled={isUpdatingStatus}
                  onClick={() => handleChangeStatus('validated')}
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Réactiver le compte
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <Card className="md:col-span-2 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-medium">Informations personnelles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{user.full_name}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </p>
              </div>

              {doctor && (
                <>
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-medium">
                      {getGenderLabel(doctor.gender)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(doctor.birth_date)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Numéro d'identité nationale</p>
                    <p className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {doctor.national_id}
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {user.telephone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statut et compte */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-medium">Compte</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Rôle</p>
                <p className="font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  {user.role.name}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Date d'inscription</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(user.created_at)}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(user.updated_at)}
                </p>
              </div>

              {doctor && (
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Vérification du profil</p>
                  <div className={`mt-1 py-1.5 px-2.5 rounded-md ${doctor.is_verified
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'}`}>
                    {doctor.is_verified ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Vérifié le {formatDate(doctor.verified_at)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">En attente de vérification</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        {doctor && (
          <Card className="md:col-span-3 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Informations professionnelles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Spécialité</p>
                  <p className="font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    {doctor.speciality?.name || 'Non spécifiée'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Numéro de licence</p>
                  <p className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {doctor.license_number}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Années d'expérience</p>
                  <p className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {doctor.years_of_experience} ans
                  </p>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <p className="text-sm text-muted-foreground">Qualifications</p>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                    <p className="font-medium">{doctor.qualifications}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Téléphone du cabinet</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {doctor.office_phone}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <p className="text-sm text-muted-foreground">Adresse du cabinet</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {doctor.office_address}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <p className="text-sm text-muted-foreground">Affiliation hospitalière</p>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {doctor.hospital_affiliation || 'Non spécifié'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Frais de consultation</p>
                  <div className="bg-blue-50 text-blue-700 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium">
                    <CreditCard className="h-4 w-4" />
                    {doctor.consultation_fee} MAD
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {doctor && doctor.media && doctor.media.length > 0 && (
          <Card className="md:col-span-3 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctor.media.map((doc: any) => (
                  <div key={doc.id} className="flex flex-col border rounded-md overflow-hidden bg-white hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center p-4 gap-3 flex-1">
                      <div className="p-2.5 rounded-md bg-blue-50">
                        {getDocumentTypeIcon(doc.custom_properties?.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{doc.custom_properties?.description || "Document médical"}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 border-t border-slate-100 flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(doc.original_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualiser</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={doc.original_url}
                              download={doc.name}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Télécharger</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};