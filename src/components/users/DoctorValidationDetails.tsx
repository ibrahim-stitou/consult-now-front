// src/components/users/DoctorValidationDetails.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail, Phone, UserCircle, Calendar, BadgeCheck, AlertCircle, Clock8,
  MapPin, Award, GraduationCap, Building, CreditCard, FileText,
  ExternalLink, Download, Shield, Briefcase, FileIcon, CheckCircle, XCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

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
  speciality: Speciality;
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
  status: 'new' | 'validated' | 'to_validate' | 'blocked';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: UserRole;
  doctor: Doctor;
  patient: any;
}

interface DoctorValidationDetailsProps {
  user: User;
  onStatusChange?: () => void;
}

export const DoctorValidationDetails = ({ user, onStatusChange }: DoctorValidationDetailsProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
            Rejeté
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
        return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleValidateDoctor = async () => {
    try {
      setIsUpdatingStatus(true);
      // Mettre à jour le statut de l'utilisateur
      const statusResponse = await apiClient.put(apiRoutes.admin.users.update(user.id.toString()), {
        status: 'validated'
      });

      // Vérifier le médecin
      const verifyResponse = await apiClient.put(
        apiRoutes.admin.users.validateDoctor(user.id.toString())
      );

      if (statusResponse.data.success && verifyResponse.data.success) {
        toast.success("Le médecin a été validé avec succès");
        if (onStatusChange) onStatusChange();
      } else {
        toast.error("Une erreur est survenue lors de la validation du médecin");
      }
    } catch (error) {
      console.error('Error validating doctor:', error);
      toast.error("Une erreur est survenue lors de la validation du médecin");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRejectDoctor = async () => {
    if (!rejectReason.trim()) {
      toast.error("Le motif de rejet est obligatoire");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await apiClient.post(apiRoutes.admin.users.rejectDoctor(user.id.toString()), {
        reason: rejectReason
      });

      if (response.data.success) {
        toast.success("La demande du médecin a été rejetée");
        setIsRejectModalOpen(false);
        setRejectReason('');
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error("Une erreur est survenue lors du rejet de la demande");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec boutons d'action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Validation du profil médecin</h2>
          <p className="text-muted-foreground">Examinez les informations pour valider ou rejeter la demande</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
            disabled={isUpdatingStatus}
            onClick={() => setIsRejectModalOpen(true)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeter
          </Button>
          <Button
            variant="outline"
            className="border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
            disabled={isUpdatingStatus}
            onClick={handleValidateDoctor}
          >
            <BadgeCheck className="mr-2 h-4 w-4" />
            Valider
          </Button>
        </div>
      </div>

      {/* Carte d'état de validation */}
      <Card className="shadow-sm border-l-4 border-l-amber-400">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Demande de validation en attente</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Ce médecin est en attente de validation par l'administration
                </p>
              </div>
            </div>
            <div className="ml-auto">
              {getStatusBadge(user.status)}
            </div>
          </div>
        </CardContent>
      </Card>

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
            {user.doctor.is_verified === 1 && (
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
              Spécialité : {user.doctor.speciality?.name || "Non spécifiée"} • {user.doctor.years_of_experience} ans d'expérience
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{user.telephone || "Non spécifié"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <CreditCard className="h-4 w-4" />
                <span>{user.doctor.consultation_fee} MAD / consultation</span>
              </div>
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

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {user.telephone || "Non spécifié"}
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
                <div className="mt-1 py-1.5 px-2.5 rounded-md bg-amber-50 text-amber-700">
                  <div className="flex items-center gap-2">
                    <Clock8 className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">En attente de vérification</span>
                  </div>
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
                  {user.doctor.speciality?.name || "Non spécifiée"}
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

        {/* Documents */}
        {user.doctor.media && user.doctor.media.length > 0 ? (
          <Card className="md:col-span-3 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Documents fournis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.doctor.media.map((doc) => (
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
          <Card className="md:col-span-3 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-10 border border-dashed rounded-lg">
                <FileIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-1">Aucun document</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Aucun document n'a été téléchargé par ce médecin.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section d'actions de validation */}
      <Card className="shadow-sm border-t-4 border-t-blue-400">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Action requise</h3>
            <p className="text-muted-foreground">
              Veuillez valider ou rejeter la demande d'inscription de ce médecin après avoir examiné ses informations et documents.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                disabled={isUpdatingStatus}
                onClick={() => setIsRejectModalOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter la demande
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                disabled={isUpdatingStatus}
                onClick={handleValidateDoctor}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                Valider ce médecin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de rejet avec motif */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeter la demande du médecin</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet. Cette information sera communiquée au médecin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Saisissez le motif du rejet (obligatoire)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[120px]"
            />
            {!rejectReason.trim() && (
              <p className="text-sm text-red-500">Le motif est obligatoire</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isUpdatingStatus}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRejectDoctor}
              disabled={!rejectReason.trim() || isUpdatingStatus}
            >
              {isUpdatingStatus ? "Traitement en cours..." : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};