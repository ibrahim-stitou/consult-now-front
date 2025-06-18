import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Tableau de bord Medecin - ConsultNow',
  description: 'Application des consultations médicales en ligne',
  icons: {
    icon: '/logo/small-svg-logo.svg'
  }
};

export default async function AdminLayout({
                                            children
                                          }: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen =true;
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}