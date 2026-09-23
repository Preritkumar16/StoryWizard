import apiClient from './api';

export interface UserPreferencesPayload {
  dyslexicFont?: boolean;
  fontSize?: 'normal' | 'large' | 'xlarge';
  highContrast?: boolean;
  voiceId?: string;
  playbackSpeed?: number;
  ambientSound?: string;
  ambientVolume?: number;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  role: 'student' | 'parent';
  gradeLevel?: string;
  xp?: number;
  level?: number;
  streakDays?: number;
  minutesReadToday?: number;
  preferences?: UserPreferencesPayload;
}

export const userService = {
  /**
   * Retrieve current user profile
   */
  async getProfile(userId?: string): Promise<UserProfileResponse> {
    const endpoint = userId ? `/users/${userId}` : '/users/me';
    const response = await apiClient.get<UserProfileResponse>(endpoint);
    return response.data;
  },

  /**
   * Update student reader preferences (dyslexia font, narration speed, etc.)
   */
  async updatePreferences(preferences: UserPreferencesPayload): Promise<UserProfileResponse> {
    const response = await apiClient.patch<UserProfileResponse>('/users/me/preferences', preferences);
    return response.data;
  },
};

export default userService;
