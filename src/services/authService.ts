import apiClient, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './api';

export interface LoginRequestPayload {
  username_or_email: string;
  password_or_pin: string;
  role: 'student' | 'parent';
}

export interface RolePermissions {
  can_explore_topics: boolean;
  can_adjust_safety_limits: boolean;
  can_view_analytics: boolean;
  can_access_inspector: boolean;
  can_record_audio: boolean;
}

export interface TokenResponsePayload {
  access_token: string;
  token_type: string;
  role: 'student' | 'parent';
  user_id: string;
  name: string;
  permissions: RolePermissions;
}

export const authService = {
  /**
   * Authenticate student via 4-digit PIN or parent via email/password.
   * Endpoint: POST /api/v1/auth/login
   */
  async login(payload: LoginRequestPayload): Promise<TokenResponsePayload> {
    const response = await apiClient.post<TokenResponsePayload>('/auth/login', payload);
    const data = response.data;
    if (data.access_token) {
      authService.setStoredToken(data.access_token);
      authService.setStoredUser(data);
    }
    return data;
  },

  /**
   * Clears stored JWT token and user profile
   */
  logout(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
    } catch {
      // Ignore in private storage contexts
    }
  },

  /**
   * Retrieve active JWT token if available
   */
  getStoredToken(): string | null {
    try {
      return (
        localStorage.getItem(TOKEN_STORAGE_KEY) ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token')
      );
    } catch {
      return null;
    }
  },

  /**
   * Save JWT token to storage
   */
  setStoredToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem('access_token', token);
    } catch {
      // Ignore
    }
  },

  /**
   * Retrieve stored user profile metadata
   */
  getStoredUser(): TokenResponsePayload | null {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Save user profile metadata to storage
   */
  setStoredUser(user: TokenResponsePayload): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore
    }
  },
};

export default authService;
