'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Phone, UserCircle, CalendarIcon, BadgeCheck, AlertCircle } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

interface User {
  id: number;
  full_name: string;
  email: string;
  telephone: string;
  status: 'new' | 'validated' | 'blocked';
  email_verified_at: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function UserDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.admin.users.get(userId));

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
          <Badge className="bg-blue-100 text-blue-800">Nouveau</Badge>
        );
      case 'validated':
        return (
          <Badge className="bg-green-100 text-green-800">Validé</Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-red-100 text-red-800">Bloqué</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
        );
    }
  };

  const getUserRole = (role: string) => {
    switch (role) {
      case 'Admin':
        return (
          <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
        );
      case 'Medecin':
        return (
          <Badge className="bg-emerald-100 text-emerald-800">Médecin</Badge>
        );
      case 'Patient':
        return (
          <Badge className="bg-blue-100 text-blue-800">Patient</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">{role}</Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
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
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
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
              title="Erreur"
              description="Impossible de charger les détails de l'utilisateur"
            />
            <Button onClick={() => router.push('/admin/users')}>
              Retour à la liste
            </Button>
          </div>
          <Separator />
          <Card>
            <CardContent className="p-6 text-center text-red-500">
              Les données de l&apos;utilisateur n&apos;ont pas pu être chargées. Veuillez réessayer plus tard.
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Heading
            title={`Utilisateur: ${user.full_name}`}
            description="Détails de l'utilisateur"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}/modifier`)}
              size="sm"
            >
              Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/users')}
              size="sm"
            >
              Retour
            </Button>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations principales */}
          <Card className="md:col-span-2 overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <UserCircle className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Informations de l'utilisateur</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h4>
                  <p className="text-base font-semibold">{user.full_name}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Rôle</h4>
                  <div>{getUserRole(user.role)}</div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-base">{user.email}</p>
                  </div>
                  <div className="mt-1">
                    {user.email_verified_at ? (
                      <Badge className="bg-green-50 text-green-700 gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Vérifié le {formatDate(user.email_verified_at)}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Non vérifié
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-base">{user.telephone}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date de création</h4>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <p className="text-base">{formatDate(user.created_at)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Dernière mise à jour</h4>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <p className="text-base">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statut */}
          <Card className="md:col-span-1 overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Statut</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Statut actuel</h4>
                  <div className="flex items-center gap-2">
                    {getUserStatus(user.status)}
                  </div>
                </div>

                <Separator />

                <div className="pt-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                  <div className="flex flex-col gap-2 mt-3">
                    {user.status === 'new' && (
                      <Button
                        variant="outline"
                        className="w-full bg-green-50 text-green-700 hover:bg-green-100"
                        size="sm"
                      >
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        Valider l'utilisateur
                      </Button>
                    )}
                    {user.status !== 'blocked' && (
                      <Button
                        variant="outline"
                        className="w-full bg-red-50 text-red-700 hover:bg-red-100"
                        size="sm"
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Bloquer l'utilisateur
                      </Button>
                    )}
                    {user.status === 'blocked' && (
                      <Button
                        variant="outline"
                        className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100"
                        size="sm"
                      >
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        Débloquer l'utilisateur
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Données d'accès */}
          <Card className="md:col-span-3 overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Historique des connexions</h3>
                </div>
                <Button variant="outline" size="sm">
                  Voir tout l'historique
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Adresse IP</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Appareil</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Statut</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-sm">192.168.1.1</td>
                    <td className="px-4 py-3 text-sm">Chrome / Windows</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-green-100 text-green-800">Réussie</Badge>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(user.updated_at)}</td>
                    <td className="px-4 py-3 text-sm">192.168.1.1</td>
                    <td className="px-4 py-3 text-sm">Safari / iOS</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-green-100 text-green-800">Réussie</Badge>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}