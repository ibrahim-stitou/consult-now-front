'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { CustomTableColumn, CustomTableFilterConfig, UseCustomTableReturnType } from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Consultation {
  id: number;
  title: string;
  status: string;
  start_time: string;
  end_time: string;
  doctor_name: string;
  type: string;
  actions: number;
}

export function ConsultationsListing() {
  const router = useRouter();
  const [tableInstance, setTableInstance] = useState<Partial<UseCustomTableReturnType<Consultation>> | null>(null);

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
      const date = parseISO(dateString.replace(' ', 'T'));
      return format(date, 'dd MMM yyyy HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const columns: CustomTableColumn<Consultation>[] = [
    { data: 'id', label: 'ID', sortable: false },
    { data: 'title', label: 'Titre', sortable: true },
    { data: 'doctor_name', label: 'Médecin', sortable: true },
    { data: 'type', label: 'Type', sortable: true, render: (value) => getTypeBadge(value) },
    { data: 'status', label: 'Statut', sortable: true, render: (value, row) => getStatusBadge(value, row.type) },
    { data: 'start_time', label: 'Début', sortable: true, render: (value) => formatDateTime(value) },
    { data: 'end_time', label: 'Fin', sortable: true, render: (value) => formatDateTime(value) },
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <Button
          variant="outline"
          className="h-8 w-8 p-1.5"
          onClick={() => router.push(`/patient/consultation/mes-consultation/${row.id}/details?type=${row.type.toLowerCase()}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
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
    }
  ];

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <CustomTable<Consultation>
        columns={columns}
        url={apiRoutes.patient.consultations.mesConsultations}
        filters={filters}
        //@ts-ignore
        onInit={(instance) => setTableInstance(instance)}
      />
    </div>
  );
}

export default ConsultationsListing;