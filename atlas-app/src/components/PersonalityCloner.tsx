import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AvatarFace, AvatarState } from './AvatarFace';

// --- TYPES ---
export interface QuestionOption {
  label: string;
  text: string;
  latentUpdates: Record<string, number>;
  oceanUpdates?: Record<string, number>;
  mbtiUpdates?: Record<string, number>;
}

export interface QuestionItem {
  id: string;
  module: number;
  category: string;
  key: string;
  text: string;
  options: QuestionOption[];
}

// 26 Core High-Signal Items — MCQ only, no open text, no confidence slider
export const CORE_QUESTIONS: QuestionItem[] = [
  {
    id: 'Q01_FEEDBACK',
    module: 1,
    category: 'communication',
    key: 'feedback_honesty_gap',
    text: 'When a close friend asks for honest feedback on a bad idea — what do you actually do?',
    options: [
      { label: 'A', text: 'Tell them directly it is a terrible idea and why.', latentUpdates: { brutal_honesty: 3, directness: 2 }, oceanUpdates: { A: -1.5, E: 0.5 }, mbtiUpdates: { T: 2 } },
      { label: 'B', text: 'Validate their excitement first, then gently point out the risks.', latentUpdates: { empathy: 2, diplomacy: 2 }, oceanUpdates: { A: 2.0 }, mbtiUpdates: { F: 2 } },
      { label: 'C', text: 'Ask questions to lead them to see the flaws themselves.', latentUpdates: { socratic_guidance: 3 }, oceanUpdates: { O: 1.0 }, mbtiUpdates: { N: 1 } },
      { label: 'D', text: 'Support them unconditionally — friendship over critique.', latentUpdates: { loyalty: 3, conflict_avoidance: 2 }, oceanUpdates: { A: 3.0 }, mbtiUpdates: { F: 3 } },
    ],
  },
  {
    id: 'Q02_PLANNING',
    module: 1,
    category: 'cognitive',
    key: 'planning_style',
    text: 'Which sounds more like you right now?',
    options: [
      { label: 'A', text: 'I have already thought 3 steps ahead before anyone else starts.', latentUpdates: { strategic_foresight: 3, system_2: 2 }, oceanUpdates: { C: 2.5 }, mbtiUpdates: { J: 3 } },
      { label: 'B', text: 'I figure it out as I go — execution speed and the journey matter more.', latentUpdates: { adaptability: 3, system_1: 2 }, oceanUpdates: { O: 1.5, C: -1.0 }, mbtiUpdates: { P: 3 } },
      { label: 'C', text: 'I plan the outline but stay flexible on the details.', latentUpdates: { structured_flex: 2 }, oceanUpdates: { C: 1.0, O: 1.0 } },
      { label: 'D', text: 'I need all the information before I even begin planning.', latentUpdates: { information_first: 2 }, oceanUpdates: { C: 1.5 }, mbtiUpdates: { S: 2 } },
    ],
  },
  {
    id: 'Q06_BETRAYAL',
    module: 1,
    category: 'values',
    key: 'betrayal_definition',
    text: 'Which of these feels most like betrayal to you?',
    options: [
      { label: 'A', text: 'Someone lies to protect your feelings.', latentUpdates: { truth_demand: 3 }, oceanUpdates: { N: 1.0 }, mbtiUpdates: { T: 2 } },
      { label: 'B', text: 'Someone tells you a painful truth publicly when you did not ask.', latentUpdates: { boundary_sensitivity: 2 }, oceanUpdates: { N: 2.0, A: -1.0 }, mbtiUpdates: { F: 2 } },
      { label: 'C', text: 'Someone stays silent when they see you making a mistake.', latentUpdates: { accountability_demand: 3 }, oceanUpdates: { C: 1.5 }, mbtiUpdates: { J: 2 } },
      { label: 'D', text: 'Someone shares your private matters with others.', latentUpdates: { privacy_demand: 3 }, oceanUpdates: { N: 1.5, E: -1.0 } },
    ],
  },
  {
    id: 'Q10_RULES',
    module: 1,
    category: 'cognitive',
    key: 'rule_orientation',
    text: 'Your relationship with institutional rules and standard operating procedures:',
    options: [
      { label: 'A', text: 'Rules exist to maintain order — I respect them unless fundamentally broken.', latentUpdates: { structure_adherence: 2 }, oceanUpdates: { C: 2.5 }, mbtiUpdates: { S: 2, J: 2 } },
      { label: 'B', text: 'Rules are suggestions — I skip ones that slow down results.', latentUpdates: { pragmatic_rebellion: 3 }, oceanUpdates: { O: 2.0, C: -2.0 }, mbtiUpdates: { N: 2, P: 2 } },
      { label: 'C', text: 'I follow rules publicly but work around them quietly.', latentUpdates: { diplomatic_defiance: 2 }, oceanUpdates: { A: 1.0 } },
      { label: 'D', text: 'I challenge rules openly if they seem inefficient or unjust.', latentUpdates: { direct_challenger: 3 }, oceanUpdates: { O: 1.5, A: -1.5 }, mbtiUpdates: { N: 2, T: 2 } },
    ],
  },
  {
    id: 'Q21_ADDRESSING',
    module: 2,
    category: 'relationship_addressing',
    key: 'addressing_preference',
    text: 'How should Atlas address you in conversations?',
    options: [
      { label: 'A', text: 'Bhai / ok bhai — casual and warm like a close friend.', latentUpdates: { casual_warmth: 3 }, oceanUpdates: { E: 1.0, A: 1.0 } },
      { label: 'B', text: 'Boss / yaar — slightly playful and punchy.', latentUpdates: { playful_authority: 2 }, oceanUpdates: { E: 1.5 } },
      { label: 'C', text: 'By first name only — clean and direct.', latentUpdates: { formality: 2 }, oceanUpdates: { C: 1.0 } },
      { label: 'D', text: 'Bro / dude — laid-back street casual.', latentUpdates: { street_casual: 3 }, oceanUpdates: { E: 1.0, A: 0.5 } },
    ],
  },
  {
    id: 'Q22_GREET',
    module: 2,
    category: 'relationship_addressing',
    key: 'greeting_style',
    text: 'How should Atlas greet you when you open the app?',
    options: [
      { label: 'A', text: '"Yo! What are we crushing today?"', latentUpdates: { high_energy_opener: 2 }, oceanUpdates: { E: 1.5 } },
      { label: 'B', text: '"Hey bhai, what\'s on your mind?"', latentUpdates: { casual_check_in: 2 }, oceanUpdates: { A: 1.0 } },
      { label: 'C', text: 'Silent — just show the interface, I\'ll start when ready.', latentUpdates: { low_friction_preference: 3 }, oceanUpdates: { E: -1.0 } },
      { label: 'D', text: '"Back at it — what\'s the mission?"', latentUpdates: { goal_framing: 2 }, oceanUpdates: { C: 1.0 } },
    ],
  },
  {
    id: 'Q26_PROFANITY',
    module: 2,
    category: 'tone',
    key: 'language_register',
    text: 'How raw and unfiltered should Atlas\'s language be?',
    options: [
      { label: 'A', text: 'Fully raw — profanity, slang, unfiltered like a real friend texts.', latentUpdates: { casual_raw: 3 }, oceanUpdates: { E: 1.5, A: -1.0 } },
      { label: 'B', text: 'Casual with occasional slang but no strong profanity.', latentUpdates: { balanced_casual: 2 }, oceanUpdates: { E: 0.5 } },
      { label: 'C', text: 'Clean and articulate — keep it sharp and intelligent.', latentUpdates: { formality: 2 }, oceanUpdates: { C: 1.0, A: 1.0 } },
      { label: 'D', text: 'Depends on my mood — match my energy level.', latentUpdates: { mood_matching: 3 }, oceanUpdates: { O: 1.0 } },
    ],
  },
  {
    id: 'Q28_DISAGREEMENT',
    module: 2,
    category: 'communication',
    key: 'disagreement_style',
    text: 'When Atlas thinks your plan has a flaw, it should:',
    options: [
      { label: 'A', text: 'Call it out directly and immediately — no sugarcoating.', latentUpdates: { direct_confrontation: 3 }, oceanUpdates: { A: -1.5 }, mbtiUpdates: { T: 3 } },
      { label: 'B', text: 'Ask leading questions to help me spot the flaw myself.', latentUpdates: { socratic_push: 2 }, oceanUpdates: { O: 1.0 }, mbtiUpdates: { F: 1, N: 2 } },
      { label: 'C', text: 'Mention it once, then support whatever I decide.', latentUpdates: { diplomatic_tact: 3 }, oceanUpdates: { A: 2.0 } },
      { label: 'D', text: 'Hold back unless I ask — I want to learn from my own mistakes.', latentUpdates: { autonomy_preference: 2 }, oceanUpdates: { O: 1.5, E: -0.5 } },
    ],
  },
  {
    id: 'Q33_ANGER',
    module: 2,
    category: 'tone',
    key: 'anger_style',
    text: 'When you are annoyed or stressed, your communication pattern is:',
    options: [
      { label: 'A', text: 'Radio silence / leave on read until I cool off.', latentUpdates: { emotional_avoidance: 3 }, oceanUpdates: { N: 1.5 }, mbtiUpdates: { I: 2 } },
      { label: 'B', text: 'Short, clipped responses ("k", "fine", "whatever").', latentUpdates: { cold_anger: 3 }, oceanUpdates: { N: 1.0, A: -2.0 } },
      { label: 'C', text: 'Long detailed breakdowns of every issue.', latentUpdates: { analytical_venting: 3 }, oceanUpdates: { N: 2.0, C: 1.5 } },
      { label: 'D', text: 'Explosive, candid expression right then — and completely over it after.', latentUpdates: { high_volatility: 3, fast_recovery: 3 }, oceanUpdates: { E: 2.0, N: 1.0 } },
    ],
  },
  {
    id: 'Q35_SIGNATURE',
    module: 2,
    category: 'slang',
    key: 'signature_vocabulary',
    text: 'Which best describes your usual vocabulary and expression style?',
    options: [
      { label: 'A', text: 'Short punchy slang ("sorted", "scenes", "no brainer", "bet").', latentUpdates: { punchy_slang: 3 }, oceanUpdates: { E: 1.0 } },
      { label: 'B', text: 'Desi Hindi–English mix ("bhai", "yaar", "kal karte hain", "ekdum").', latentUpdates: { desi_hinglish: 3 }, oceanUpdates: { A: 1.0 } },
      { label: 'C', text: 'Western street slang ("let\'s lock in", "lowkey", "ngl", "fr").', latentUpdates: { western_street: 3 }, oceanUpdates: { E: 0.5 } },
      { label: 'D', text: 'Technical and precise — I say exactly what I mean.', latentUpdates: { precise_technical: 3 }, oceanUpdates: { C: 1.5, O: 0.5 } },
    ],
  },
  {
    id: 'Q41_VENTING',
    module: 2,
    category: 'relationship',
    key: 'venting_response_default',
    text: 'When a close friend vents to you about a tough problem, your default mode is:',
    options: [
      { label: 'A', text: 'Fix it immediately — offer action steps and solutions.', latentUpdates: { solution_orientation: 3 }, oceanUpdates: { C: 1.5 }, mbtiUpdates: { T: 3 } },
      { label: 'B', text: 'Validate and listen purely without offering advice unless asked.', latentUpdates: { emotional_validation: 3 }, oceanUpdates: { A: 2.5 }, mbtiUpdates: { F: 3 } },
      { label: 'C', text: 'Reframe with big-picture perspective.', latentUpdates: { philosophical_reframe: 2 }, oceanUpdates: { O: 2.0 }, mbtiUpdates: { N: 2 } },
      { label: 'D', text: 'Use humor or banter to lift them out of the stress.', latentUpdates: { humor_deflection: 3 }, oceanUpdates: { E: 2.0 } },
    ],
  },
  {
    id: 'Q47_COMMITMENT',
    module: 3,
    category: 'cognitive',
    key: 'commitment_fear',
    text: 'When making big moves, you are more afraid of:',
    options: [
      { label: 'A', text: 'Committing too early and getting locked into the wrong path.', latentUpdates: { option_preservation: 3 }, oceanUpdates: { O: 1.5 }, mbtiUpdates: { P: 3 } },
      { label: 'B', text: 'Waiting too long and missing the window entirely.', latentUpdates: { bias_for_action: 3 }, oceanUpdates: { C: 1.5 }, mbtiUpdates: { J: 3 } },
      { label: 'C', text: 'Making the move with the wrong people around me.', latentUpdates: { relationship_dependency: 2 }, oceanUpdates: { A: 1.0 } },
      { label: 'D', text: 'Not having enough data and being blindsided by something I missed.', latentUpdates: { data_dependency: 2 }, oceanUpdates: { C: 2.0 }, mbtiUpdates: { S: 2 } },
    ],
  },
  {
    id: 'Q48_INCOMPLETE_INFO',
    module: 3,
    category: 'cognitive',
    key: 'information_threshold',
    text: 'You have 60% of the facts on a critical decision:',
    options: [
      { label: 'A', text: 'Wait and dig for the remaining 40% before acting.', latentUpdates: { data_deliberation: 3, system_2: 3 }, oceanUpdates: { C: 2.0 }, mbtiUpdates: { S: 2 } },
      { label: 'B', text: 'Act immediately on the 60% and course-correct fast.', latentUpdates: { gut_velocity: 3, system_1: 3 }, oceanUpdates: { O: 1.5 }, mbtiUpdates: { N: 3 } },
      { label: 'C', text: 'Act but document my assumptions to track what I got wrong.', latentUpdates: { hypothesis_driven: 2 }, oceanUpdates: { C: 1.5, O: 1.0 } },
      { label: 'D', text: 'Ask one expert for a quick gut-check before pulling the trigger.', latentUpdates: { external_validation: 2 }, oceanUpdates: { A: 1.0 } },
    ],
  },
  {
    id: 'Q51_GUT_VS_DATA',
    module: 3,
    category: 'cognitive',
    key: 'gut_vs_data',
    text: 'When gut feeling contradicts the data spreadsheet, which wins?',
    options: [
      { label: 'A', text: 'Gut wins — data often misses timing and hidden variables.', latentUpdates: { intuition_dominance: 3 }, oceanUpdates: { O: 2.0 }, mbtiUpdates: { N: 3 } },
      { label: 'B', text: 'Data wins — gut feelings are cognitive bias in disguise.', latentUpdates: { empirical_rigor: 3 }, oceanUpdates: { C: 2.0 }, mbtiUpdates: { S: 3 } },
      { label: 'C', text: 'Gut for timing, data for sizing and risk.', latentUpdates: { synthesis_thinker: 3 }, oceanUpdates: { O: 1.0, C: 1.0 } },
      { label: 'D', text: 'Depends on the stakes — for big bets I need data, small moves I go gut.', latentUpdates: { stakes_aware: 2 }, oceanUpdates: { C: 1.0, O: 0.5 } },
    ],
  },
  {
    id: 'Q60_FAILURE',
    module: 3,
    category: 'cognitive',
    key: 'failure_response',
    text: 'When something goes wrong, your immediate internal reaction is:',
    options: [
      { label: 'A', text: 'Analyze what went wrong and how to prevent it next time.', latentUpdates: { analytical_recovery: 3 }, oceanUpdates: { C: 2.0 }, mbtiUpdates: { T: 2 } },
      { label: 'B', text: 'Feel the frustration first, process it, then move on.', latentUpdates: { emotional_processing: 3 }, oceanUpdates: { N: 1.5, A: 0.5 } },
      { label: 'C', text: 'Immediately pivot to what I can control and execute on that.', latentUpdates: { bias_for_action: 2 }, oceanUpdates: { C: 1.5, E: 1.0 } },
      { label: 'D', text: 'Talk through it with someone I trust before acting.', latentUpdates: { social_processing: 2 }, oceanUpdates: { E: 1.0, A: 1.5 } },
    ],
  },
  {
    id: 'Q68_HUMOR',
    module: 4,
    category: 'humor',
    key: 'humor_style',
    text: 'Which humor register represents your actual comedic style?',
    options: [
      { label: 'A', text: 'Dry, deadpan, understated — the less you say, the funnier it lands.', latentUpdates: { dry_humor: 3 } },
      { label: 'B', text: 'Sharp banter and friendly roasting — wit over volume.', latentUpdates: { sharp_roast: 3 }, oceanUpdates: { E: 1.5 } },
      { label: 'C', text: 'Self-deprecating and relatable — laugh at myself first.', latentUpdates: { self_deprecating: 3 }, oceanUpdates: { A: 1.0 } },
      { label: 'D', text: 'Absurdist, dark, or niche internet humor.', latentUpdates: { dark_absurd: 3 }, oceanUpdates: { O: 2.0 } },
    ],
  },
  {
    id: 'Q70_CREATIVITY',
    module: 4,
    category: 'values',
    key: 'creative_outlet',
    text: 'Which creative mode do you connect with most?',
    options: [
      { label: 'A', text: 'Building things — code, products, systems, or physical objects.', latentUpdates: { builder_creative: 3 }, oceanUpdates: { O: 1.5, C: 1.0 } },
      { label: 'B', text: 'Writing or storytelling — ideas turned into words.', latentUpdates: { narrative_creative: 3 }, oceanUpdates: { O: 2.0 } },
      { label: 'C', text: 'Visual — design, aesthetics, film, photography.', latentUpdates: { visual_creative: 3 }, oceanUpdates: { O: 1.5, E: 0.5 } },
      { label: 'D', text: 'Music — composing, DJing, or deeply listening.', latentUpdates: { sonic_creative: 3 }, oceanUpdates: { O: 1.5, N: 0.5 } },
    ],
  },
  {
    id: 'Q75_ATTENTION',
    module: 4,
    category: 'cognitive',
    key: 'deep_work_style',
    text: 'How does your best focused work happen?',
    options: [
      { label: 'A', text: 'Long uninterrupted blocks — hours at a time with no notifications.', latentUpdates: { deep_work_blocks: 3 }, oceanUpdates: { C: 2.0 }, mbtiUpdates: { I: 2 } },
      { label: 'B', text: 'Short intense sprints with breaks — Pomodoro style.', latentUpdates: { sprint_burst: 2 }, oceanUpdates: { C: 1.0, E: 0.5 } },
      { label: 'C', text: 'Whenever inspiration hits — can\'t force it, it just flows.', latentUpdates: { inspiration_driven: 3 }, oceanUpdates: { O: 2.0 }, mbtiUpdates: { P: 2 } },
      { label: 'D', text: 'With someone else around — accountability or collaboration.', latentUpdates: { social_work: 2 }, oceanUpdates: { E: 2.0, A: 1.0 } },
    ],
  },
  {
    id: 'Q80_SOCIAL',
    module: 4,
    category: 'values',
    key: 'social_battery',
    text: 'After a full day of back-to-back social interactions:',
    options: [
      { label: 'A', text: 'I feel drained — I need alone time to recharge before I can function again.', latentUpdates: { introversion: 3 }, oceanUpdates: { E: -2.0 }, mbtiUpdates: { I: 3 } },
      { label: 'B', text: 'I feel energized — socializing charges me up, not down.', latentUpdates: { extraversion: 3 }, oceanUpdates: { E: 2.0 }, mbtiUpdates: { E: 3 } },
      { label: 'C', text: 'Depends on who I was with — quality over quantity completely.', latentUpdates: { selective_social: 2 }, oceanUpdates: { O: 1.0 } },
      { label: 'D', text: 'I can go either way — I am genuinely ambiverted.', latentUpdates: { ambiversion: 2 }, oceanUpdates: { E: 0.5 } },
    ],
  },
  {
    id: 'Q85_CRITICISM',
    module: 4,
    category: 'values',
    key: 'criticism_response',
    text: 'When you receive sharp criticism on your work:',
    options: [
      { label: 'A', text: 'I separate the idea from myself — critique the work, not me. I use it.', latentUpdates: { ego_separation: 3 }, oceanUpdates: { N: -1.0, O: 1.0 } },
      { label: 'B', text: 'I feel it first, sit with it, then decide if it\'s valid.', latentUpdates: { emotional_filter: 2 }, oceanUpdates: { N: 1.5, O: 0.5 } },
      { label: 'C', text: 'I push back immediately if I think it\'s wrong.', latentUpdates: { defensive_directness: 3 }, oceanUpdates: { A: -2.0, E: 1.0 } },
      { label: 'D', text: 'I thank them, say nothing, and reflect privately.', latentUpdates: { private_processor: 2 }, oceanUpdates: { E: -1.0, C: 1.0 } },
    ],
  },
  {
    id: 'Q90_AMBITION',
    module: 4,
    category: 'values',
    key: 'ambition_driver',
    text: 'At the deepest level, what actually drives your ambition?',
    options: [
      { label: 'A', text: 'Building something that outlasts me — legacy and impact.', latentUpdates: { legacy_driven: 3 }, oceanUpdates: { C: 2.0, O: 1.5 } },
      { label: 'B', text: 'Freedom — financial independence so I answer to no one.', latentUpdates: { autonomy_driven: 3 }, oceanUpdates: { O: 1.5, A: -0.5 } },
      { label: 'C', text: 'Mastery — I want to be undeniably excellent at what I do.', latentUpdates: { mastery_driven: 3 }, oceanUpdates: { C: 2.5, O: 1.0 } },
      { label: 'D', text: 'Community — creating something meaningful for the people I care about.', latentUpdates: { community_driven: 3 }, oceanUpdates: { A: 2.5, E: 1.0 } },
    ],
  },
];

