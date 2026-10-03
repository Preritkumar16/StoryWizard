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

/**
 * Step 4/5 Multi-Agent Story Generation Schemas
 * Directly matching FastAPI router POST /api/v1/ai/generate-story
 */
export interface GenerateStoryRequestPayload {
  topic: string;
  interests?: string[];
  grade_band?: string; // 'Grade 1-2' | 'Grade 3-4' | 'Grade 5-6'
  learning_objective?: string;
  story_requirements?: Record<string, any>;
}

export interface VocabularyFocusItem {
  word: string;
  definition: string;
  context?: string;
  phonetic?: string;
  tier?: string;
}

export interface GeneratedStoryChapter {
  chapter_number: number;
  title: string;
  content: string | string[];
  vocabulary_focus?: VocabularyFocusItem[];
}

export interface GeneratedBranchingOption {
  choice_id: string;
  label: string;
}

export interface GeneratedStoryData {
  title: string;
  grade_band: string;
  topic: string;
  summary: string;
  chapters: GeneratedStoryChapter[];
  branching_options?: GeneratedBranchingOption[];
  word_count?: number;
}

export interface EducationalValidationData {
  is_aligned: boolean;
  alignment_score: number;
  strengths?: string[];
  educational_summary?: string;
  recommendations?: string[];
}

export interface SafetyValidationData {
  is_safe: boolean;
  safety_score: number;
  flagged_categories?: string[];
  reason?: string;
}

export interface StoryGenerationMetadata {
  user_id?: string;
  topic: string;
  grade_band: string;
  model: string;
  live_api_invoked: boolean;
  execution_time_seconds: number;
}

export interface GenerateStoryResponsePayload {
  status: 'completed' | 'needs_educational_revision' | 'rejected_safety' | 'failed' | string;
  story?: GeneratedStoryData | null;
  educational_validation?: EducationalValidationData | null;
  safety_validation?: SafetyValidationData | null;
  metadata: StoryGenerationMetadata;
  errors?: string[];
}

export const storyService = {
  /**
   * Synthesize a personalized educational story via the Multi-Agent LangGraph workflow.
   * Endpoint: POST /api/v1/ai/generate-story
   * Protected by Step 3 RBAC (student or parent access).
   */
  async generateStory(payload: GenerateStoryRequestPayload): Promise<GenerateStoryResponsePayload> {
    const response = await apiClient.post<GenerateStoryResponsePayload>(
      '/ai/generate-story',
      payload,
      {
        timeout: 120000, // 120s timeout to accommodate multi-agent LLM reasoning pipeline
      }
    );
    return response.data;
  },

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
