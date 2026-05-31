import axios, { AxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const SERVER_URL = API_URL.replace(/\/api$/, '');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('goldenshifa_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function apiFetch<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await api.request<T>({ url: path, ...options });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Erreur API.');
    }

    throw error;
  }
}

export function assetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;
}

export function money(value: string | number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value));
}
