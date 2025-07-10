// src/features/medecin/event-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface EventCardProps {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  patient_name: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'Planifié';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    default:
      return status;
  }
};

export const EventCard: React.FC<EventCardProps> = ({
                                                      id,
                                                      title,
                                                      start_time,
                                                      end_time,
                                                      status,
                                                      patient_name,
                                                    }) => {
  const formattedDate = format(new Date(start_time), 'dd MMMM yyyy', { locale: fr });
  const formattedStartTime = format(new Date(start_time), 'HH:mm');
  const formattedEndTime = format(new Date(end_time), 'HH:mm');

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title || 'Consultation'}</CardTitle>
          <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <UserIcon className="h-4 w-4" />
          <span className="font-medium">{patient_name}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>{formattedStartTime} - {formattedEndTime}</span>
        </div>
      </CardContent>
    </Card>
  );
};