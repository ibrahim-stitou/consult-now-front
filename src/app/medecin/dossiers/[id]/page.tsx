'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import MedicalRecordCard from '@/components/medical/MedicalRecordCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, FileText, User, Calendar, Clock, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PatientRecordsMedical() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(apiRoutes.medecin.medicalRecords.getByPatientId(id as string))
      .then(res => {
        if (res.data.success) {
          setPatient(res.data.data.patient);
          setMedicalRecord(res.data.data.medical_record);
          setEntries(res.data.data.medical_record?.entries || []);
        } else {
          setError('Erreur lors du chargement du dossier médical');
        }
      })
      .catch(() => setError('Erreur lors du chargement du dossier médical'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6 w-full">
          <div>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="space-y-6 w-full">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <Heading
              title={`Dossier médical`}
              description={`Dossier médical complet pour ce patient`}
            />
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Dossier médical
          </Badge>
        </div>

        <Separator />

        {/* Patient Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="h-5 w-5" />
                Statistiques dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p><span className="font-medium">Entrées médicales:</span> {entries.length}</p>
                <p><span className="font-medium">Documents:</span> {entries.reduce((acc, entry) => acc + (entry.media?.length || 0), 0)}</p>
                <p><span className="font-medium">Créé le:</span> {medicalRecord?.created_at ? format(new Date(medicalRecord.created_at), 'dd/MM/yyyy', { locale: fr }) : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Clock className="h-5 w-5" />
                Dernière mise à jour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                {entries.length > 0 ? (
                  <>
                    <p className="font-medium">
                      {format(new Date(entries[0].updated_at), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-gray-600">
                      {format(new Date(entries[0].updated_at), 'HH:mm', { locale: fr })}
                    </p>
                    <p className="text-gray-600">
                      Par: {entries[0].doctor?.full_name || 'N/A'}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Aucune entrée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Records Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Historique médical</h3>
            <Badge variant="outline">{entries.length} entrée(s)</Badge>
          </div>

          {entries.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Aucun enregistrement médical</p>
                  <p className="text-sm">Aucun enregistrement médical n'a été trouvé pour ce patient.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((entry: any, index: number) => (
                <MedicalRecordCard
                  key={entry.id}
                  entry={entry}
                  isLatest={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}