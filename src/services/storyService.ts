import apiClient from './api';

export interface ExploreTopicRequestPayload {
  topic: string;
  child_id?: string;
  target_grade_band?: string;
  creativity_mode?: string;
}

export interface StoryChoiceItem {
  id: string;
  text: string;
  next_node_id: string;
  theme_tag?: string;
}

export interface ChapterNodeItem {
  id: string;
  title: string;
  content: string[];
  choices: StoryChoiceItem[];
  is_ending: boolean;
}

export interface BackendVocabularyToken {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  tier: string;
  mastered: boolean;
}

export interface BackendCCSSQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  xp_reward: number;
  ccss_standard: string;
}

export interface BackendAgeMismatchAlert {
  is_age_mismatch: boolean;
  topic: string;
  assessed_age: number;
  target_age: number;
  years_above: number;
  message: string;
  severity: string;
}

export interface ExploreTopicResponsePayload {
  story_id: string;
  title: string;
  subtitle: string;
  cover_image_url: string;
  topic: string;
  lexile_level: string;
  grade_level: string;
  estimated_minutes: number;
  chapters: Record<string, ChapterNodeItem>;
  vocabulary: BackendVocabularyToken[];
  quiz: BackendCCSSQuizQuestion;
  age_mismatch_alert?: BackendAgeMismatchAlert | null;
}

export const storyService = {
  /**
   * Synthesize a personalized interactive story adventure from a topic inquiry.
   * Endpoint: POST /api/v1/stories/explore-topic
   */
  async exploreTopic(payload: ExploreTopicRequestPayload): Promise<ExploreTopicResponsePayload> {
    const response = await apiClient.post<ExploreTopicResponsePayload>(
      '/stories/explore-topic',
      payload
    );
    return response.data;
  },

  /**
   * Fetch a story by ID (for future persistence integration)
   */
  async getStoryById(storyId: string): Promise<ExploreTopicResponsePayload | null> {
    const response = await apiClient.get<ExploreTopicResponsePayload>(`/stories/${storyId}`);
    return response.data;
  },
};

export default storyService;
