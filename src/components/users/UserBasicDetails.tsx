// src/components/users/UserBasicDetails.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail,
  Phone,
  UserCircle,
  Calendar,
  BadgeCheck,
  AlertCircle,
  Clock
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

interface UserBasicDetailsProps {
  user: any;
  onStatusChange?: () => void;
}

export const UserBasicDetails = ({ user, onStatusChange }: UserBasicDetailsProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getUserStatus = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
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
            <Clock className="w-3.5 h-3.5 mr-1" />
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

  const getUserRole = (role: any) => {
    switch (role.code) {
      case 'admin':
        return (
          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
            {role.name}
          </Badge>
        );
      case 'medecin':
        return (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
            {role.name}
          </Badge>
        );
      case 'patient':
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
            {role.name}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {role.name}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const handleChangeStatus = async (newStatus: 'validated' | 'blocked') => {
    try {
      setIsUpdatingStatus(true);
      const response = await apiClient.put(apiRoutes.admin.users.update(user.id.toString()), {
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Statut modifié avec succès: ${newStatus}`);
        if (onStatusChange) onStatusChange();
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Informations principales */}
      <Card className="md:col-span-2 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-medium">Informations personnelles</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Nom complet</p>
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Email</p>
              <p className="font-medium flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Téléphone</p>
              <p className="font-medium flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user.telephone || 'Non spécifié'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Date d'inscription</p>
              <p className="font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(user.created_at)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Dernière mise à jour</p>
              <p className="font-medium">{formatDate(user.updated_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Vérification email</p>
              <p className="font-medium">
                {user.email_verified_at ? formatDate(user.email_verified_at) : 'Non vérifié'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut */}
      <Card className="md:col-span-1 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-medium">Statut</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">Statut actuel</p>
                {getUserStatus(user.status)}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">Rôle</p>
                {getUserRole(user.role)}
              </div>
            </div>

            <div className="pt-3 border-t space-y-3">
              <p className="text-sm font-medium">Actions</p>
              <div className="flex flex-col gap-2">
                {user.status !== 'validated' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
                    disabled={isUpdatingStatus}
                    onClick={() => handleChangeStatus('validated')}
                  >
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Valider l'utilisateur
                  </Button>
                )}
                {user.status !== 'blocked' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                    disabled={isUpdatingStatus}
                    onClick={() => handleChangeStatus('blocked')}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Bloquer l'utilisateur
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};