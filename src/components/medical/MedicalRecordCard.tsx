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
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type MedicalRecordEntry = {
  id: number;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  doctor?: {
    full_name: string;
    email: string;
    telephone: string;
  };
  consultation?: {
    title: string;
    start_time: string;
    end_time: string;
    status: string;
  };
  media?: Array<{
    id: number;
    name: string;
    mime_type: string;
    original_url: string;
    size: number;
    custom_properties?: {
      description?: string;
      type?: string;
    };
  }>;
};

interface MedicalRecordCardProps {
  entry: MedicalRecordEntry;
  isLatest?: boolean;
}

export default function MedicalRecordCard({ entry, isLatest = false }: MedicalRecordCardProps) {
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
        return 'bg-green-100 text-green-800';
      case 'scheduled':
      case 'programmé':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${isLatest ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200'}`}>
      {isLatest && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-blue-600 text-white flex items-center gap-1">
            <Star className="h-3 w-3" />
            Plus récent
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              Entrée médicale
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(entry.created_at), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(entry.created_at), 'HH:mm', { locale: fr })}</span>
              </div>
            </div>
          </div>
          {entry.consultation && (
            <Badge className={getStatusColor(entry.consultation.status)}>
              {entry.consultation.status}
            </Badge>
          )}
        </div>

        {entry.doctor && (
          <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{entry.doctor.full_name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{entry.doctor.email}</span>
                <span>•</span>
                <span>{entry.doctor.telephone}</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Consultation Info */}
        {entry.consultation && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Consultation associée</h4>
            <p className="text-sm text-blue-800">{entry.consultation.title}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-blue-700">
              <span>Début: {format(new Date(entry.consultation.start_time), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
              <span>Fin: {format(new Date(entry.consultation.end_time), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
            </div>
          </div>
        )}

        {/* Medical Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full flex-shrink-0">
                <Stethoscope className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Diagnostic</h4>
                <p className="text-sm text-gray-700">
                  {entry.diagnosis || <span className="text-gray-400 italic">Non renseigné</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                <Pill className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Prescription</h4>
                <p className="text-sm text-gray-700">
                  {entry.prescription || <span className="text-gray-400 italic">Aucune prescription</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full flex-shrink-0">
                <ClipboardList className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Traitement</h4>
                <p className="text-sm text-gray-700">
                  {entry.treatment || <span className="text-gray-400 italic">Aucun traitement</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full flex-shrink-0">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                <p className="text-sm text-gray-700">
                  {entry.notes || <span className="text-gray-400 italic">Aucune note</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        {entry.media && entry.media.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents attachés
                <Badge variant="outline">{entry.media.length}</Badge>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entry.media.map(doc => (
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
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(doc.size)}</span>
                        {doc.custom_properties?.description && (
                          <>
                            <span>•</span>
                            <span>{doc.custom_properties.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 text-xs"
                      asChild
                    >
                      <a
                        href={doc.original_url}
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

        {/* Footer with timestamp */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-right">
            Dernière modification: {format(new Date(entry.updated_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}