import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title: 'Authentification | Connexion',
  description: 'Page de connexion pour l\'authentification.',
};

export default async function Page() {
  return <SignInViewPage />;
}
