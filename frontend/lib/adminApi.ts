import Cookies from 'js-cookie';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/** Erreur renvoyée par l'API, avec le message lisible du backend quand il existe. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Appel à l'API avec le jeton de l'administrateur connecté.
 * Sans jeton ou si la session a expiré, renvoie vers la page de connexion.
 */
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = Cookies.get('token');
  if (!token) {
    window.location.href = '/login';
    throw new ApiError(401, 'Session expirée');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API}${path}`, { ...init, headers });

  if (res.status === 401) {
    Cookies.remove('token');
    window.location.href = '/login';
    throw new ApiError(401, 'Session expirée');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || data?.error || 'Une erreur est survenue';
    throw new ApiError(res.status, message);
  }
  return data as T;
}
