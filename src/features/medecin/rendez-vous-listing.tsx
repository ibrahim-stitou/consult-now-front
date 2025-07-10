'use client';

import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { CustomTableColumn, CustomTableFilterConfig, UseCustomTableReturnType } from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import CustomAlertDialog from '@/components/custom/customAlert';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RendezVous {
  id: number;
  title: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected';
  start_time: string;
  end_time: string;
  patient_name: string;
  type: 'Consultation' | 'Demande';
  actions: number;
}

export function RendezVousListing() {
  const router = useRouter();
  const [tableInstance, setTableInstance] = useState<Partial<UseCustomTableReturnType<RendezVous>> | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'approve' | 'reject' | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

// Dans rendez-vous-listing.tsx, modifiez la fonction handleViewDetails:
  const handleViewDetails = (row: RendezVous) => {
    // Format correct avec les paramètres dans la query string
    const type = row.type.toLowerCase();
    router.push(`/medecin/rendez-vous/${row.id}/details?type=${type}`);
  };
  const handleActionConfirm = async () => {
    if (selectedItemId === null || selectedItemType === null) {
      setOpenConfirmModal(false);
      return;
    }

    try {
      let response;

      if (selectedItemType === 'approve') {
        response = await apiClient.post(apiRoutes.medecin.demandesConsultation.validate(selectedItemId.toString()));

        if (response.data.success === true) {
          toast.success(response.data.message || "Demande approuvée avec succès");

          if (tableInstance && tableInstance.refresh) {
            tableInstance.refresh();
          }
        } else {
          toast.error(response.data.message || 'Une erreur est survenue');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      toast.error(`Erreur: ${errorMessage}`);
      console.error('Error processing request:', error);
    }

    setOpenConfirmModal(false);
  };

  const handleRejectSubmit = async () => {
    if (selectedItemId === null) {
      setOpenRejectModal(false);
      return;
    }

    try {
      const response = await apiClient.post(
        apiRoutes.medecin.demandesConsultation.reject(selectedItemId.toString()),
        { reason: rejectReason }
      );

      if (response.data.success === true) {
        toast.success(response.data.message || "Demande rejetée avec succès");

        if (tableInstance && tableInstance.refresh) {
          tableInstance.refresh();
        }
      } else {
        toast.error(response.data.message || 'Une erreur est survenue');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      toast.error(`Erreur: ${errorMessage}`);
      console.error('Error rejecting request:', error);
    }

    setOpenRejectModal(false);
    setRejectReason('');
  };

  const getStatusBadge = (status: string, type: string) => {
    if (type === 'Consultation') {
      switch (status) {
        case 'scheduled':
          return <Badge className="bg-blue-100 text-blue-800">Planifiée</Badge>;
        case 'completed':
          return <Badge className="bg-green-100 text-green-800">Terminée</Badge>;
        case 'cancelled':
          return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
        case 'approved':
          return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
        case 'rejected':
          return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
      }
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Consultation':
        return <Badge className="bg-purple-100 text-purple-800">Consultation</Badge>;
      case 'Demande':
        return <Badge className="bg-emerald-100 text-emerald-800">Demande</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy HH:mm', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const columns: CustomTableColumn<RendezVous>[] = [
    {
      data: 'id',
      label: 'ID',
      sortable: false
    },
    {
      data: 'title',
      label: 'Titre',
      sortable: true
    },
    {
      data: 'patient_name',
      label: 'Patient',
      sortable: true
    },
    {
      data: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => getTypeBadge(value)
    },
    {
      data: 'status',
      label: 'Statut',
      sortable: true,
      render: (value, row) => getStatusBadge(value, row.type)
    },
    {
      data: 'start_time',
      label: 'Date de début',
      sortable: true,
      render: (value) => formatDateTime(value)
    },
    {
      data: 'end_time',
      label: 'Date de fin',
      sortable: true,
      render: (value) => formatDateTime(value)
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
                onClick={() => handleViewDetails(row)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Voir les détails
            </TooltipContent>
          </Tooltip>

          {row.type === 'Demande' && row.status === 'pending' && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 w-8 bg-green-100 p-1.5 text-green-600 hover:bg-green-200"
                    onClick={() => {
                      setSelectedItemId(row.id);
                      setSelectedItemType('approve');
                      setOpenConfirmModal(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Approuver la demande
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
                    onClick={() => {
                      setSelectedItemId(row.id);
                      setSelectedItemType('reject');
                      setOpenRejectModal(true);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Rejeter la demande
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {row.type === 'Consultation' && row.status === 'scheduled' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-8 bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200"
                  onClick={() => router.push(`/medecin/consultations/${row.id}`)}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Démarrer la consultation
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'Consultation', label: 'Consultation' },
        { value: 'Demande', label: 'Demande' }
      ]
    },
    {
      field: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'scheduled', label: 'Planifiée' },
        { value: 'completed', label: 'Terminée' },
        { value: 'cancelled', label: 'Annulée' },
        { value: 'pending', label: 'En attente' },
        { value: 'approved', label: 'Approuvée' },
        { value: 'rejected', label: 'Rejetée' }
      ]
    },
    {
      field: 'start_date',
      label: 'Date de début',
      type: 'date'
    },
    {
      field: 'end_date',
      label: 'Date de fin',
      type: 'date'
    }
  ];

  const confirmTitle = 'Confirmer l\'approbation';
  const confirmDescription = 'Êtes-vous sûr de vouloir approuver cette demande de consultation ?';

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <CustomTable<RendezVous>
        columns={columns}
        url={apiRoutes.medecin.demandesConsultation.getAll}
        filters={filters}
        //@ts-ignore
        onInit={(instance) => setTableInstance(instance)}
      />

      {/* Modal pour confirmer l'approbation */}
      <CustomAlertDialog
        title={confirmTitle}
        description={confirmDescription}
        cancelText="Annuler"
        confirmText="Approuver"
        onConfirm={handleActionConfirm}
        open={openConfirmModal}
        setOpen={setOpenConfirmModal}
      />

      {/* Modal pour le rejet avec raison */}
      <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet de cette demande de consultation. Cette information sera communiquée au patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motif de rejet</Label>
              <Textarea
                id="reason"
                placeholder="Veuillez expliquer pourquoi cette demande est rejetée..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRejectModal(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
            >
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}