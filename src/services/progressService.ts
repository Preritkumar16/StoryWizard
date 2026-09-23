import apiClient from './api';

export interface ReadingSessionPayload {
  student_id: string;
  story_id: string;
  story_title: string;
  node_id: string;
  minutes_read: number;
  words_mastered: string[];
  quiz_score?: number;
}

export interface ReadingSessionResponse {
  message: string;
  session_id?: string;
  xp_earned?: number;
}

export const progressService = {
  /**
   * Log reading time, story nodes visited, and vocabulary mastered.
   * Endpoint: POST /api/v1/analytics/reading-session
   */
  async logReadingSession(payload: ReadingSessionPayload): Promise<ReadingSessionResponse> {
    const response = await apiClient.post<ReadingSessionResponse>(
      '/analytics/reading-session',
      payload
    );
    return response.data;
  },

  /**
   * Fetch classroom or student overview metrics
   */
  async getClassroomMetrics(): Promise<any> {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
  },
};

export default progressService;