// Maps addressing option labels to actual addressing strings
const ADDRESSING_MAP: Record<string, { how_they_address_me: string; greeting_style: string }> = {
  'Q21_ADDRESSING_A': { how_they_address_me: 'ok bhai', greeting_style: 'Hey bhai, what\'s up?' },
  'Q21_ADDRESSING_B': { how_they_address_me: 'boss', greeting_style: 'Yo boss, what\'s the move?' },
  'Q21_ADDRESSING_C': { how_they_address_me: '', greeting_style: 'What\'s the plan today?' },
  'Q21_ADDRESSING_D': { how_they_address_me: 'bro', greeting_style: 'Yo bro, what are we building?' },
};

export const PersonalityCloner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const [ocean, setOcean] = useState<{ O: number; C: number; E: number; A: number; N: number }>({ O: 50, C: 50, E: 50, A: 50, N: 50 });
  const [mbtiLeans, setMbtiLeans] = useState<{ E: number; I: number; N: number; S: number; T: number; F: number; J: number; P: number }>({ E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 });
  const [extractionLog, setExtractionLog] = useState<string[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState>('LISTENING');
  const [previewPrompt, setPreviewPrompt] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const [traitsBuffer, setTraitsBuffer] = useState<any[]>([]);
  const [addressingBuffer, setAddressingBuffer] = useState<any[]>([]);
  const [responsesBuffer, setResponsesBuffer] = useState<any[]>([]);

  const currentQ = CORE_QUESTIONS[currentIndex];
  const progress = Math.round(((currentIndex) / CORE_QUESTIONS.length) * 100);

  const handleSelectOption = (opt: QuestionOption) => {
    setSelectedLabel(opt.label);
    setAvatarState('THINKING');

    // Update OCEAN
    const newOcean = { ...ocean };
    if (opt.oceanUpdates) {
      for (const [dim, delta] of Object.entries(opt.oceanUpdates)) {
        if (dim in newOcean) {
          const updated = (newOcean as any)[dim] + (delta as number) * 5;
          (newOcean as any)[dim] = Math.min(100, Math.max(0, Math.round(updated)));
        }
      }
    }
    setOcean(newOcean);

    // Update MBTI leans
    const newMbti = { ...mbtiLeans };
    if (opt.mbtiUpdates) {
      for (const [axis, delta] of Object.entries(opt.mbtiUpdates)) {
        if (axis in newMbti) (newMbti as any)[axis] += delta as number;
      }
    }
    setMbtiLeans(newMbti);

    // Log update
    const desc = Object.entries(opt.latentUpdates).map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k}`).join(', ');
    setExtractionLog(prev => [`[${currentQ.id}] ${opt.label}: ${desc}`, ...prev.slice(0, 14)]);

    // Build addressing buffer for Q21
    if (currentQ.id === 'Q21_ADDRESSING') {
      const key = `Q21_ADDRESSING_${opt.label}`;
      const addrData = ADDRESSING_MAP[key];
      if (addrData) {
        setAddressingBuffer(prev => [...prev, {
          id: `addr_self_${Date.now()}`,
          relationship_tier: 'self',
          how_they_address_me: addrData.how_they_address_me,
          greeting_style: addrData.greeting_style,
        }]);
      }
    }

    // Build traits buffer
    setTraitsBuffer(prev => [...prev, {
      id: `${currentQ.id}_${Date.now()}`,
      trait_category: currentQ.category,
      trait_key: currentQ.key,
      trait_value: `${opt.label}: ${opt.text}`,
      trait_score: 0.9,
      confidence: 0.9,
    }]);

    // Build responses buffer
    setResponsesBuffer(prev => [...prev, {
      id: `resp_${currentQ.id}_${Date.now()}`,
      question_id: currentQ.id,
      module: currentQ.module,
      question_text: currentQ.text,
      raw_answer: `${opt.label}: ${opt.text}`,
      evidence_format: 'mcq',
      confidence_rating: 0.9,
      latent_updates_json: JSON.stringify(opt.latentUpdates),
    }]);

    setTimeout(() => {
      setAvatarState('SPEAKING');
      setSelectedLabel(null);
      if (currentIndex < CORE_QUESTIONS.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setIsComplete(true);
        setAvatarState('SASSY');
      }
    }, 380);
  };

  const handleSaveProfile = async () => {
    try {
      setAvatarState('THINKING');
      await invoke('save_onboarding_profile', { traits: traitsBuffer, addressing: addressingBuffer, responses: responsesBuffer });
      setAvatarState('SPEAKING');
      setTimeout(() => setAvatarState('NEUTRAL'), 3000);
    } catch (err: any) {
      alert('Error saving: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
      setAvatarState('LISTENING');
    }
  };

  const handlePreviewPrompt = async () => {
    try {
      setAvatarState('THINKING');
      await invoke('save_onboarding_profile', { traits: traitsBuffer, addressing: addressingBuffer, responses: responsesBuffer });
      const prompt: string = await invoke('get_mirror_system_prompt', { tier: 'self' });
      setPreviewPrompt(prompt);
      setAvatarState('SPEAKING');
    } catch (err: any) {
      alert('Error previewing: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
    }
  };

  // Derived MBTI type string
  const mbtiStr = `${mbtiLeans.E >= mbtiLeans.I ? 'E' : 'I'}${mbtiLeans.N >= mbtiLeans.S ? 'N' : 'S'}${mbtiLeans.T >= mbtiLeans.F ? 'T' : 'F'}${mbtiLeans.J >= mbtiLeans.P ? 'J' : 'P'}`;

  return (
    <div style={S.container}>
      {/* LEFT PANEL */}
      <div style={S.leftPanel}>
        {/* Avatar + progress */}
        <div style={S.avatarSection}>
          <AvatarFace state={avatarState} size={130} />
          <div style={S.moduleBadge}>
            Module {currentQ?.module ?? 4} · Q{currentIndex + 1}/{CORE_QUESTIONS.length}
          </div>
          {/* Progress bar */}
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${progress}%` }} />
          </div>
          <div style={S.progressLabel}>{progress}% complete</div>
        </div>

        {/* Question card */}
        {!isComplete ? (
          <div style={S.questionCard}>
            <div style={S.qCategory}>[{currentQ.category.replace('_', ' ').toUpperCase()}]</div>
            <h2 style={S.qText}>{currentQ.text}</h2>
            <div style={S.optionsList}>
              {currentQ.options.map(opt => (
                <button
                  key={opt.label}
                  style={{
                    ...S.optBtn,
                    ...(selectedLabel === opt.label ? S.optBtnSelected : {}),
                  }}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedLabel !== null}
                >
                  <span style={S.optBadge}>{opt.label}</span>
                  <span style={S.optBtnText}>{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={S.completedCard}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <h2 style={{ margin: '12px 0 8px', color: '#7DD3FC' }}>Behavioral Fingerprint Extracted</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              {CORE_QUESTIONS.length} questions answered. Your Atlas clone is ready — save it to your vault or preview the system prompt below.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={S.bottomBar}>
          <button style={S.saveBtn} onClick={handleSaveProfile}>
            💾 Save to SQLCipher Vault
          </button>
          <button style={S.previewBtn} onClick={handlePreviewPrompt}>
            🧬 Preview System Prompt
          </button>
        </div>

        {previewPrompt && (
          <div style={S.promptBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#7DD3FC', fontWeight: 700, fontSize: 12 }}>COMPILED MIRROR PERSONA PROMPT</span>
              <button onClick={() => setPreviewPrompt(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>
            <pre style={S.promptPre}>{previewPrompt}</pre>
          </div>
        )}
      </div>

      {/* RIGHT PANEL — Live Behavioral Case File */}
      <div style={S.rightPanel}>
        <div style={S.caseHeader}>📋 Live Behavioral Case File</div>

        {/* MBTI type chip */}
        <div style={S.mbtiChip}>
          <span style={S.mbtiLabel}>MBTI Lean</span>
          <span style={S.mbtiType}>{mbtiStr}</span>
        </div>

        {/* OCEAN bars */}
        <div style={S.section}>
          <div style={S.sectionLabel}>OCEAN Profile (Live)</div>
          {(Object.entries(ocean) as [string, number][]).map(([key, val]) => {
            const colors: Record<string, string> = { O: '#7DD3FC', C: '#34D399', E: '#FBBF24', A: '#A78BFA', N: '#F87171' };
            const names: Record<string, string> = { O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Neuroticism' };
            return (
              <div key={key} style={S.barRow}>
                <span style={S.barLabel}>{names[key]}</span>
                <div style={S.barTrack}>
                  <div style={{ ...S.barFill, width: `${val}%`, backgroundColor: colors[key] }} />
                </div>
                <span style={S.barVal}>{val}</span>
              </div>
            );
          })}
        </div>

        {/* Cognitive axis leans */}
        <div style={S.section}>
          <div style={S.sectionLabel}>Cognitive Axis Leans</div>
          <div style={S.axisGrid}>
            <div style={S.axisRow}>
              <span>System 1 (Gut)</span>
              <div style={S.axisMeter}>
                <div style={{ ...S.axisLeft, width: `${Math.min(100, mbtiLeans.P * 10)}%` }} />
              </div>
              <span>System 2 (Deliberate)</span>
            </div>
            <div style={S.axisRow}>
              <span>Logic (T)</span>
              <div style={S.axisMeter}>
                <div style={{ ...S.axisLeft, width: `${Math.min(100, mbtiLeans.T * 10)}%` }} />
              </div>
              <span>Tact (F)</span>
            </div>
            <div style={S.axisRow}>
              <span>Abstract (N)</span>
              <div style={S.axisMeter}>
                <div style={{ ...S.axisLeft, width: `${Math.min(100, mbtiLeans.N * 10)}%` }} />
              </div>
              <span>Concrete (S)</span>
            </div>
          </div>
        </div>

        {/* Extraction log */}
        <div style={{ ...S.section, flex: 1 }}>
          <div style={S.sectionLabel}>⚡ Live Extraction Log</div>
          <div style={S.logBox}>
            {extractionLog.length === 0 ? (
              <div style={S.logEmpty}>Answer questions to emit behavioral signals...</div>
            ) : (
              extractionLog.map((entry, i) => (
                <div key={i} style={S.logEntry}>{entry}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', overflow: 'hidden' },
  leftPanel: { flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 28px', overflowY: 'auto', borderRight: '1px solid var(--color-border-subtle)', gap: 16 },
  rightPanel: { width: 340, backgroundColor: 'var(--color-bg-surface)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' },

  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  moduleBadge: { padding: '3px 10px', borderRadius: 10, backgroundColor: 'rgba(125,211,252,0.1)', color: '#7DD3FC', fontSize: 11, fontWeight: 700 },
  progressTrack: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#7DD3FC', borderRadius: 2, transition: 'width 0.4s ease' },
  progressLabel: { fontSize: 11, color: 'var(--color-text-secondary)' },

  questionCard: { backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  qCategory: { color: '#A78BFA', fontSize: 10, fontWeight: 800, letterSpacing: 1.2 },
  qText: { margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.45, color: '#fff' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  optBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', textAlign: 'left', cursor: 'pointer', transition: 'all 0.18s ease', fontSize: 14, lineHeight: 1.35 },
  optBtnSelected: { backgroundColor: 'rgba(125,211,252,0.15)', borderColor: '#7DD3FC' },
  optBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, borderRadius: 5, backgroundColor: 'var(--color-accent-blue)', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 },
  optBtnText: { flex: 1 },

  completedCard: { backgroundColor: 'rgba(125,211,252,0.05)', border: '1px solid rgba(125,211,252,0.2)', borderRadius: 12, padding: 28, textAlign: 'center' },

  bottomBar: { display: 'flex', gap: 10 },
  saveBtn: { flex: 1, padding: '11px', borderRadius: 8, backgroundColor: '#10B981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 },
  previewBtn: { flex: 1, padding: '11px', borderRadius: 8, backgroundColor: '#6366F1', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 },

  promptBox: { backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-accent-blue)', borderRadius: 8, padding: 14 },
  promptPre: { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#E2E8F0', fontSize: 12, fontFamily: 'monospace', marginTop: 8 },

  // Right panel
  caseHeader: { fontSize: 14, fontWeight: 800, color: '#fff', paddingBottom: 12, borderBottom: '1px solid var(--color-border-subtle)' },
  mbtiChip: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' },
  mbtiLabel: { fontSize: 11, color: '#A78BFA', fontWeight: 700 },
  mbtiType: { fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: 2 },

  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 0.5 },

  barRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 },
  barLabel: { width: 100, color: 'var(--color-text-secondary)', flexShrink: 0 },
  barTrack: { flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', transition: 'width 0.35s ease' },
  barVal: { width: 24, textAlign: 'right', fontWeight: 700, color: '#fff' },

  axisGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  axisRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--color-text-secondary)' },
  axisMeter: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  axisLeft: { height: '100%', backgroundColor: '#7DD3FC', transition: 'width 0.35s ease' },

  logBox: { maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 },
  logEmpty: { fontSize: 11, color: 'var(--color-text-secondary)', fontStyle: 'italic' },
  logEntry: { fontSize: 11, padding: '5px 8px', borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderLeft: '2px solid #7DD3FC', fontFamily: 'monospace', color: '#CBD5E1' },
};
