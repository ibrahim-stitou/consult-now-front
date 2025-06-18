import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

interface User {
  id: string;
  name: string;
  email?: string;
  full_name?: string;
  accessToken: string;
  refreshToken: string;
  role: {
    id: number;
    name: string;
    code: string;
    description: string;
  };
}

declare module 'next-auth' {
  interface Session {
    error?: string;
    accessToken: string;
    refreshToken?: string;
    user: {
      role?: {
        id: number;
        name: string;
        code: string;
        description: string;
      };
      name?: string | null;
      full_name?: string;
      email?: string | null;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    //@ts-ignore
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: 'RefreshAccessTokenError' | 'TokenExpired' | 'SessionExpired';
    //@ts-ignore
    role?: {
      id: number;
      name: string;
      code: string;
      description: string;
    };
    refreshAttempt?: number;
    lastRefreshTime?: number;
  }
}

// Global state for refresh locking
let isRefreshing = false;

export const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const { data } = await apiClient.post(apiRoutes.auth.login, {
            email: credentials?.email,
            password: credentials?.password
          });

          if (!data.access_token) {
            console.error('Login failed - no access token received');
            return null;
          }

          // Récupération des informations de rôle
          const role = data.user?.role || {
            id: data.user?.role_id || 1,
            name: 'Unknown',
            code: 'unknown',
            description: 'No role description available'
          };

          return {
            id: data.user?.id.toString(),
            full_name: data.user?.full_name,
            name: data.user?.full_name,
            email: data.user?.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            role: {
              id: role.id,
              name: role.name,
              code: role.code,
              description: role.description
            }
          };
        } catch (error: any) {
          console.error('Authentication error:', error.response?.data || error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        return {
          ...token,
          accessToken: (user as User).accessToken,
          refreshToken: (user as User).refreshToken,
          role: user.role,
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes expiration
          refreshAttempt: 0,
          lastRefreshTime: 0
        };
      }

      // Handle session updates (e.g., from client-side updates)
      if (trigger === "update" && session?.accessToken) {
        return { ...token, ...session };
      }

      // Don't refresh if terminal error exists
      if (token.error) return token;

      // Check if token needs refresh (within 5 minutes of expiration)
      const shouldRefresh = token.expiresAt && Date.now() > token.expiresAt - 5 * 60 * 1000;

      if (shouldRefresh && token.refreshToken && !isRefreshing) {
        try {
          isRefreshing = true;

          const response = await apiClient.post(apiRoutes.auth.refreshToken, {
            refresh_token: token.refreshToken
          });

          const { data } = response;

          if (!data.access_token) {
            throw new Error('Invalid refresh response');
          }

          return {
            ...token,
            accessToken: data.access_token,
            refreshToken: data.refresh_token || token.refreshToken,
            expiresAt: Date.now() + 30 * 60 * 1000, // New 30 minute window
            refreshAttempt: 0,
            lastRefreshTime: Date.now(),
            error: undefined
          };
        } catch (error) {
          console.error('Refresh token failed:', error);
          return {
            ...token,
            error: 'RefreshAccessTokenError'
          };
        } finally {
          isRefreshing = false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.error) session.error = token.error;
      if (token.accessToken) session.accessToken = token.accessToken;
      if (token.refreshToken) session.refreshToken = token.refreshToken;
      if (token.role) session.user.role = token.role;

      return session;
    }
  },
  events: {
    //@ts-ignore
    async signOut({ token }) {
      try {
        if (token?.accessToken) {
          await apiClient.post(apiRoutes.auth.logout, null, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`
            }
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes (matches token expiration)
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;