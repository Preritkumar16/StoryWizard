import apiClient from './api';

export interface TopicHistoryItem {
  id: string;
  topic: string;
  story_title: string;
  date: string;
  duration_minutes: number;
  words_learned: number;
  quiz_score: number;
  lexile: string;
}

export interface LexileTrajectoryPoint {
  month: string;
  score: number;
}

export interface VocabMasteryItem {
  word: string;
  tier: string;
  definition: string;
  status: 'Mastered' | 'Needs Review';
  encounters: number;
}

export interface AgeMismatchNotification {
  id: string;
  timestamp: string;
  topic: string;
  assessed_age: number;
  target_age: number;
  difference_years: number;
  message: string;
  acknowledged: boolean;
}

export interface ChildProgressResponsePayload {
  child_id: string;
  name: string;
  grade: string;
  current_lexile: number;
  minutes_read_today: number;
  max_daily_minutes: number;
  topic_history: TopicHistoryItem[];
  lexile_trajectory: LexileTrajectoryPoint[];
  vocabulary_mastery: VocabMasteryItem[];
  age_mismatch_alerts: AgeMismatchNotification[];
}

export interface ParentalControlsUpdatePayload {
  max_daily_minutes?: number;
  max_grade_band?: 'Grade 1-2' | 'Grade 3-4' | 'Grade 5-6' | string;
  ai_creativity?: 'strict' | 'balanced' | 'creative' | string;
  topic_safety_filter?: boolean;
  alert_on_age_mismatch?: boolean;
}

export interface ParentalControlsResponsePayload {
  status: string;
  message: string;
  controls: {
    max_daily_minutes: number;
    max_grade_band: string;
    ai_creativity: string;
    topic_safety_filter: boolean;
    alert_on_age_mismatch: boolean;
  };
}

export const parentService = {
  /**
   * Retrieves full reading and cognitive progress telemetry for a child.
   * Endpoint: GET /api/v1/parent/child-progress/{child_id}
   */
  async getChildProgress(childId: string = 'student-alex'): Promise<ChildProgressResponsePayload> {
    const response = await apiClient.get<ChildProgressResponsePayload>(
      `/parent/child-progress/${childId}`
    );
    return response.data;
  },

  /**
   * Updates parental supervision limits, daily reading cap, grade ceiling, and filters.
   * Endpoint: PUT /api/v1/parent/controls/{child_id}
   */
  async updateControls(
    childId: string = 'student-alex',
    controls: ParentalControlsUpdatePayload
  ): Promise<ParentalControlsResponsePayload> {
    const response = await apiClient.put<ParentalControlsResponsePayload>(
      `/parent/controls/${childId}`,
      controls
    );
    return response.data;
  },
};

export default parentService;
