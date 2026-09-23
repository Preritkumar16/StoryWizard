import {
  Story,
  UserProfile,
  ParentalControls,
  AgeMismatchAlert,
  ChildTopicHistory,
  LearningAnalytics,
  VoicePreset
} from '../types';

import heroImg from '../assets/images/hero_storybook_adventure_1790130760499.jpg';
import crystalCaveImg from '../assets/images/story_crystal_cave_1790130777502.jpg';
import cosmicVoyageImg from '../assets/images/story_cosmic_voyage_1790130791358.jpg';
import leoAvatarImg from '../assets/images/avatar_explorer_leo_1790130804622.jpg';

export { heroImg, crystalCaveImg, cosmicVoyageImg, leoAvatarImg };

export const INITIAL_STUDENT: UserProfile = {
  id: 'student-alex',
  name: 'Alex Chen',
  role: 'student',
  avatar: leoAvatarImg,
  gradeLevel: '3rd Grade',
  xp: 1650,
  level: 6,
  streakDays: 9,
  minutesReadToday: 22,
  badges: [
    {
      id: 'badge-1',
      name: 'Vocabulary Explorer',
      description: 'Inspected and mastered 25 Tier-2 academic words in the story reader',
      icon: 'sparkles',
      unlockedAt: '2 days ago',
      category: 'reading',
    },
    {
      id: 'badge-2',
      name: 'Cosmic Navigator',
      description: 'Finished the Starlight Compass quest with 100% CCSS quiz accuracy',
      icon: 'compass',
      unlockedAt: 'Yesterday',
      category: 'quiz',
    },
    {
      id: 'badge-3',
      name: 'Pathfinder',
      description: 'Explored 12 alternative story decision branches',
      icon: 'map',
      unlockedAt: 'Last week',
      category: 'explorer',
    },
    {
      id: 'badge-4',
      name: 'Curious Alchemist',
      description: 'Explored topics in both astrophysics and marine biology',
      icon: 'wand2',
      unlockedAt: '3 days ago',
      category: 'creativity',
    },
  ],
  preferences: {
    dyslexicFont: false,
    fontSize: 'normal',
    highContrast: false,
    voiceId: 'grandpa-oak',
    playbackSpeed: 1.0,
    ambientSound: 'enchanted-forest',
    ambientVolume: 0.3,
  },
};

export const INITIAL_PARENT: UserProfile = {
  id: 'parent-sarah',
  name: 'Sarah Chen (Parent)',
  role: 'parent',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  gradeLevel: 'Supervising Alex Chen (3rd Grade)',
  xp: 4200,
  level: 12,
  streakDays: 24,
  minutesReadToday: 35,
  badges: [],
  preferences: {
    dyslexicFont: false,
    fontSize: 'normal',
    highContrast: false,
    voiceId: 'grandpa-oak',
    playbackSpeed: 1.0,
    ambientSound: 'none',
    ambientVolume: 0.2,
  },
};

export const INITIAL_PARENTAL_CONTROLS: ParentalControls = {
  maxDailyMinutes: 30,
  maxGradeBand: 'Grade 3-4',
  aiCreativity: 'balanced',
  topicSafetyFilter: true,
  alertOnAgeMismatch: true,
};

export const INITIAL_AGE_MISMATCH_ALERTS: AgeMismatchAlert[] = [
  {
    id: 'alert-1',
    timestamp: 'Today at 4:15 PM',
    topic: 'Quantum Computing & Qubits',
    studentName: 'Alex',
    assessedAge: 12,
    targetAge: 8,
    differenceYears: 4,
    message: "Alex explored 'Quantum Computing' – rated 4 years above configured Grade 3-4 target band.",
    severity: 'warning',
    acknowledged: false,
  },
  {
    id: 'alert-2',
    timestamp: 'Yesterday at 5:40 PM',
    topic: 'Advanced CRISPR Gene Editing',
    studentName: 'Alex',
    assessedAge: 13,
    targetAge: 8,
    differenceYears: 5,
    message: "Alex generated a story about 'Advanced CRISPR Gene Editing' – rated 5 years above target age.",
    severity: 'warning',
    acknowledged: true,
  },
];

