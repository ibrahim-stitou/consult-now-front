// components/StatusSelect.tsx
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FormFieldCustom } from './FormFieldCustom';

type VehicleStatus = 'actif' | 'en_maintenance' | 'hors_service';

type StatusSelectProps = {
  value: VehicleStatus;
  onChange: (value: VehicleStatus) => void;
  error?: string | null;
};

export const VehiculeStatusSelect: React.FC<StatusSelectProps> = ({
                                                            value,
                                                            onChange,
                                                            error
                                                          }) => {
  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'en_maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'hors_service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: VehicleStatus) => {
    switch (status) {
      case 'actif':
        return 'Actif';
      case 'en_maintenance':
        return 'En maintenance';
      case 'hors_service':
        return 'Hors service';
      default:
        return '';
    }
  };

  return (
    <FormFieldCustom name="statut" label="Statut" required error={error}>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as VehicleStatus)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez un statut">
            {value && (
              <div className="flex items-center">
                <Badge className={cn("mr-2", getStatusColor(value))}>
                  {getStatusLabel(value)}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="actif">
            <div className="flex items-center">
              <Badge className="mr-2 bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="en_maintenance">
            <div className="flex items-center">
              <Badge className="mr-2 bg-yellow-100 text-yellow-800">
                En maintenance
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="hors_service">
            <div className="flex items-center">
              <Badge className="mr-2 bg-red-100 text-red-800">
                Hors service
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </FormFieldCustom>
  );
};