import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { RendezVousListing } from '@/features/medecin/rendez-vous-listing';

export const metadata = {
  title: 'Médecin : Rendez-vous',
  description: 'Gérer et consulter vos rendez-vous'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const key = serialize({ ...searchParams });

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Rendez-vous"
            description="Gérer vos consultations et demandes"
          />
        </div>
        <Separator />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={5} filterCount={4} />
          }
        >
          <RendezVousListing />
        </Suspense>
      </div>
    </PageContainer>
  );
}