// components/FuelTypeSelect.tsx
import React from 'react';
import { Fuel } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FormFieldCustom } from './FormFieldCustom';

type FuelType = 'diesel' | 'essence' | 'electrique' | 'hybride';

type FuelTypeSelectProps = {
  value: FuelType;
  onChange: (value: FuelType) => void;
  error?: string | null;
};

export const FuelTypeSelect: React.FC<FuelTypeSelectProps> = ({
                                                                value,
                                                                onChange,
                                                                error
                                                              }) => {
  const getFuelLabel = (fuelType: FuelType) => {
    switch (fuelType) {
      case 'diesel':
        return 'Diesel';
      case 'essence':
        return 'Essence';
      case 'electrique':
        return 'Électrique';
      case 'hybride':
        return 'Hybride';
      default:
        return '';
    }
  };

  return (
    <FormFieldCustom name="carburant" label="Type de Carburant" required error={error}>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as FuelType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez un type de carburant">
            {value && (
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-gray-500" />
                {getFuelLabel(value)}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="diesel">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Diesel
            </div>
          </SelectItem>
          <SelectItem value="essence">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Essence
            </div>
          </SelectItem>
          <SelectItem value="electrique">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Électrique
            </div>
          </SelectItem>
          <SelectItem value="hybride">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Hybride
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </FormFieldCustom>
  );
};