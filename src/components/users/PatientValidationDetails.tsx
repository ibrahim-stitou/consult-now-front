// src/components/users/PatientValidationDetails.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail, Phone, UserCircle, Calendar, BadgeCheck, AlertCircle, Clock,
  Shield, FileText, XCircle, CheckCircle, User
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface Patient {
  id: number;
  user_id: number;
  birth_day: string | null;
  gender: string;
  blood_group: string | null;
  allergies: string | null;
  chronic_diseases: string | null;
  current_medications: string | null;
  weight: number | null;
  height: number | null;
  insurance_number: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
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
  patient: Patient;
}

interface PatientValidationDetailsProps {
  user: User;
  onStatusChange?: () => void;
}

export const PatientValidationDetails = ({ user, onStatusChange }: PatientValidationDetailsProps) => {
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
            <Clock className="w-3.5 h-3.5 mr-1" />
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
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
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

  const handleValidatePatient = async () => {
    try {
      setIsUpdatingStatus(true);
      // Mettre à jour le statut de l'utilisateur
      const response = await apiClient.put(apiRoutes.admin.users.validateDoctor(user.id.toString()));

      if (response.data.success) {
        toast.success("Le patient a été validé avec succès");
        if (onStatusChange) onStatusChange();
      } else {
        toast.error("Une erreur est survenue lors de la validation du patient");
      }
    } catch (error) {
      console.error('Error validating patient:', error);
      toast.error("Une erreur est survenue lors de la validation du patient");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRejectPatient = async () => {
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
        toast.success("La demande du patient a été rejetée");
        setIsRejectModalOpen(false);
        setRejectReason('');
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error('Error rejecting patient:', error);
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
          <h2 className="text-xl font-bold">Validation du profil patient</h2>
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
            onClick={handleValidatePatient}
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
                  Ce patient est en attente de validation par l'administration
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
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xl">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              {getStatusBadge(user.status)}
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                {user.role.name}
              </Badge>
            </div>
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
              {user.patient?.birth_day && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Né(e) le {formatDate(user.patient.birth_day)}</span>
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

              {user.patient && (
                <>
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {getGenderLabel(user.patient.gender)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(user.patient.birth_day)}
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

              {user.patient?.insurance_number && (
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Numéro d'assurance</p>
                  <p className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {user.patient.insurance_number}
                  </p>
                </div>
              )}
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
                  <User className="h-4 w-4 text-muted-foreground" />
                  {user.role.name}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Statut</p>
                <div className="mt-1">{getStatusBadge(user.status)}</div>
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
            </div>
          </CardContent>
        </Card>

        {/* Informations médicales */}
        {user.patient && (
          <Card className="md:col-span-3 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Informations médicales</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.patient.blood_group && (
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Groupe sanguin</p>
                    <div className="bg-red-50 text-red-700 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium">
                      {user.patient.blood_group}
                    </div>
                  </div>
                )}

                {user.patient.height && (
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Taille</p>
                    <p className="font-medium">
                      {user.patient.height} cm
                    </p>
                  </div>
                )}

                {user.patient.weight && (
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">Poids</p>
                    <p className="font-medium">
                      {user.patient.weight} kg
                    </p>
                  </div>
                )}

                {user.patient.allergies && (
                  <div className="md:col-span-3 space-y-1.5">
                    <p className="text-sm text-muted-foreground">Allergies</p>
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                      <p className="font-medium">{user.patient.allergies}</p>
                    </div>
                  </div>
                )}

                {user.patient.chronic_diseases && (
                  <div className="md:col-span-3 space-y-1.5">
                    <p className="text-sm text-muted-foreground">Maladies chroniques</p>
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                      <p className="font-medium">{user.patient.chronic_diseases}</p>
                    </div>
                  </div>
                )}

                {user.patient.current_medications && (
                  <div className="md:col-span-3 space-y-1.5">
                    <p className="text-sm text-muted-foreground">Médicaments actuels</p>
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                      <p className="font-medium">{user.patient.current_medications}</p>
                    </div>
                  </div>
                )}
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
              Veuillez valider ou rejeter la demande d'inscription de ce patient après avoir examiné ses informations.
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
                onClick={handleValidatePatient}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                Valider ce patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de rejet avec motif */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeter la demande du patient</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet. Cette information sera communiquée au patient.
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
              onClick={handleRejectPatient}
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