export const INITIAL_CHILD_TOPIC_HISTORY: ChildTopicHistory[] = [
  {
    id: 'hist-1',
    topic: 'Subterranean Crystal Geodes',
    storyTitle: 'The Mystery of the Crystal Cavern',
    date: 'Today, 3:45 PM',
    durationMinutes: 14,
    wordsLearned: 3,
    quizScore: 100,
    lexile: '520L',
  },
  {
    id: 'hist-2',
    topic: 'Planetary Gravitational Slingshots',
    storyTitle: 'Nova and the Starlight Compass',
    date: 'Yesterday, 4:10 PM',
    durationMinutes: 18,
    wordsLearned: 4,
    quizScore: 90,
    lexile: '640L',
  },
  {
    id: 'hist-3',
    topic: 'Bioluminescent Deep Ocean Trenches',
    storyTitle: 'The Secret of the Abyssal Coral',
    date: 'Sep 20, 2:30 PM',
    durationMinutes: 12,
    wordsLearned: 3,
    quizScore: 100,
    lexile: '490L',
  },
  {
    id: 'hist-4',
    topic: 'Ancient Mesopotamian Irrigation',
    storyTitle: 'The River Builders of Euphrates',
    date: 'Sep 18, 5:15 PM',
    durationMinutes: 16,
    wordsLearned: 5,
    quizScore: 85,
    lexile: '550L',
  },
];

export const INITIAL_LEARNING_ANALYTICS: LearningAnalytics = {
  lexileTrajectory: [
    { month: 'May', score: 410 },
    { month: 'Jun', score: 440 },
    { month: 'Jul', score: 475 },
    { month: 'Aug', score: 510 },
    { month: 'Sep', score: 545 },
  ],
  oralFluencyWPM: [
    { week: 'W1', wpm: 84 },
    { week: 'W2', wpm: 92 },
    { week: 'W3', wpm: 99 },
    { week: 'W4', wpm: 108 },
  ],
  ccssMastery: [
    { standard: 'RI.3.1', label: 'Key Details & Textual Evidence', score: 94, status: 'Exceeding' },
    { standard: 'RI.3.2', label: 'Main Idea & Paragraph Recount', score: 88, status: 'Proficient' },
    { standard: 'RI.3.4', label: 'Tier-2 Academic Vocabulary in Context', score: 92, status: 'Exceeding' },
    { standard: 'RL.3.3', label: 'Character Actions & Plot Branching', score: 90, status: 'Proficient' },
    { standard: 'RF.3.4', label: 'Fluency Pacing & Punctuation Rhythm', score: 85, status: 'Proficient' },
  ],
  vocabularyRetention: [
    { word: 'luminescence', tier: 'Tier 2', definition: 'Light produced without boiling heat, like fireflies', status: 'Mastered', encounters: 6 },
    { word: 'subterranean', tier: 'Tier 2', definition: 'Situated or occurring beneath the earth surface', status: 'Mastered', encounters: 5 },
    { word: 'transparent', tier: 'Tier 2', definition: 'Allowing light to pass through distinctly', status: 'Mastered', encounters: 7 },
    { word: 'harmonic', tier: 'Tier 2', definition: 'Relating to pleasant musical harmony and frequencies', status: 'Mastered', encounters: 4 },
    { word: 'periapsis', tier: 'Tier 3', definition: 'The point in an orbit closest to the central body', status: 'Needs Review', encounters: 2 },
    { word: 'trajectory', tier: 'Tier 2', definition: 'The curved path an object follows through space', status: 'Mastered', encounters: 5 },
    { word: 'refraction', tier: 'Tier 3', definition: 'Bending of light when passing into new mediums', status: 'Needs Review', encounters: 3 },
  ],
};

