import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import ConsultationsListing from '@/features/patient/consultations-listing';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Mes consultations',
  description: 'Liste de mes consultations et demandes'
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
            title="Mes consultations"
            description="Consultez vos consultations et demandes de consultation"
          />
        </div>
        <Separator />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={5} filterCount={4} />
          }
        >
          <ConsultationsListing />
        </Suspense>
      </div>
    </PageContainer>
  );
}