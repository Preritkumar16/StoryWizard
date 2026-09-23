import apiClient from './api';

export interface QuizSubmissionPayload {
  story_id: string;
  node_id: string;
  question_id: string;
  selected_index: number;
}

export interface QuizSubmissionResult {
  correct: boolean;
  correct_index: number;
  explanation: string;
  xp_awarded: number;
  ccss_standard: string;
}

export const quizService = {
  /**
   * Submit an answer to a CCSS comprehension quiz question.
   * Endpoint: POST /api/v1/quiz/submit (prepared for persistence)
   */
  async submitAnswer(payload: QuizSubmissionPayload): Promise<QuizSubmissionResult> {
    const response = await apiClient.post<QuizSubmissionResult>('/quiz/submit', payload);
    return response.data;
  },

  /**
   * Fetch quiz results or question bank for a story
   */
  async getQuizForNode(storyId: string, nodeId: string): Promise<any> {
    const response = await apiClient.get(`/stories/${storyId}/nodes/${nodeId}/quiz`);
    return response.data;
  },
};

export default quizService;
