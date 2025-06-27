// src/components/users/DoctorValidatedDetails.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail, Phone, UserCircle, Calendar, BadgeCheck, AlertCircle, Clock,
  MapPin, Award, GraduationCap, Building, CreditCard, FileText,
  ExternalLink, Download, Shield, Briefcase, XCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserRole {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface MediaItem {
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
    type?: string;
    description?: string;
  };
  generated_conversions: any[];
  responsive_images: any[];
  order_column: number;
  created_at: string;
  updated_at: string;
  original_url: string;
  preview_url: string;
}

interface Speciality {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Doctor {
  id: number;
  user_id: number;
  speciality_id: number;
  speciality?: Speciality;
  birth_date: string | null;
  gender: string;
  national_id: string;
  license_number: string;
  qualifications: string;
  years_of_experience: number;
  office_phone: string;
  office_address: string;
  hospital_affiliation: string | null;
  working_hours: string[] | null;
  consultation_fee: string;
  is_verified: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  media: MediaItem[];
}

interface User {
  id: number;
  role_id: number;
  full_name: string;
  telephone: string | null;
  email: string;
  status: 'new' | 'validated' | 'to_validate' | 'rejected' | 'blocked';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: UserRole;
  doctor?: Doctor;
  patient?: any;
}

interface DoctorValidatedDetailsProps {
  user: User;
}

export const DoctorValidatedDetails = ({ user }: DoctorValidatedDetailsProps) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">
            <BadgeCheck className="w-3.5 h-3.5 mr-1" />
            Validé
          </Badge>
        );
      case 'to_validate':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            À valider
          </Badge>
        );
      case 'blocked':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Bloqué
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
            Nouveau
          </Badge>
        );
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

  const getDocumentTypeIcon = (docType: string | undefined) => {
    switch (docType?.toLowerCase()) {
      case 'medical':
      case 'médical':
      case 'document':
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
            {user.doctor?.is_verified === 1 && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white">
                <BadgeCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              {getStatusBadge(user.status)}
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                {user.role.name}
              </Badge>
            </div>
            {user.doctor && (
              <p className="text-gray-600 font-medium">
                Spécialité : {user.doctor.speciality?.name || 'Non spécifiée'} • {user.doctor.years_of_experience} ans d'expérience
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.telephone && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.telephone}</span>
                </div>
              )}
              {user.doctor && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>{user.doctor.consultation_fee} MAD / consultation</span>
                </div>
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

              {user.doctor && (
                <>
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-medium">
                      {getGenderLabel(user.doctor.gender)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(user.doctor.birth_date)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Numéro d'identité nationale</p>
                    <p className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {user.doctor.national_id}
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {user.telephone || 'Non renseigné'}
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

              {user.doctor && (
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Vérification du profil</p>
                  <div className={`mt-1 py-1.5 px-2.5 rounded-md ${user.doctor.is_verified
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'}`}>
                    {user.doctor.is_verified ? (
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Vérifié le {formatDate(user.doctor.verified_at)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">Non vérifié</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.status === 'rejected' && (
                <div className="mt-2 pt-2 border-t">
                  <div className="bg-red-50 border border-red-100 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700">Profil rejeté</p>
                        <p className="text-sm text-red-600 mt-1">
                          Le profil a été rejeté par un administrateur.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        {user.doctor && (
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
                    {user.doctor.speciality?.name || 'Non spécifiée'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Numéro de licence</p>
                  <p className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {user.doctor.license_number}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Années d'expérience</p>
                  <p className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {user.doctor.years_of_experience} ans
                  </p>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <p className="text-sm text-muted-foreground">Qualifications</p>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                    <p className="font-medium">{user.doctor.qualifications}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Téléphone du cabinet</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {user.doctor.office_phone}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <p className="text-sm text-muted-foreground">Adresse du cabinet</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {user.doctor.office_address}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <p className="text-sm text-muted-foreground">Affiliation hospitalière</p>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {user.doctor.hospital_affiliation || 'Non spécifié'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Frais de consultation</p>
                  <div className="bg-blue-50 text-blue-700 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium">
                    <CreditCard className="h-4 w-4" />
                    {user.doctor.consultation_fee} MAD
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {user.doctor?.media && user.doctor.media.length > 0 ? (
          <Card className="md:col-span-3 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.doctor.media.map((doc: MediaItem) => (
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
        ) : (
          user.doctor && (
            <Card className="md:col-span-3 shadow-sm">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="bg-slate-50 rounded-full p-3 mb-4">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-muted-foreground">
                  Aucun document n'a été téléchargé dans ce profil.
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};