'use client';

import React, { useState } from 'react';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseCustomTableReturnType
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PatientMedicalRecord {
  id: number;
  full_name: string;
  birth_day: string;
  gender: string;
  blood_group: string;
  allergies: string;
  chronic_diseases: string;
  weight: number;
  height: number;
  insurance_number: string;
  actions: number;
}
export default function PatientsList() {
  const [tableInstance, setTableInstance] = useState<Partial<UseCustomTableReturnType<PatientMedicalRecord>> | null>(null);
const columns: CustomTableColumn<PatientMedicalRecord>[] = [
  { data: 'id', label: 'ID', sortable: false },
  { data: 'full_name', label: 'Nom', sortable: true },
  { data: 'birth_day', label: 'Date de naissance', sortable: true },
  { data: 'gender', label: 'Sexe', sortable: true, render: (value) => (
      <Badge className={value === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
        {value === 'male' ? 'Homme' : 'Femme'}
      </Badge>
    )
  },
  { data: 'blood_group', label: 'Groupe sanguin', sortable: true },
  { data: 'allergies', label: 'Allergies', sortable: false },
  { data: 'chronic_diseases', label: 'Maladies chroniques', sortable: false },
  { data: 'weight', label: 'Poids (kg)', sortable: true },
  { data: 'height', label: 'Taille (cm)', sortable: true },
  { data: 'insurance_number', label: 'N° Assurance', sortable: false },
  {
    data: 'actions',
    label: 'Actions',
    sortable: false,
    render: (_value, row) => {
      const router = useRouter();
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/medecin/dossiers/${row.id}`)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Voir
        </Button>
      );
    }
  }
];

const filters: CustomTableFilterConfig[] = [
  {
    field: 'gender',
    label: 'Sexe',
    type: 'select',
    options: [
      { value: 'all', label: 'Tous' },
      { value: 'male', label: 'Homme' },
      { value: 'female', label: 'Femme' }
    ]
  },
  {
    field: 'blood_group',
    label: 'Groupe sanguin',
    type: 'select',
    options: [
      { value: 'all', label: 'Tous' },
      { value: 'A-', label: 'A-' },
      { value: 'A+', label: 'A+' },
      { value: 'B-', label: 'B-' },
      { value: 'B+', label: 'B+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'O-', label: 'O-' },
      { value: 'O+', label: 'O+' }
    ]
  }
];


  return (
    <div className="flex flex-1 flex-col space-y-4">
    <CustomTable<PatientMedicalRecord>
      columns={columns}
      url={apiRoutes.medecin.petients.list}
      filters={filters}
      //@ts-ignore
      onInit={(instance) => setTableInstance(instance)}
    />
    </div>
  );
}