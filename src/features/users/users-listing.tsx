'use client';

import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { CustomTableColumn, CustomTableFilterConfig, UseCustomTableReturnType } from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';

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
  role: string;
  actions: number;
}

export function UsersListing() {
  const router = useRouter();
  const [tableInstance, setTableInstance] = useState<Partial<UseCustomTableReturnType<User>> | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = (id: number) => {
    setSelectedUserId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUserId !== null) {
      try {
        const response = await apiClient.delete(apiRoutes.admin.users.delete(selectedUserId.toString()));

        if (response.data.success === true) {
          toast.success(response.data.message || `Utilisateur #${selectedUserId} supprimé avec succès`);
          if (tableInstance && tableInstance.refresh) {
            tableInstance.refresh();
          }
        } else {
          toast.error(response.data.message || 'Une erreur est survenue lors de la suppression');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la suppression';
        toast.error(`Erreur: ${errorMessage}`);
        console.error('Error deleting user:', error);
      }
    }
    setOpenDeleteModal(false);
  };

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

  const columns: CustomTableColumn<User>[] = [
    {
      data: 'id',
      label: 'ID',
      sortable: false
    },
    {
      data: 'full_name',
      label: 'Nom complet',
      sortable: true
    },
    {
      data: 'email',
      label: 'Email',
      sortable: true
    },
    {
      data: 'telephone',
      label: 'Téléphone',
      sortable: false
    },
    {
      data: 'role',
      label: 'Rôle',
      sortable: true,
      render: (value) => getUserRole(value)
    },
    {
      data: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => getUserStatus(value)
    },
    {
      data: 'created_at',
      label: 'Date de création',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR')
    },
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-1.5"
                onClick={() => router.push(`/admin/users/${row.id}/details`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Voir les détails
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-1.5"
                onClick={() => router.push(`/admin/users/${row.id}/modifier`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Modifier
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                className="h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
                onClick={() => handleDelete(row.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="tooltip-content rounded-md bg-red-100 px-2 py-1 text-red-600 shadow-md"
              sideOffset={5}
            >
              Supprimer
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'full_name',
      label: 'Nom complet',
      type: 'text'
    },
    {
      field: 'email',
      label: 'Email',
      type: 'text'
    },
    {
      field: 'role_id',
      label: 'Rôle',
      type: 'select',
      options: [
        { value: '1', label: 'Patient' },
        { value: '2', label: 'Médecin' },
        { value: '3', label: 'Admin' }
      ]
    },
    {
      field: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'new', label: 'Nouveau' },
        { value: 'validated', label: 'Validé' },
        { value: 'blocked', label: 'Bloqué' }
      ]
    }
  ];

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <CustomTable<User>
        columns={columns}
        url={apiRoutes.admin.users.getAll}
        filters={filters}
        onInit={(instance) => setTableInstance(instance)}
      />

      <CustomAlertDialog
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        cancelText="Annuler"
        confirmText="Supprimer"
        onConfirm={handleConfirmDelete}
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
      />
    </div>
  );
}