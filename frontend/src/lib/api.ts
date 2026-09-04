import axios from 'axios';

// The refresh token itself never touches JS — it's an HttpOnly cookie set
// by the backend (auth.controller.ts) and sent automatically on requests
// to /auth/refresh because of `withCredentials`.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
});

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshing ??= api
        .post('/auth/refresh')
        .then((res) => {
          const token = res.data.accessToken as string;
          setAccessToken(token);
          return token;
        })
        .catch(() => {
          setAccessToken(null);
          return null;
        })
        .finally(() => {
          refreshing = null;
        });

      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
