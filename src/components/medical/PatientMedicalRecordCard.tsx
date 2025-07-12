import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  User,
  FileText,
  Stethoscope,
  Pill,
  ClipboardList,
  Download,
  Calendar,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Eye,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

interface PatientMedicalRecordCardProps {
  record: MedicalRecordData;
  isLatest?: boolean;
}

export default function PatientMedicalRecordCard({ record, isLatest = false }: PatientMedicalRecordCardProps) {
  const { entry, documents } = record;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('doc')) return '📝';
    return '📎';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminé':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
      case 'programmé':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
      case 'annulé':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDoctorStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${isLatest ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200'}`}>
      {isLatest && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-blue-600 text-white flex items-center gap-1 shadow-md">
            <Star className="h-3 w-3" />
            Plus récent
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg mb-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              {entry.consultation.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(entry.consultation.start_time), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(entry.consultation.start_time), 'HH:mm', { locale: fr })}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(entry.consultation.status)}>
            {entry.consultation.status === 'scheduled' ? 'Programmé' : entry.consultation.status}
          </Badge>
        </div>

        {/* Doctor Information */}
        <div className="flex items-center gap-3 mt-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900">{entry.doctor.full_name}</p>
              <Badge variant="outline" className={getDoctorStatusColor(entry.doctor.status)}>
                {entry.doctor.status === 'validated' ? 'Validé' : entry.doctor.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{entry.doctor.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{entry.doctor.telephone}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Consultation Details */}
        {entry.consultation.description && entry.consultation.description !== '------------' && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Description de la consultation
            </h4>
            <p className="text-sm text-blue-800">{entry.consultation.description}</p>
          </div>
        )}

        {/* Medical Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Diagnosis */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full flex-shrink-0">
                <Stethoscope className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">Diagnostic</h4>
                <p className="text-sm text-red-800">
                  {entry.diagnosis && entry.diagnosis !== '------------' ?
                    entry.diagnosis :
                    <span className="text-red-400 italic">Non renseigné</span>
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Treatment */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full flex-shrink-0">
                <ClipboardList className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-purple-900 mb-1">Traitement</h4>
                <p className="text-sm text-purple-800">
                  {entry.treatment && entry.treatment !== '------------' ?
                    entry.treatment :
                    <span className="text-purple-400 italic">Aucun traitement</span>
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Prescription */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                <Pill className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">Prescription</h4>
                <p className="text-sm text-green-800">
                  {entry.prescription && entry.prescription !== '------------' ?
                    entry.prescription :
                    <span className="text-green-400 italic">Aucune prescription</span>
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full flex-shrink-0">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 mb-1">Notes du médecin</h4>
                <p className="text-sm text-orange-800">
                  {entry.notes && entry.notes !== '------------------------------' ?
                    entry.notes :
                    <span className="text-orange-400 italic">Aucune note</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        {documents && documents.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents médicaux
                <Badge variant="outline">{documents.length}</Badge>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-2xl">
                      {getFileIcon(doc.mime_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 text-xs"
                      asChild
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.name}
                      >
                        <Download className="h-3 w-3" />
                        Télécharger
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer with privacy notice and timestamp */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Données confidentielles</span>
            </div>
            <p className="text-xs text-gray-500">
              Mise à jour: {format(new Date(entry.updated_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}