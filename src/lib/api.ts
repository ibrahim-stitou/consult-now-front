import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import { auth } from '@/lib/auth';

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_USE_MOCK === 'true'
      ? 'http://localhost:3001'
      : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const getAuthToken = async (isServerSide: boolean): Promise<string | null> => {
  try {
    if (isServerSide) {
      const session = await auth();
      return session?.accessToken || null;
    } else {
      const session = await getSession();
      return session?.accessToken || null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token d\'authentification:', error);
    return null;
  }
};

const isServerSide = (): boolean => typeof window === 'undefined';

const getLocale = (): string => {
  if (isServerSide()) {
    return 'fr';
  }

  return (
    localStorage.getItem('locale') ||
    navigator.language.split('-')[0] ||
    'fr'
  );
};

let isRefreshingToken = false;
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

async function refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    if (isRefreshingToken && refreshPromise) {
      return refreshPromise;
    }
    isRefreshingToken = true;
    refreshPromise = (async () => {
      const session = await getSession();
      if (!session?.refreshToken) {
        console.error('Aucun token de rafraîchissement disponible');
        return null;
      }
      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_USE_MOCK === 'true'
            ? 'http://localhost:3001'
            : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8002/api/v1'
        }/refresh-token`,
        { refresh_token: session.refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 5000,
        }
      );

      const accessToken = response.data?.access_token;
      const refreshToken = response.data?.refresh_token;

      if (!accessToken) {
        console.error('Réponse de rafraîchissement invalide:', response.data);
        return null;
      }
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
        }),
      });

      return {
        accessToken,
        refreshToken,
      };
    })();

    const result = await refreshPromise;
    isRefreshingToken = false;
    refreshPromise = null;
    return result;
  } catch (error) {
    isRefreshingToken = false;
    refreshPromise = null;
    console.error('Échec du rafraîchissement du token:', error);
    return null;
  }
}

apiClient.interceptors.request.use(
  async (config: any) => {
    const isAuthEndpoint =
      config.url?.includes('/login') || config.url?.includes('/refresh-token');

    if (!isAuthEndpoint) {
      const token = await getAuthToken(isServerSide());
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const locale = getLocale();
    if (config.headers) {
      config.headers['Accept-Language'] = locale;
    }
    config._requestTimestamp = Date.now();

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any & { _retry?: boolean };
    if (!originalRequest) {
      return Promise.reject(error);
    }
    const duration = originalRequest._requestTimestamp
      ? `${Date.now() - originalRequest._requestTimestamp}ms`
      : 'inconnu';

    if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
      console.error(`Erreur du point d'authentification (${duration}):`, error.message, error.response?.data);
      return Promise.reject(error);
    }

    if (error.response?.status === 500) {
      console.error(`Erreur serveur (${duration}):`, error.response?.data || error.message);
      return Promise.reject(new Error('Une erreur interne est survenue. Veuillez réessayer plus tard.'));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log(`Requête échouée avec 401 (${duration}), tentative de rafraîchissement du token`);

      originalRequest._retry = true;

      try {
        const tokens = await refreshToken();

        if (!tokens) {
          if (!isServerSide() && !window.location.pathname.includes('/login')) {
            console.log('Échec du rafraîchissement du token, redirection vers la page de connexion');
            window.location.href = '/login?reason=session_expired';
            return Promise.reject(new Error('Session expirée'));
          }
          return Promise.reject(error);
        }
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Échec de la gestion de l\'authentification:', refreshError);
        if (!isServerSide() && !window.location.pathname.includes('/')) {
          window.location.href = '/?reason=refresh_failed';
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;