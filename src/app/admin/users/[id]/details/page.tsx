'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Pencil
} from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading } from '@/components/ui/heading';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { UserBasicDetails } from '@/components/users/UserBasicDetails';
import { DoctorValidationDetails } from '@/components/users/DoctorValidationDetails';
import { DoctorValidatedDetails } from '@/components/users/DoctorValidatedDetails';
import { PatientDetails } from '@/components/users/PatientDetails';
import { AdminDetails } from '@/components/users/AdminDetails';

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
  doctorProfile?: any;
  patientProfile?: any;
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
        const response = await apiClient.get(apiRoutes.admin.users.getById(userId));

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          toast.error(response.data.message || "Une erreur est survenue");
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const refreshUserData = async () => {
    try {
      const response = await apiClient.get(apiRoutes.admin.users.getById(userId));
      if (response.data.success) {
        setUser(response.data.data);
        toast.success('Informations utilisateur mises à jour');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Impossible de rafraîchir les données');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="mx-auto w-full space-y-6 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[350px]" />
            </div>
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] md:col-span-2" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[300px] md:col-span-3" />
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
              description="L'utilisateur demandé n'existe pas ou a été supprimé"
            />
            <Button
              variant="outline"
              onClick={() => router.push('/admin/users')}
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </div>
          <Separator />
        </div>
      </PageContainer>
    );
  }

  // Détermine quel composant de détails afficher en fonction du rôle et du statut
  const renderUserDetails = () => {
    if (user.role.code === 'medecin') {
      if (user.status === 'to_validate') {
        return <DoctorValidationDetails
          user={user}
          onStatusChange={refreshUserData}
        />;
      } else {
        return <DoctorValidatedDetails
          user={user}
        />;
      }
    } else if (user.role.code === 'patient') {
      return <PatientDetails
        user={user}
      />;
    } else if (user.role.code === 'admin') {
      return <AdminDetails
        user={user}
      />;
    }

    // Par défaut, afficher les détails de base
    return <UserBasicDetails
      user={user}
      onStatusChange={refreshUserData}
    />;
  };

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
              onClick={() => router.push('/admin/users')}
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}/modifier`)}
              size="sm"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
        <Separator />

        {/* Affichage dynamique en fonction du rôle et du statut */}
        {renderUserDetails()}
      </div>
    </PageContainer>
  );
}