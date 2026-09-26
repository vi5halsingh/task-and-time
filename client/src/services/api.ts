import axios, { AxiosError } from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';
const cleanBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data;
    if (errorData?.error?.message) {
      return errorData.error.message;
    }
    if (errorData?.message) {
      return errorData.message;
    }
    if (error.response?.status === 401) {
      return 'Authentication required. Please log in.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 409) {
      return 'A conflict occurred. The resource may already exist.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to the server. Please check your internet or server status.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
