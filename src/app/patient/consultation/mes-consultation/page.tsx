import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import React, { Suspense } from 'react';
import ConsultationsListing from '@/features/patient/consultations-listing';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Mes consultations',
  description: 'Liste de mes consultations et demandes',
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
          <Link
            href="/patient/consultation/new"
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Demander une consultation
          </Link>
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
