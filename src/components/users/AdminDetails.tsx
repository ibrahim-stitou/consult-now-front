// src/components/users/AdminDetails.tsx
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail, Phone, UserCircle, Calendar, BadgeCheck, ShieldCheck,
  Clock, Key, Settings, Shield
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

interface AdminDetailsProps {
  user: User;
}

export const AdminDetails = ({ user }: AdminDetailsProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
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
            <BadgeCheck className="w-3.5 h-3.5 mr-1" />
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
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Informations de l'administrateur */}
      <Card className="md:col-span-2 overflow-hidden shadow-sm">
        <CardHeader className="bg-indigo-50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-medium">Informations de l'administrateur</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16 border-2 border-indigo-100">
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-lg">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-slate-900">{user.full_name}</h3>
                {getStatusBadge(user.status)}
              </div>
              <p className="text-slate-500 text-sm">
                {user.role.name} • Inscrit le {formatDate(user.created_at).split(' à ')[0]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <p className="text-muted-foreground text-sm">Email vérifié</p>
              <p className="font-medium flex items-center gap-1.5">
                {user.email_verified_at ? (
                  <span className="text-green-600 flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4" />
                    {formatDate(user.email_verified_at)}
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Non vérifié
                  </span>
                )}
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
              <p className="font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {formatDate(user.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rôle et permissions */}
      <Card className="md:col-span-1 overflow-hidden shadow-sm">
        <CardHeader className="bg-indigo-50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-medium">Rôle & Permissions</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">Rôle</p>
                <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  {user.role.name}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Niveau d'accès</p>
                <div className="p-2.5 rounded-md bg-indigo-50 border border-indigo-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <p className="text-sm font-medium text-indigo-700">
                    Administrateur système
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Accès complet à toutes les fonctionnalités et à la gestion des utilisateurs
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Permissions principales</p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-1.5 text-slate-700">
                  <Settings className="h-3.5 w-3.5 text-indigo-500" />
                  Gestion des utilisateurs
                </li>
                <li className="flex items-center gap-1.5 text-slate-700">
                  <Settings className="h-3.5 w-3.5 text-indigo-500" />
                  Validation de comptes
                </li>
                <li className="flex items-center gap-1.5 text-slate-700">
                  <Settings className="h-3.5 w-3.5 text-indigo-500" />
                  Configuration système
                </li>
                <li className="flex items-center gap-1.5 text-slate-700">
                  <Settings className="h-3.5 w-3.5 text-indigo-500" />
                  Accès au tableau de bord
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card className="md:col-span-3 overflow-hidden shadow-sm">
        <CardHeader className="bg-indigo-50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-medium">Informations supplémentaires</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-6 text-slate-500">
            <Settings className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p>Les détails d'activité de l'administrateur ne sont pas disponibles dans cette vue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};