export const VOICE_LIBRARY_PRESETS: VoicePreset[] = [
  {
    id: 'grandpa-oak',
    name: 'Grandpa Oak',
    subtitle: 'Warm, Patient & Classic',
    description: 'A soothing grandfatherly timbre with deliberate cadence, ideal for bedtime and calm focus.',
    sampleText: 'Come sit beside the warm hearth, little explorer. Let us listen to what the ancient stones remember.',
    pitch: 0.85,
    rate: 0.95,
    avatarIcon: 'TreePine',
  },
  {
    id: 'pixie-joy',
    name: 'Pixie Joy',
    subtitle: 'Playful, High-Energy & Whimsical',
    description: 'A bubbly, melodic tone with vibrant inflection that keeps younger readers smiling.',
    sampleText: 'Hooray! Look at all those glittering crystals! Which sparkling tunnel shall we fly into first?',
    pitch: 1.25,
    rate: 1.05,
    avatarIcon: 'Sparkles',
  },
  {
    id: 'dr-robot',
    name: 'Dr. Robot',
    subtitle: 'Crisp, Inquisitive & Scientific',
    description: 'An upbeat synth-cadence that emphasizes scientific inquiry, vocabulary phonetics, and logic.',
    sampleText: 'Diagnostic report: atmospheric pressure nominal. Calculating optimal trajectory toward the star nebula.',
    pitch: 1.15,
    rate: 1.0,
    avatarIcon: 'Bot',
  },
  {
    id: 'the-chronicler',
    name: 'The Chronicler',
    subtitle: 'Epic, Dramatic & Narrative',
    description: 'A theatrical storyteller cadence with rich dynamic pauses that brings bold quests to life.',
    sampleText: 'Shadows lengthened across the mountain peaks as our hero took the decisive first step across the chasm.',
    pitch: 0.95,
    rate: 1.0,
    avatarIcon: 'Scroll',
  },
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-crystal-cave',
    title: 'The Mystery of the Crystal Cavern',
    subtitle: 'An underground quest powered by curiosity and courage',
    coverImage: crystalCaveImg,
    genre: 'Earth Science & Geology',
    ageRange: 'Ages 7–10',
    gradeLevel: 'Grade 3-4',
    lexileLevel: '520L',
    estimatedMinutes: 8,
    tags: ['Geology', 'Teamwork', 'Observation'],
    summary: 'Join Maya and Pip the glowing fox as they venture deep into the Whispering Mountain to discover why subterranean crystals chime at night.',
    initialNodeId: 'node-start',
    nodes: {
      'node-start': {
        id: 'node-start',
        title: 'Chapter 1: The Mountain That Whispered',
        illustration: crystalCaveImg,
        content: [
          'Maya adjusted the brass dial of her compass. Beside her, Pip the fox gave a soft yip, his bushy tail glowing with a warm, amber luminescence.',
          'Before them loomed the entrance of the Whispering Mountain. It was not howling wind that made the stone echo; it was a rhythmic, crystalline melody that rose from deep subterranean caverns.',
          'Maya reached the first great fork in the tunnels. To the left, a gentle turquoise glow illuminated a path covered in soft moss. To the right, a staircase carved from obsidian led down toward a subterranean river that sang like liquid glass.'
        ],
        choices: [
          {
            id: 'choice-moss-path',
            text: 'Take the Mossy Tunnel toward the turquoise glow',
            nextNodeId: 'node-moss-path',
            themeTag: 'Observation',
          },
          {
            id: 'choice-chime-river',
            text: 'Descend the obsidian stairs toward the singing river',
            nextNodeId: 'node-chime-river',
            themeTag: 'Bravery',
          },
        ],
        vocabulary: [
          {
            word: 'luminescence',
            phonetic: 'loo-muh-NES-uhns',
            definition: 'Light produced without boiling heat, like the natural glow of fireflies or glowing rocks.',
            example: 'Pip’s tail shone with a gentle golden luminescence in the dark tunnel.',
            mastered: true,
            tier: 'Tier 2',
          },
          {
            word: 'subterranean',
            phonetic: 'sub-tuh-RAY-nee-uhn',
            definition: 'Situated, occurring, or living beneath the earth’s surface; underground.',
            example: 'The subterranean cavern stayed cool and quiet beneath the noisy town.',
            mastered: true,
            tier: 'Tier 2',
          },
          {
            word: 'obsidian',
            phonetic: 'ob-SID-ee-uhn',
            definition: 'A dark, glass-like volcanic rock formed by the rapid cooling of lava.',
            example: 'The ancient stone stairs were carved smoothly from dark obsidian.',
            mastered: true,
            tier: 'Tier 3',
          },
        ],
        quiz: {
          id: 'quiz-node-start',
          question: 'According to textual evidence, what caused the whispering sound inside the mountain?',
          options: [
            'A howling mountain wind blowing pine needles',
            'A rhythmic crystalline melody echoing from deep caverns',
            'Wild subterranean bats fluttering near the ceiling',
            'Pip the fox practicing his musical whistle'
          ],
          correctIndex: 1,
          explanation: 'The text specifically notes: "It was not howling wind that made the stone echo; it was a rhythmic, crystalline melody that rose from deep subterranean caverns."',
          xpReward: 50,
          ccssStandard: 'CCSS.ELA-LITERACY.RI.3.1',
        },
      },
      'node-moss-path': {
        id: 'node-moss-path',
        title: 'Chapter 2: The Bioluminescent Grove',
        illustration: crystalCaveImg,
        content: [
          'Maya stepped onto the emerald moss. It felt as soft as a woolen blanket under her boots. Overhead, clusters of glowing mushrooms pulsed in synchrony, casting teal ripples against the stone walls.',
          'Pip sniffed a cluster of bell-shaped blossoms that chimed whenever a breeze drifted past. In the center of the grove rested an ancient stone pedestal bearing three intricate geometric dial wheels.',
          'An engraved inscription read: "To unlock the crystal heart, balance the colors of growth and water." Maya studied the dials carefully.'
        ],
        choices: [
          {
            id: 'choice-solve-puzzle',
            text: 'Align the dials by matching green chlorophyll and cyan river runes',
            nextNodeId: 'node-heart-chamber',
            themeTag: 'Logic',
          },
        ],
        vocabulary: [
          {
            word: 'bioluminescent',
            phonetic: 'bye-oh-loo-mih-NES-ent',
            definition: 'Living organisms that produce and emit their own natural light.',
            example: 'The grove was filled with bioluminescent fungi that lit the cavern.',
            mastered: false,
            tier: 'Tier 3',
          },
          {
            word: 'inscription',
            phonetic: 'in-SKRIP-shun',
            definition: 'Words, symbols, or designs carved or engraved into a hard surface.',
            example: 'The inscription on the pedestal gave clues to the ancient riddle.',
            mastered: true,
            tier: 'Tier 2',
          },
        ],
        quiz: {
          id: 'quiz-node-moss',
          question: 'What did the inscription on the pedestal advise Maya to do?',
          options: [
            'Turn back before the mountain wakes',
            'Balance the colors of growth and water',
            'Feed Pip a wild blue mushroom',
            'Run as quickly as possible down the corridor'
          ],
          correctIndex: 1,
          explanation: 'The pedestal explicitly instructed: "To unlock the crystal heart, balance the colors of growth and water."',
          xpReward: 50,
          ccssStandard: 'CCSS.ELA-LITERACY.RI.3.1',
        },
      },
      'node-chime-river': {
        id: 'node-chime-river',
        title: 'Chapter 2: The Glasswater Torrent',
        illustration: crystalCaveImg,
        content: [
          'Maya carefully navigated the polished obsidian steps until her boots touched crystalline pebbles along the riverbank. The water was so transparent it looked like liquid prism.',
          'Floating upon the surface was an ornate cedar boat with no oars, but a glowing steering compass in the bow that pulsed in harmony with the cavern chimes.',
          'Pip nudged Maya’s hand and leaped into the boat with eager confidence. As she stepped aboard, ripples in the water began to illuminate ancient symbols carved into the riverbed.'
        ],
        choices: [
          {
            id: 'choice-sail-river',
            text: 'Steer along the singing river into the Great Geode',
            nextNodeId: 'node-heart-chamber',
            themeTag: 'Adventure',
          },
        ],
        vocabulary: [
          {
            word: 'transparent',
            phonetic: 'trans-PAIR-uhnt',
            definition: 'Allowing light to pass through so that objects behind can be distinctly seen.',
            example: 'The water was so transparent that Maya could count the gems beneath.',
            mastered: true,
            tier: 'Tier 2',
          },
        ],
        quiz: {
          id: 'quiz-node-river',
          question: 'What steered the boat without oars across the subterranean river?',
          options: [
            'A mechanical motor humming at the stern',
            'A glowing steering compass that pulsed with cavern chimes',
            'Two friendly river dolphins pushing the cedar wood',
            'A gust of wind blowing Maya’s coat'
          ],
          correctIndex: 1,
          explanation: 'The story notes an ornate cedar boat with a glowing steering compass in the bow that pulsed in harmony with the cavern chimes.',
          xpReward: 50,
          ccssStandard: 'CCSS.ELA-LITERACY.RI.3.1',
        },
      },
      'node-heart-chamber': {
        id: 'node-heart-chamber',
        title: 'Chapter 3: The Resonant Geode',
        illustration: crystalCaveImg,
        content: [
          'The tunnel opened into a cathedral-sized cavern. Suspended in mid-air was a colossal amethyst cluster, sending rainbow refractions across crystal formations that stood like ancient trees.',
          'Maya realized why the crystals chimed: they absorbed the mountain’s thermal warmth during the day and gently released harmonic frequencies at night to nourish the subterranean flora.',
          'With a gentle touch of her compass, Maya tuned the final resonant node. The entire cavern harmonized in a warm, comforting chord, marking Maya and Pip as official Guardians of the Whispering Mountain.'
        ],
        choices: [],
        vocabulary: [
          {
            word: 'refraction',
            phonetic: 'rih-FRAK-shun',
            definition: 'The bending of light as it passes from one transparent substance into another.',
            example: 'The crystal faces caused refraction, creating bright rainbows everywhere.',
            mastered: false,
            tier: 'Tier 3',
          },
          {
            word: 'harmonic',
            phonetic: 'har-MON-ik',
            definition: 'Relating to musical harmony, producing agreeable and soothing tones.',
            example: 'The harmonic chime settled into a peaceful melody throughout the peaks.',
            mastered: true,
            tier: 'Tier 2',
          },
        ],
        quiz: {
          id: 'quiz-node-heart',
          question: 'Why did the mountain crystals chime at night according to Maya’s scientific discovery?',
          options: [
            'To scare away cave bats and intruders',
            'To release harmonic warmth and nourish subterranean plant life',
            'Because visitors tossed coins into the cavern',
            'To signal the morning sunrise to villagers'
          ],
          correctIndex: 1,
          explanation: 'They absorbed thermal warmth during the day and gently released harmonic frequencies at night to nourish the subterranean flora.',
          xpReward: 100,
          ccssStandard: 'CCSS.ELA-LITERACY.RI.3.2',
        },
        isEnding: true,
      },
    },
  },
  {
    id: 'story-cosmic-voyage',
    title: 'Nova and the Starlight Compass',
    subtitle: 'An interstellar voyage among friendly constellations',
    coverImage: cosmicVoyageImg,
    genre: 'Astronomy & Physics',
    ageRange: 'Ages 8–12',
    gradeLevel: 'Grade 4-5',
    lexileLevel: '640L',
    estimatedMinutes: 10,
    tags: ['Astronomy', 'Physics', 'Gravitation'],
    summary: 'Cadet Alex embarks on an orbital navigation flight to calibrate the solar beacons of the Orion sector before the Great Meteor Shower.',
    initialNodeId: 'node-space-start',
    nodes: {
      'node-space-start': {
        id: 'node-space-start',
        title: 'Chapter 1: Departure from Starbase Horizon',
        illustration: cosmicVoyageImg,
        content: [
          'The cockpit hummed with the gentle purr of the ion propulsion engine. Alex strapped his flight harness tight, checking telemetry displays on his holographic dashboard.',
          '"Beacon calibration route confirmed," signaled Astra, his AI flight co-pilot. "Solar flare interference is minimal, but the icy rings of Calypso require a careful orbital trajectory."',
          'Alex grabbed the flight joystick. Ahead lay two possible orbital trajectories: a gravitational slingshot maneuver around the moon, or a direct burn through the shimmering auroral cloud.'
        ],
        choices: [
          {
            id: 'choice-slingshot',
            text: 'Execute gravitational slingshot around Moon Titan-4',
            nextNodeId: 'node-space-slingshot',
            themeTag: 'Astrophysics',
          },
        ],
        vocabulary: [
          {
            word: 'propulsion',
            phonetic: 'pruh-PUL-shun',
            definition: 'The action of driving or pushing forward with kinetic force.',
            example: 'The ion propulsion engine pushed the spacecraft silently across the vacuum.',
            mastered: false,
            tier: 'Tier 2',
          },
          {
            word: 'trajectory',
            phonetic: 'truh-JEK-tuh-ree',
            definition: 'The curved path that an object or vessel follows through space.',
            example: 'Alex plotted an orbital trajectory that conserved precious fuel.',
            mastered: true,
            tier: 'Tier 2',
          },
        ],
        quiz: {
          id: 'quiz-space-1',
          question: 'What warned Cadet Alex about the icy particles in the flight route?',
          options: [
            'A passing space freighter captain',
            'Astra, his AI flight co-pilot',
            'A blinking red emergency warning siren',
            'A radio call from his teacher on Earth'
          ],
          correctIndex: 1,
          explanation: 'Astra, his AI flight co-pilot, reported that the rings of Calypso required careful trajectory navigation.',
          xpReward: 50,
          ccssStandard: 'CCSS.ELA-LITERACY.RI.3.1',
        },
      },
      'node-space-slingshot': {
        id: 'node-space-slingshot',
        title: 'Chapter 2: The Ringed Horizon',
        illustration: cosmicVoyageImg,
        content: [
          'Alex ignited thrusters at the precise periapsis point. Gravity pulled the craft smoothly along the moon’s curvature, launching them forward like a silver pebble skipped across a lake of stars.',
          'Through the observation dome, the rings of Saturn-like Calypso glowed with prismatic hues of violet and rose. The solar beacon stood repaired, radiating clear navigation signals to all passing starships.'
        ],
        choices: [],
        vocabulary: [
          {
            word: 'periapsis',
            phonetic: 'per-ee-AP-sis',
            definition: 'The point in an orbit closest to the central celestial body.',
            example: 'At periapsis, the gravitational pull was strongest and accelerated the ship.',
            mastered: false,
            tier: 'Tier 3',
          },
        ],
        quiz: {
          id: 'quiz-space-2',
          question: 'What orbital maneuver did Alex execute around the moon?',
          options: [
            'A gravitational slingshot maneuver',
            'A reverse thruster emergency brake',
            'Deploying a giant cosmic sail',
            'Landing on the icy crater'
          ],
          correctIndex: 0,
          explanation: 'Alex executed a gravitational slingshot maneuver to gain orbital velocity efficiently.',
          xpReward: 80,
          ccssStandard: 'CCSS.ELA-LITERACY.RI.3.1',
        },
        isEnding: true,
      },
    },
  },
];
