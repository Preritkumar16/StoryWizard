import { Story, StoryNode, VocabularyWord, StoryChoice } from '../types';
import { GenerateStoryResponsePayload, GeneratedStoryData } from '../services/storyService';
import { heroImg } from '../data/mockData';

/**
 * Adapter utility that converts raw AI story generation responses from FastAPI
 * (POST /api/v1/ai/generate-story) into the frontend Story schema required by StoryReader.
 *
 * Preserves clean architecture:
 * storyService (API) -> GenerateStoryResponsePayload -> storyAdapter -> Story -> StoryReader
 */
export function adaptGeneratedStoryToReader(
  response: GenerateStoryResponsePayload,
  customId?: string
): Story {
  const storyData: GeneratedStoryData = response.story || {
    title: `The Wonders of ${response.metadata?.topic || 'Discovery'}`,
    grade_band: response.metadata?.grade_band || 'Grade 3-4',
    topic: response.metadata?.topic || 'Science Inquiry',
    summary: 'A personalized educational journey synthesized by AI StoryWizard.',
    chapters: [
      {
        chapter_number: 1,
        title: 'The Journey Begins',
        content: 'Your explorer opened their research journal and started exploring new concepts.',
        vocabulary_focus: [
          {
            word: 'investigation',
            definition: 'A careful examination or search to discover facts.',
            context: 'The investigation revealed exciting new discoveries.',
            phonetic: 'in-ves-tuh-GAY-shun',
            tier: 'Tier 2',
          },
        ],
      },
    ],
    branching_options: [
      { choice_id: 'choice_explore', label: 'Explore the next discovery' },
    ],
    word_count: 320,
  };

  const storyId = customId || `story-ai-${Date.now()}`;
  const topicName = storyData.topic || response.metadata?.topic || 'Exploration';
  const gradeLevel = storyData.grade_band || response.metadata?.grade_band || 'Grade 3-4';

  const ageRange = gradeLevel.includes('1-2')
    ? 'Ages 6–8'
    : gradeLevel.includes('5-6')
    ? 'Ages 10–12'
    : 'Ages 8–10';

  const lexileLevel = gradeLevel.includes('1-2')
    ? '420L'
    : gradeLevel.includes('5-6')
    ? '780L'
    : '580L';

  const estimatedMinutes = Math.max(
    3,
    Math.ceil((storyData.word_count || 360) / 75)
  );

  const nodes: Record<string, StoryNode> = {};
  const chapters = storyData.chapters && storyData.chapters.length > 0
    ? storyData.chapters
    : [
        {
          chapter_number: 1,
          title: 'The Expedition Begins',
          content: storyData.summary,
          vocabulary_focus: [],
        },
      ];

  const totalChapters = chapters.length;

  chapters.forEach((ch, idx) => {
    const chNum = ch.chapter_number || idx + 1;
    const nodeId = `node-ch-${chNum}`;
    const nextNodeId = `node-ch-${chNum + 1}`;
    const isEnding = idx === totalChapters - 1;

    // Normalize content into paragraph array
    let contentParagraphs: string[] = [];
    if (typeof ch.content === 'string') {
      contentParagraphs = ch.content
        .split('\n\n')
        .map(p => p.trim())
        .filter(Boolean);
      if (contentParagraphs.length === 0 && ch.content.trim()) {
        contentParagraphs = [ch.content.trim()];
      }
    } else if (Array.isArray(ch.content)) {
      contentParagraphs = ch.content.map((p: string) => String(p).trim()).filter(Boolean);
    } else {
      contentParagraphs = ['Once upon a time in a vibrant world of imagination...'];
    }

    // Map vocabulary focus items
    const vocabulary: VocabularyWord[] = (ch.vocabulary_focus || []).map(v => ({
      word: v.word,
      phonetic: v.phonetic || v.word.toLowerCase(),
      definition: v.definition,
      example: v.context || `Understanding "${v.word}" unlocks deeper knowledge in ${topicName}.`,
      mastered: false,
      tier: v.tier || 'Tier 2',
    }));

    // Construct interactive branching choices
    const choices: StoryChoice[] = [];
    if (!isEnding) {
      // If branching options were provided by the model and this is chapter 2 (decision point)
      if (idx === 1 && storyData.branching_options && storyData.branching_options.length > 0) {
        storyData.branching_options.forEach((opt, oIdx) => {
          choices.push({
            id: opt.choice_id || `branch-${oIdx}`,
            text: opt.label,
            nextNodeId,
            themeTag: oIdx === 0 ? 'Empirical Inquiry' : 'Creative Application',
          });
        });
      } else {
        // Linear chapter progression
        choices.push({
          id: `choice-advance-${chNum}`,
          text: `Continue into Chapter ${chNum + 1}`,
          nextNodeId,
          themeTag: 'Story Progression',
        });
      }
    }

    // Chapter title formatting
    const rawTitle = ch.title || `Chapter ${chNum}`;
    const formattedTitle = rawTitle.toLowerCase().startsWith('chapter')
      ? rawTitle
      : `Chapter ${chNum}: ${rawTitle}`;

    nodes[nodeId] = {
      id: nodeId,
      title: formattedTitle,
      content: contentParagraphs,
      illustration: heroImg,
      choices,
      vocabulary,
      isEnding,
    };
  });

  const initialNodeId = `node-ch-${chapters[0]?.chapter_number || 1}`;

  return {
    id: storyId,
    title: storyData.title || `The Secrets of ${topicName}`,
    subtitle: storyData.summary || `An interactive educational quest exploring ${topicName}.`,
    coverImage: heroImg,
    genre: `${topicName} Quest`,
    ageRange,
    gradeLevel,
    lexileLevel,
    estimatedMinutes,
    tags: [
      topicName,
      gradeLevel,
      'LangGraph Multi-Agent',
      'CCSS Aligned',
      response.metadata?.live_api_invoked ? 'Live Groq' : 'Offline Verified',
    ],
    summary: storyData.summary,
    initialNodeId,
    nodes,
    topic: topicName,
    createdAt: 'Just now',
  };
}

export default adaptGeneratedStoryToReader;
