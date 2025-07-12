'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/custom/fileUpload';

const schema = z.object({
  notes: z.string().max(1000, "Trop long").optional(),
  diagnosis: z.string().min(1, "Diagnostic requis"),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  documents: z.array(z.any()).max(5, "Max 5 fichiers").optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
};

export default function AddMedicalRecordModal({ open, onClose, onSubmit, loading }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      notes: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      documents: [],
    }
  });

  const documents = watch('documents');

  const submitForm = async (data: FormValues) => {
    const formData = new FormData();
    formData.append('notes', data.notes || '');
    formData.append('diagnosis', data.diagnosis);
    formData.append('treatment', data.treatment || '');
    formData.append('prescription', data.prescription || '');
    (data.documents || []).forEach((file: any) => {
      if (file instanceof File) {
        formData.append('documents[]', file);
      } else if (file?.file instanceof File) {
        formData.append('documents[]', file.file);
      }
    });
    await onSubmit(formData);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une entrée au dossier médical</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <Textarea
            placeholder="Notes"
            {...register('notes')}
            rows={2}
          />
          {errors.notes && <p className="text-red-500 text-xs">{errors.notes.message}</p>}

          <Input
            placeholder="Diagnostic"
            {...register('diagnosis')}
          />
          {errors.diagnosis && <p className="text-red-500 text-xs">{errors.diagnosis.message}</p>}

          <Textarea
            placeholder="Traitement"
            {...register('treatment')}
            rows={2}
          />
          {errors.treatment && <p className="text-red-500 text-xs">{errors.treatment.message}</p>}

          <Textarea
            placeholder="Prescription"
            {...register('prescription')}
            rows={2}
          />
          {errors.prescription && <p className="text-red-500 text-xs">{errors.prescription.message}</p>}

          <FileUploader
            value={documents}
            onChange={files => setValue('documents', files, { shouldValidate: true })}
            accept={{
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc', '.docx'],
              'image/*': ['.jpg', '.jpeg', '.png']
            }}
            maxSize={10}
            maxFiles={5}
            multiple
            showPreview
          />
          {errors.documents && <p className="text-red-500 text-xs">{errors.documents.message as string}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { onClose(); reset(); }}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Ajouter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}