import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

/**
 * AI StoryWizard Axios API Client
 * Configured with environment-based base URL, JWT authorization header interceptor,
 * and child-safe centralized error handling.
 */

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys for JWT tokens
export const TOKEN_STORAGE_KEY = 'ai_storywizard_access_token';
export const USER_STORAGE_KEY = 'ai_storywizard_user';

/**
 * Request Interceptor: Attach JWT Bearer Token if available
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token =
        localStorage.getItem(TOKEN_STORAGE_KEY) ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // In private browsing or storage disabled environments, gracefully continue
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Centralized, child-safe error handling
 */
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  (error: AxiosError<{ detail?: string | Array<{ msg?: string; loc?: string[] }> }>) => {
    // If request was cancelled intentionally, do nothing
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    let userFriendlyMessage = 'Something went wrong while connecting to the StoryWizard realm.';

    if (!error.response) {
      // Network failure / server unreachable
      userFriendlyMessage = 'Cannot connect to the server right now. Running in local explorer mode.';
      toast.error(userFriendlyMessage, { id: 'network-error' });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Extract detail string if provided by FastAPI HTTPException
    let backendDetail = '';
    if (typeof data?.detail === 'string') {
      backendDetail = data.detail;
    } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
      backendDetail = data.detail[0].msg;
    }

    switch (status) {
      case 401:
        userFriendlyMessage = backendDetail || 'Incorrect PIN or password. Please try again.';
        toast.error(userFriendlyMessage, { id: 'auth-error' });
        break;
      case 403:
        userFriendlyMessage =
          backendDetail || 'This section requires parent permission or educator access.';
        toast.error(userFriendlyMessage, { id: 'forbidden-error' });
        break;
      case 404:
        userFriendlyMessage =
          backendDetail || 'The requested story chapter or profile could not be found.';
        toast.error(userFriendlyMessage, { id: 'not-found-error' });
        break;
      case 422:
        userFriendlyMessage =
          backendDetail || 'Please check your inputs and try exploring another topic!';
        toast.error(userFriendlyMessage, { id: 'validation-error' });
        break;
      case 500:
      default:
        userFriendlyMessage =
          backendDetail || 'Our storytelling wizards had a brief hiccup. Please try again shortly.';
        toast.error(userFriendlyMessage, { id: 'server-error' });
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
