'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Clock,
  FileText,
  ShieldCheck,
  Pencil,
  ArrowLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
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

interface User {
  id: number;
  role_id: number;
  full_name: string;
  telephone: string;
  email: string;
  status: 'new' | 'validated' | 'blocked';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: UserRole;
}

export default function UserDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.admin.users.getById(userId));

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          toast.error('Impossible de récupérer les détails de cet utilisateur');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const getUserStatus = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Nouveau</span>
            </div>
          </Badge>
        );
      case 'validated':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Validé</span>
            </div>
          </Badge>
        );
      case 'blocked':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              <span>Bloqué</span>
            </div>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const getUserRole = (role: UserRole) => {
    switch (role.name) {
      case 'Admin':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Admin</span>
            </div>
          </Badge>
        );
      case 'Medecin':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            <div className="flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" />
              <span>Médecin</span>
            </div>
          </Badge>
        );
      case 'Patient':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <div className="flex items-center gap-1">
              <UserCircle className="h-3 w-3" />
              <span>Patient</span>
            </div>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
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
      const response = await apiClient.put(apiRoutes.admin.users.update(userId), {
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Statut mis à jour avec succès`);
        setUser(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        toast.error('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Une erreur est survenue lors du changement de statut');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Skeleton className="h-64 w-full md:col-span-2" />
            <Skeleton className="h-64 w-full md:col-span-1" />
            <Skeleton className="h-40 w-full md:col-span-3" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <Heading
              title="Utilisateur non trouvé"
              description="Les détails demandés ne sont pas disponibles"
            />
            <Button onClick={() => router.push('/admin/users')} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
            </Button>
          </div>
          <Separator />
          <Card>
            <CardContent className="p-6 text-center text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium">L&apos;utilisateur demandé n&apos;existe pas ou a été supprimé.</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => router.push('/admin/users')}
              >
                Retourner à la liste des utilisateurs
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Heading
            title={`${user.full_name}`}
            description={`Détails de l'utilisateur #${user.id}`}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}/modifier`)}
              size="sm"
              className="h-9"
            >
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/users')}
              size="sm"
              className="h-9"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations principales */}
          <Card className="md:col-span-2 overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Informations de l&apos;utilisateur</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h4>
                  <p className="text-base font-medium">{user.full_name}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Rôle</h4>
                  <div className="flex items-center">
                    {getUserRole(user.role)}
                    <span className="ml-2 text-xs text-gray-500">ID: {user.role_id}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-base">{user.email}</span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <Badge variant="outline" className={user.email_verified_at ? "text-green-600 bg-green-50" : "text-gray-500 bg-slate-50"}>
                      {user.email_verified_at ? "Vérifié" : "Non vérifié"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-base">{user.telephone}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date de création</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(user.created_at)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Dernière mise à jour</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(user.updated_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statut */}
          <Card className="md:col-span-1 overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-medium">Statut</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Statut actuel</h4>
                  <div className="flex items-center">
                    {getUserStatus(user.status)}
                  </div>
                </div>

                <Separator />

                <div className="pt-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                  <div className="flex flex-col gap-2 mt-3">
                    {user.status !== 'validated' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        onClick={() => handleChangeStatus('validated')}
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Valider l&apos;utilisateur
                      </Button>
                    )}

                    {user.status !== 'blocked' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        onClick={() => handleChangeStatus('blocked')}
                        disabled={isUpdatingStatus}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Bloquer l&apos;utilisateur
                      </Button>
                    )}

                    {user.status === 'blocked' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        onClick={() => handleChangeStatus('new')}
                        disabled={isUpdatingStatus}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Réinitialiser le statut
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section spécifique au rôle */}
          <Card className="md:col-span-3 overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user.role.code === 'medecin' ? (
                    <>
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg font-medium">Activité du médecin</CardTitle>
                    </>
                  ) : user.role.code === 'patient' ? (
                    <>
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg font-medium">Dossier médical</CardTitle>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg font-medium">Activité administrative</CardTitle>
                    </>
                  )}
                </div>

                {user.role.code === 'medecin' && (
                  <Button variant="outline" size="sm">
                    Voir le calendrier
                  </Button>
                )}

                {user.role.code === 'patient' && (
                  <Button variant="outline" size="sm">
                    Dossier complet
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {user.role.code === 'medecin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-blue-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Patients suivis</p>
                      <p className="text-2xl font-semibold mt-1">0</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">RDV aujourd&apos;hui</p>
                      <p className="text-2xl font-semibold mt-1">0</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Cette semaine</p>
                      <p className="text-2xl font-semibold mt-1">0</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Taux d&apos;occupation</p>
                      <p className="text-2xl font-semibold mt-1">0%</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {user.role.code === 'patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-blue-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Consultations</p>
                      <p className="text-2xl font-semibold mt-1">0</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Ordonnances</p>
                      <p className="text-2xl font-semibold mt-1">0</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">RDV à venir</p>
                      <p className="text-2xl font-semibold mt-1">0</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Dernière visite</p>
                      <p className="text-sm font-semibold mt-1">Aucune</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500">
                  {user.role.code === 'medecin' ? 'Aucun rendez-vous à venir' :
                    user.role.code === 'patient' ? 'Aucune donnée médicale disponible' :
                      'Aucune activité récente'}
                </p>

                <Button variant="outline" size="sm" className="mt-4">
                  {user.role.code === 'medecin' ? 'Configurer la disponibilité' :
                    user.role.code === 'patient' ? 'Ajouter des informations médicales' :
                      'Voir les journaux d\'activité'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}