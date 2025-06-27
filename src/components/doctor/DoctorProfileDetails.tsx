'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  UserCircle, Mail, Phone, MapPin, Calendar, Award,
  Building, FileText, CreditCard, AlertCircle,
  CheckCircle, Clock8, FileIcon, ExternalLink,
  Download, Shield, Briefcase, GraduationCap, User2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface UserRole {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  role_id: number;
  full_name: string;
  telephone: string;
  email: string;
  status: 'new' | 'validated' | 'to_validate' | 'blocked';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: UserRole;
}

interface Doctor {
  id: number;
  user_id: number;
  speciality: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  birth_date: string;
  gender: string;
  national_id: string;
  license_number: string;
  qualifications: string;
  years_of_experience: number;
  office_phone: string;
  office_address: string;
  hospital_affiliation: string;
  working_hours: string[] | null;
  consultation_fee: string;
  is_verified: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: User;
}

interface Document {
  id: number;
  user_id: number;
  path: string;
  name: string;
  description: string;
  type?: string;
  created_at: string;
  updated_at: string;
}
interface Media{
  user_id: number;
  id:number;
}
interface DoctorProfileProps {
  user: User;
  doctor: Doctor;
  media:Media[];
  documents?: Document[];
  onEditClick?: () => void;
}

export const DoctorProfileDetails = ({ user, doctor, documents = [], onEditClick }: DoctorProfileProps) => {
  const router = useRouter();

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
          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Validé
          </Badge>
        );
      case 'to_validate':
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
            <Clock8 className="w-3.5 h-3.5 mr-1" />
            En attente de validation
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Bloqué
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200">
            {status}
          </Badge>
        );
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
        return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  // Calculer l'état de complétion du profil
  const calculateProfileCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Vérifier les champs de l'utilisateur
    const userFields = ['full_name', 'email', 'telephone'];
    userFields.forEach(field => {
      totalFields++;
      if (user[field as keyof User]) completedFields++;
    });

    // Vérifier les champs du médecin
    const doctorFields = [
      'speciality', 'birth_date', 'gender', 'national_id',
      'license_number', 'qualifications', 'years_of_experience',
      'office_phone', 'office_address', 'consultation_fee'
    ];

    doctorFields.forEach(field => {
      totalFields++;
      if (doctor[field as keyof Doctor]) completedFields++;
    });

    // Bonus pour les documents
    if (documents.length > 0) {
      completedFields++;
    }
    totalFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="space-y-6">
      {/* En-tête avec boutons d'action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading
            title="Profil professionnel"
            description="Gérez vos informations personnelles et professionnelles"
          />
        </div>
      </div>
      <Separator />

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
            {doctor.is_verified === 1 && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              {getStatusBadge(user.status)}
            </div>
            <p className="text-gray-600 font-medium">
              Spécialité : {doctor.speciality.name} • {doctor.years_of_experience} ans d'expérience
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{user.telephone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <CreditCard className="h-4 w-4" />
                <span>{doctor.consultation_fee} MAD / consultation</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto bg-white bg-opacity-70 p-4 rounded-lg shadow-sm border border-blue-50">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profil complet à</span>
                <span className="text-sm font-semibold">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statut du profil */}
        <Card className="md:col-span-3 shadow-sm border-l-4 border-l-amber-400">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-full">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Statut de votre compte</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {user.status === 'to_validate'
                      ? "Votre compte est en cours de vérification par notre équipe administrative"
                      : user.status === 'validated'
                        ? "Votre compte a été validé et est pleinement opérationnel"
                        : "Votre compte est actuellement bloqué, veuillez contacter l'administration"}
                  </p>
                </div>
              </div>
              <div className="ml-auto">
                {getStatusBadge(user.status)}
              </div>
            </div>
          </CardContent>
        </Card>

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

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Genre</p>
                <p className="font-medium">
                  {doctor.gender === 'male' ? 'Homme' :
                    doctor.gender === 'female' ? 'Femme' :
                      doctor.gender}
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
                      <Clock8 className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">En attente de vérification</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
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
                  Spécialité : {doctor.speciality.name}
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

        {/* Documents */}
        <Card className="md:col-span-3 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <FileIcon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-medium">Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {doctor.media && doctor.media.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctor.media.map((doc) => (
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
            ) : (
              <div className="text-center p-10 border border-dashed rounded-lg">
                <FileIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-1">Aucun document</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Aucun document n'a été téléchargé dans votre profil. Vous pouvez ajouter des documents en modifiant votre profil.
                </p>
                <Button onClick={onEditClick} variant="outline" className="mt-4">
                  <FileText className="mr-2 h-4 w-4" />
                  Ajouter des documents
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};