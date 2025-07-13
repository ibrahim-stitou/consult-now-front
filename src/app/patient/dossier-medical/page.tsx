'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PatientMedicalRecordCard from '@/components/medical/PatientMedicalRecordCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  FileText,
  Heart,
  Calendar,
  Clock,
  User,
  Activity,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MedicalRecordData {
  entry: {
    id: number;
    medical_record_id: number;
    consultation_id: number;
    doctor_id: number;
    notes: string;
    diagnosis: string;
    treatment: string;
    prescription: string;
    created_at: string;
    updated_at: string;
    doctor: {
      id: number;
      full_name: string;
      telephone: string;
      email: string;
      status: string;
    };
    consultation: {
      id: number;
      title: string;
      description: string;
      start_time: string;
      end_time: string;
      status: string;
    };
    media: Array<{
      id: number;
      name: string;
      file_name: string;
      mime_type: string;
      size: number;
      original_url: string;
      custom_properties?: {
        type?: string;
        description?: string;
      };
    }>;
  };
  documents: Array<{
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
  }>;
}

export default function MyMedicalRecord() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordData[]>([]);

  useEffect(() => {
    setLoading(true);
    apiClient.get(apiRoutes.patient.medicalRecords.myMedicalRecords)
      .then(res => {
        if (res.data.success) {
          setMedicalRecords(res.data.data || []);
        } else {
          setError('Erreur lors du chargement de votre dossier médical');
        }
      })
      .catch(() => setError('Erreur lors du chargement de votre dossier médical'))
      .finally(() => setLoading(false));
  }, []);

  const totalDocuments = medicalRecords.reduce((acc, record) => acc + record.documents.length, 0);
  const totalConsultations = medicalRecords.length;
  const uniqueDoctors = [...new Set(medicalRecords.map(record => record.entry.doctor.id))].length;

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6 w-full">
          <div>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <p className="font-medium">Erreur de chargement</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <Heading
              title="Mon dossier médical"
              description="Consultez l'historique de vos consultations et traitements"
            />
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            Confidentiel
          </Badge>
        </div>

        <Separator />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Activity className="h-5 w-5" />
                Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{totalConsultations}</div>
              <p className="text-sm text-blue-600">Total des consultations</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <User className="h-5 w-5" />
                Médecins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{uniqueDoctors}</div>
              <p className="text-sm text-green-600">Médecins consultés</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{totalDocuments}</div>
              <p className="text-sm text-purple-600">Documents médicaux</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Clock className="h-5 w-5" />
                Dernière visite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-orange-800">
                {medicalRecords.length > 0 ? (
                  format(new Date(medicalRecords[0].entry.created_at), 'dd/MM/yyyy', { locale: fr })
                ) : (
                  'Aucune'
                )}
              </div>
              <p className="text-sm text-orange-600">
                {medicalRecords.length > 0 && medicalRecords[0].entry.doctor.full_name}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Medical Records Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Historique médical</h3>
            <Badge variant="outline">{medicalRecords.length} entrée(s)</Badge>
          </div>

          {medicalRecords.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Aucun dossier médical</p>
                  <p className="text-sm">Vous n'avez pas encore de consultations enregistrées.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record, index) => (
                <PatientMedicalRecordCard
                  key={record.entry.id}
                  record={record}
                  isLatest={index === 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <Card className="border-gray-200 bg-gray-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Confidentialité et sécurité</p>
                <p>
                  Vos données médicales sont protégées et ne sont accessibles qu'à vous et aux professionnels
                  de santé autorisés. Conformément à la réglementation en vigueur, vous avez le droit d'accéder,
                  de modifier et de supprimer vos données personnelles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}