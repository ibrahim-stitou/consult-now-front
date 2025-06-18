'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import LogoComplet from '@/components/custom/logo-complet';
import BackgroundImage from '@/components/custom/background-image';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Entrez une adresse email valide' }),
  password: z.string().min(1, { message: 'Le mot de passe est requis' })
});

type UserFormValue = z.infer<typeof formSchema>;

// Logo Component utilisant LogoComplet
function ConsultLogo() {
  return (
    <div className="flex items-center justify-start mb-0 p-0">
      <div className="justify-start w-35 p-0 m-0 h-12 mt-14">
        <Link href="/">
        <LogoComplet
          imagePath="/images/logo-complet.png"
          altText="Logo Complet"
          overlayClassName="object-contain m-0"
        />
        </Link>
        <div className="h-0.5 w-2.5 bg-green "></div>
      </div>
    </div>
  );
}

// Auth Form Component
function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();

  const defaultValues = {
    email: 'consultnow@admin.com',
    password: 'Admin123!'
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl: callbackUrl ?? '/dashboard'
        });

        if (result?.error) {
          toast.error('Identifiants invalides');
        } else {
          const session = await fetch('/api/auth/session').then((res) => res.json());
          const roleCode = session?.user?.role?.code || 'unknown';

          switch (roleCode) {
            case 'admin':
              toast.success('Connexion réussie !');
              window.location.href = '/admin/overview';
              break;
            case 'patient':
              toast.success('Connexion réussie !');
              window.location.href = '/patient/overview';
              break;
            case 'medecin':
              toast.success('Connexion réussie !');
              window.location.href = '/medecin/overview';
              break;
            default:
              toast.error('Rôle non autorisé');
          }
        }
      } catch (error) {
        toast.error('Une erreur est survenue');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 text-sm">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  disabled={loading}
                  className="h-12 rounded-lg border-gray-200 bg-gray-50 focus:border-emerald-500 focus:ring-emerald-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 text-sm">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  disabled={loading}
                  className="h-12 rounded-lg border-gray-200 bg-gray-50 focus:border-emerald-500 focus:ring-emerald-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-emerald-600 hover:text-emerald-700">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium"
        >
          {loading ? 'CONNEXION...' : 'CONTINUE'}
        </Button>
      </form>
    </Form>
  );
}

export default function SignInViewPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image using BackgroundImage component */}
      <div className="absolute inset-0">
        <BackgroundImage
          imagePath="/images/bg-image.png"
          altText="Medical Background"
          overlayClassName="opacity-90 mix-blend-overlay object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Content */}
        <div className="flex-1 flex flex-col justify-between px-16 text-white py-12">
          {/* Logo Section */}
          <div>
            <ConsultLogo />
          </div>

          {/* Main Content */}
          <div className="max-w-md mt-0">
            <h1 className="text-4xl font-bold mb-6 leading-tight mt-0">
              Sécurité et confidentialité garanties
            </h1>
            <p className="text-gray-200 text-lg leading-relaxed mb-8">
              Vos données et échanges sont protégés. Nous mettons votre confidentialité au cœur de notre service.
            </p>

            {/* Pagination dots */}
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-gray-300">
            © 2025 {process.env.NEXT_PUBLIC_APP_NAME || 'ConsultNow'}. Tous droits réservés.
          </div>
        </div>

        {/* Right side - Auth Modal */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            {/* Optional: Logo in modal header */}

            <div className="text-center mb-6 pt-4">
              <div className="text-sm text-gray-500 mb-2">WELCOME BACK</div>
              <h2 className="text-2xl font-bold text-gray-900">Log In to your Account</h2>
            </div>

            <UserAuthForm />
          </div>
        </div>
      </div>

      {/* Medical professional silhouette - positioned over background */}
      <div className="absolute bottom-0 right-1/3 w-80 h-80 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-white/30 to-transparent rounded-full blur-sm"></div>
      </div>
    </div>
  );
}