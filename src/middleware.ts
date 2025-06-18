import { auth } from './lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/auth/login', '/api/auth', '/unauthorized', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    if (pathname === '/auth/login' && session && !session.error) {
      const userRole = session.user?.role?.code;

      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/overview', request.url));
      } else if (userRole === 'medecin') {
        return NextResponse.redirect(new URL('/medecin', request.url));
      } else if (userRole === 'patient') {
        return NextResponse.redirect(new URL('/patient', request.url));
      }
    }

    return NextResponse.next();
  }

  if (!session || session.error === 'TokenExpired' || session.error === 'RefreshAccessTokenError' || session.error === 'SessionExpired') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const userRole = session.user?.role?.code;
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/medecin') && userRole !== 'medecin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/patient') && userRole !== 'patient') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  const commonRoutes = ['/dashboard', '/profile', '/settings'];
  const isCommonRoute = commonRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isCommonRoute && !['admin', 'medecin', 'patient'].includes(userRole || '')) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};