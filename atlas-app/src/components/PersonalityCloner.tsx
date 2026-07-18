import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AvatarFace, AvatarState } from './AvatarFace';

// --- TYPES ---
export interface QuestionItem {
  id: string;
  module: number;
  category: string;
  key: string;
  text: string;
  format: 'mcq' | 'pairwise' | 'sjt' | 'open' | 'scale';
  options?: {
    label: string;
    text: string;
    latentUpdates: Record<string, number>;
    oceanUpdates?: Record<string, number>; // O, C, E, A, N delta
    mbtiUpdates?: Record<string, number>; // J, P, N, S, T, F delta
  }[];
}

// 26 Core High-Signal Items from docs/BEHAVIORAL_EVIDENCE_ENGINE.md
export const CORE_QUESTIONS: QuestionItem[] = [
  {
    id: 'Q01_FEEDBACK',
    module: 1,
    category: 'communication',
    key: 'feedback_honesty_gap',
    text: 'When a close friend asks for honest feedback on a bad idea — what do you actually do?',
    format: 'mcq',
    options: [
      { label: 'A', text: 'Tell them directly it is a terrible idea and why.', latentUpdates: { brutal_honesty: 3, directness: 2 }, oceanUpdates: { A: -1.5, E: 0.5 }, mbtiUpdates: { T: 2 } },
      { label: 'B', text: 'Validate their excitement first, then gently point out the risks.', latentUpdates: { empathy: 2, diplomacy: 2 }, oceanUpdates: { A: 2.0 }, mbtiUpdates: { F: 2 } },
      { label: 'C', text: 'Ask questions to lead them to see the flaws themselves.', latentUpdates: { socratic_guidance: 3 }, oceanUpdates: { O: 1.0 }, mbtiUpdates: { N: 1 } },
      { label: 'D', text: 'Support them unconditionally—friendship over critique.', latentUpdates: { loyalty: 3, conflict_avoidance: 2 }, oceanUpdates: { A: 3.0 }, mbtiUpdates: { F: 3 } },
    ]
  },
  {
    id: 'Q02_PLANNING',
    module: 1,
    category: 'cognitive',
    key: 'planning_style',
    text: 'Pick the one that sounds more like your mind right now:',
    format: 'pairwise',
    options: [
      { label: 'A', text: 'I have already thought 3 steps ahead before anyone else starts.', latentUpdates: { strategic_foresight: 3, system_2: 2 }, oceanUpdates: { C: 2.5 }, mbtiUpdates: { J: 3 } },
      { label: 'B', text: 'I figure it out as I go — execution speed and journey matter more.', latentUpdates: { adaptability: 3, system_1: 2 }, oceanUpdates: { O: 1.5, C: -1.0 }, mbtiUpdates: { P: 3 } },
    ]
  },
  {
    id: 'Q06_BETRAYAL',
    module: 1,
    category: 'values',
    key: 'betrayal_definition',
    text: 'Which of these feels most like betrayal to you?',
    format: 'mcq',
    options: [
      { label: 'A', text: 'Someone lies to protect your feelings.', latentUpdates: { truth_demand: 3 }, oceanUpdates: { N: 1.0 }, mbtiUpdates: { T: 2 } },
      { label: 'B', text: 'Someone tells you a painful truth publicly or bluntly when you did not ask.', latentUpdates: { boundary_sensitivity: 2 }, oceanUpdates: { N: 2.0, A: -1.0 }, mbtiUpdates: { F: 2 } },
      { label: 'C', text: 'Someone stays silent when they see you making a mistake.', latentUpdates: { accountability_demand: 3 }, oceanUpdates: { C: 1.5 }, mbtiUpdates: { J: 2 } },
    ]
  },
  {
    id: 'Q10_RULES',
    module: 1,
    category: 'cognitive',
    key: 'rule_orientation',
    text: 'Your relationship with institutional rules and standard operating procedures:',
    format: 'pairwise',
    options: [
      { label: 'A', text: 'Rules exist to maintain order; I respect them unless fundamentally broken.', latentUpdates: { structure_adherence: 2 }, oceanUpdates: { C: 2.5 }, mbtiUpdates: { S: 2, J: 2 } },
      { label: 'B', text: 'Rules are suggestions or someone else\'s problem if they slow down results.', latentUpdates: { pragmatic_rebellion: 3 }, oceanUpdates: { O: 2.0, C: -2.0 }, mbtiUpdates: { N: 2, P: 2 } },
    ]
  },
  {
    id: 'Q21_ADDRESSING_BEST_FRIEND',
    module: 2,
    category: 'relationship_addressing',
    key: 'addressing_best_friend',
    text: 'What do you naturally call your closest friend when greeting or texting them? (e.g. bhai, yaar, bro, bud, mate)',
    format: 'open',
  },
  {
    id: 'Q22_ADDRESSING_SELF',
    module: 2,
    category: 'relationship_addressing',
    key: 'addressing_self_preference',
    text: 'When Atlas (your digital twin) talks to you, how should it address you? (e.g. ok bhai, K, boss, bhai, or first name)',
    format: 'open',
  },
  {
    id: 'Q26_PROFANITY',
    module: 2,
    category: 'tone',
    key: 'profanity_frequency',
    text: 'How often do you use profanity/raw street language in casual conversation?',
    format: 'pairwise',
    options: [
      { label: 'A', text: 'Rare to clean — I keep my language sharp and composed.', latentUpdates: { formality: 2 }, oceanUpdates: { C: 1.0, A: 1.0 } },
      { label: 'B', text: 'Frequently — unfiltered, expressive, casual slang everywhere.', latentUpdates: { casual_raw: 3 }, oceanUpdates: { E: 1.5, A: -1.0 } },
    ]
  },
  {
    id: 'Q28_DISAGREEMENT',
    module: 2,
    category: 'communication',
    key: 'disagreement_style',
    text: 'When you disagree with someone you respect, what is your reflex?',
    format: 'pairwise',
    options: [
      { label: 'A', text: 'Direct challenge — bring up the exact logic flaw immediately.', latentUpdates: { direct_confrontation: 3 }, oceanUpdates: { A: -1.5 }, mbtiUpdates: { T: 3 } },
      { label: 'B', text: 'Tactful framing — ask clarifying questions to guide them there.', latentUpdates: { diplomatic_tact: 3 }, oceanUpdates: { A: 2.0 }, mbtiUpdates: { F: 2 } },
    ]
  },
  {
    id: 'Q33_CONFLICT_TEXTING',
    module: 2,
    category: 'tone',
    key: 'conflict_texting_style',
    text: 'What is your texting pattern when you are annoyed or angry?',
    format: 'mcq',
    options: [
      { label: 'A', text: 'Radio silence / leave on read until I cool off.', latentUpdates: { emotional_avoidance: 3 }, oceanUpdates: { N: 1.5 }, mbtiUpdates: { I: 2 } },
      { label: 'B', text: 'Short, clipped responses ("k", "fine", "whatever").', latentUpdates: { cold_anger: 3 }, oceanUpdates: { N: 1.0, A: -2.0 } },
      { label: 'C', text: 'Longer than usual paragraphs breaking down every detail.', latentUpdates: { analytical_venting: 3 }, oceanUpdates: { N: 2.0, C: 1.5 } },
      { label: 'D', text: 'Explosive, candid call/text right then, then completely over it.', latentUpdates: { high_volatility: 3, fast_recovery: 3 }, oceanUpdates: { E: 2.0, N: 1.0 } },
    ]
  },
  {
    id: 'Q35_SIGNATURE_PHRASES',
    module: 2,
    category: 'slang',
    key: 'signature_phrases',
    text: 'List 3-5 signature words, slang, or phrases you use constantly (e.g. "let\'s lock in", "scenes", "sorted", "no brainer", "bet"):',
    format: 'open',
  },
  {
    id: 'Q41_VENTING',
    module: 2,
    category: 'relationship',
    key: 'venting_response_default',
    text: 'When a close friend vents to you about a tough problem, your default mode:',
    format: 'mcq',
    options: [
      { label: 'A', text: 'Fix it immediately — offer action steps and solutions.', latentUpdates: { solution_orientation: 3 }, oceanUpdates: { C: 1.5 }, mbtiUpdates: { T: 3 } },
      { label: 'B', text: 'Validate and listen purely without offering advice unless asked.', latentUpdates: { emotional_validation: 3 }, oceanUpdates: { A: 2.5 }, mbtiUpdates: { F: 3 } },
      { label: 'C', text: 'Reframe with big-picture perspective ("look at it this way...").', latentUpdates: { philosophical_reframe: 2 }, oceanUpdates: { O: 2.0 }, mbtiUpdates: { N: 2 } },
      { label: 'D', text: 'Use humor or banter to make them laugh out of the stress.', latentUpdates: { humor_deflection: 3 }, oceanUpdates: { E: 2.0 } },
    ]
  },
  {
    id: 'Q47_COMMITMENT_FEAR',
    module: 3,
    category: 'cognitive',
    key: 'commitment_fear_direction',
    text: 'Which are you more afraid of when making big moves?',
    format: 'pairwise',
    options: [
      { label: 'A', text: 'Committing too early and getting locked into the wrong path.', latentUpdates: { option_preservation: 3 }, oceanUpdates: { O: 1.5 }, mbtiUpdates: { P: 3 } },
      { label: 'B', text: 'Waiting too long, over-analyzing, and missing the window of opportunity.', latentUpdates: { bias_for_action: 3 }, oceanUpdates: { C: 1.5 }, mbtiUpdates: { J: 3 } },
    ]
  },
  {
    id: 'Q48_INCOMPLETE_INFO',
    module: 3,
    category: 'cognitive',
    key: 'information_threshold',
    text: 'You have 60% of the facts on a critical technical/business decision:',
    format: 'pairwise',
    options: [
      { label: 'A', text: 'Wait and dig for the remaining 40% before pulling the trigger.', latentUpdates: { data_deliberation: 3, system_2: 3 }, oceanUpdates: { C: 2.0 }, mbtiUpdates: { S: 2 } },
      { label: 'B', text: 'Act immediately on the 60% with intuition and course-correct on the fly.', latentUpdates: { gut_velocity: 3, system_1: 3 }, oceanUpdates: { O: 1.5 }, mbtiUpdates: { N: 3 } },
    ]
  },
  {
    id: 'Q51_GUT_VS_DATA',
    module: 3,
    category: 'cognitive',
    key: 'gut_vs_data',
    text: 'When your gut feeling explicitly contradicts the spreadsheet data, which wins in your world?',
    format: 'pairwise',
    options: [
      { label: 'A', text: 'My gut instinct wins. Data often misses hidden variables and timing.', latentUpdates: { intuition_dominance: 3 }, oceanUpdates: { O: 2.0 }, mbtiUpdates: { N: 3 } },
      { label: 'B', text: 'The empirical data wins. Gut feelings are subject to cognitive bias.', latentUpdates: { empirical_rigor: 3 }, oceanUpdates: { C: 2.0 }, mbtiUpdates: { S: 3 } },
    ]
  },
  {
    id: 'Q68_HUMOR_STYLE',
    module: 4,
    category: 'humor',
    key: 'humor_style',
    text: 'Which humor register represents your actual comedic style?',
    format: 'mcq',
    options: [
      { label: 'A', text: 'Dry, deadpan, and understated.', latentUpdates: { dry_humor: 3 } },
      { label: 'B', text: 'Sharp banter, friendly roasting, and quick wit.', latentUpdates: { sharp_roast: 3 }, oceanUpdates: { E: 1.5 } },
      { label: 'C', text: 'Self-deprecating and relatable self-awareness.', latentUpdates: { self_deprecating: 3 }, oceanUpdates: { A: 1.0 } },
      { label: 'D', text: 'Absurdist, dark, or niche internet/tech humor.', latentUpdates: { dark_absurd: 3 }, oceanUpdates: { O: 2.0 } },
    ]
  },
];

export const PersonalityCloner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confidence, setConfidence] = useState<number>(0.85); // 0.6 to 1.0
  const [openTextVal, setOpenTextVal] = useState<string>('');
  
  // Live Behavioral Case File State
  const [ocean, setOcean] = useState<{ O: number; C: number; E: number; A: number; N: number }>({
    O: 50, C: 50, E: 50, A: 50, N: 50
  });
  const [mbtiLeans, setMbtiLeans] = useState<{ E: number; I: number; N: number; S: number; T: number; F: number; J: number; P: number }>({
    E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0
  });
  const [extractionLog, setExtractionLog] = useState<string[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState>('LISTENING');
  const [previewPrompt, setPreviewPrompt] = useState<string | null>(null);

  // Stored Backend Payload Buffers
  const [traitsBuffer, setTraitsBuffer] = useState<any[]>([]);
  const [addressingBuffer, setAddressingBuffer] = useState<any[]>([]);
  const [responsesBuffer, setResponsesBuffer] = useState<any[]>([]);

  const currentQ = CORE_QUESTIONS[currentIndex];

  const handleSelectOption = (opt: any) => {
    setAvatarState('THINKING');
    
    // Calculate new OCEAN scores
    const newOcean = { ...ocean };
    if (opt.oceanUpdates) {
      for (const [dim, delta] of Object.entries(opt.oceanUpdates)) {
        if (dim in newOcean) {
          const val = (newOcean as any)[dim] + (delta as number) * confidence * 5;
          (newOcean as any)[dim] = Math.min(100, Math.max(0, Math.round(val)));
        }
      }
    }
    setOcean(newOcean);

    // Calculate MBTI Leans
    const newMbti = { ...mbtiLeans };
    if (opt.mbtiUpdates) {
      for (const [axis, delta] of Object.entries(opt.mbtiUpdates)) {
        if (axis in newMbti) {
          (newMbti as any)[axis] += (delta as number);
        }
      }
    }
    setMbtiLeans(newMbti);

    // Log latent updates
    const updatesDesc = Object.entries(opt.latentUpdates || {})
      .map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k}`)
      .join(', ');
    setExtractionLog((prev) => [`[${currentQ.id}] Option ${opt.label}: ${updatesDesc} (Conf: ${Math.round(confidence * 100)}%)`, ...prev.slice(0, 14)]);

    // Prepare Trait buffer
    const newTrait = {
      id: `${currentQ.id}_${Date.now()}`,
      trait_category: currentQ.category,
      trait_key: currentQ.key,
      trait_value: `${opt.label}: ${opt.text}`,
      trait_score: confidence,
      confidence: confidence,
    };
    setTraitsBuffer((prev) => [...prev, newTrait]);

    // Prepare Response buffer
    const newResp = {
      id: `resp_${currentQ.id}_${Date.now()}`,
      question_id: currentQ.id,
      module: currentQ.module,
      question_text: currentQ.text,
      raw_answer: `Selected ${opt.label}: ${opt.text}`,
      evidence_format: currentQ.format,
      confidence_rating: confidence,
      latent_updates_json: JSON.stringify(opt.latentUpdates || {}),
    };
    setResponsesBuffer((prev) => [...prev, newResp]);

    setTimeout(() => {
      setAvatarState('SPEAKING');
      advanceNext();
    }, 450);
  };

  const handleOpenSubmit = () => {
    if (!openTextVal.trim()) return;
    setAvatarState('THINKING');

    const raw = openTextVal.trim();
    setExtractionLog((prev) => [`[${currentQ.id}] Extracted Text: "${raw.slice(0, 30)}..."`, ...prev.slice(0, 14)]);

    if (currentQ.category === 'relationship_addressing') {
      const newAddr = {
        id: `addr_${currentQ.key}_${Date.now()}`,
        relationship_tier: currentQ.key === 'addressing_best_friend' ? 'best_friend' : 'self',
        how_i_address_them: currentQ.key === 'addressing_best_friend' ? raw : undefined,
        how_they_address_me: currentQ.key === 'addressing_self_preference' ? raw : undefined,
      };
      setAddressingBuffer((prev) => [...prev, newAddr]);
    } else {
      const newTrait = {
        id: `${currentQ.id}_${Date.now()}`,
        trait_category: currentQ.category,
        trait_key: currentQ.key,
        trait_value: raw,
        trait_score: 1.0,
        confidence: 0.9,
      };
      setTraitsBuffer((prev) => [...prev, newTrait]);
    }

    const newResp = {
      id: `resp_${currentQ.id}_${Date.now()}`,
      question_id: currentQ.id,
      module: currentQ.module,
      question_text: currentQ.text,
      raw_answer: raw,
      evidence_format: currentQ.format,
      confidence_rating: 0.9,
      latent_updates_json: JSON.stringify({ extracted_raw: raw }),
    };
    setResponsesBuffer((prev) => [...prev, newResp]);
    setOpenTextVal('');

    setTimeout(() => {
      setAvatarState('SPEAKING');
      advanceNext();
    }, 450);
  };

  const advanceNext = () => {
    if (currentIndex < CORE_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setAvatarState('SASSY');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setAvatarState('THINKING');
      await invoke('save_onboarding_profile', {
        traits: traitsBuffer,
        addressing: addressingBuffer,
        responses: responsesBuffer,
      });
      alert('✅ Behavioral profile saved permanently to SQLCipher vault!');
      setAvatarState('SPEAKING');
    } catch (err: any) {
      alert('Error saving onboarding: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
      setAvatarState('LISTENING');
    }
  };

  const handlePreviewPrompt = async () => {
    try {
      setAvatarState('THINKING');
      // Save buffers first if needed or just query
      await invoke('save_onboarding_profile', {
        traits: traitsBuffer,
        addressing: addressingBuffer,
        responses: responsesBuffer,
      });
      const prompt: string = await invoke('get_mirror_system_prompt', { tier: 'self' });
      setPreviewPrompt(prompt);
      setAvatarState('SPEAKING');
    } catch (err: any) {
      alert('Error previewing prompt: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel: Conversational Interviewer */}
      <div style={styles.leftPanel}>
        <div style={styles.avatarBox}>
          <AvatarFace state={avatarState} size={150} />
          <div style={styles.moduleBadge}>
            Module {currentQ?.module || 1} • Question {currentIndex + 1} of {CORE_QUESTIONS.length}
          </div>
        </div>

        {currentQ ? (
          <div style={styles.questionCard}>
            <div style={styles.questionCategory}>[{currentQ.category.toUpperCase()}]</div>
            <h2 style={styles.questionText}>{currentQ.text}</h2>

            {currentQ.format === 'open' ? (
              <div style={styles.openInputBox}>
                <input
                  type="text"
                  placeholder="Type your authentic response right here..."
                  value={openTextVal}
                  onChange={(e) => setOpenTextVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenSubmit()}
                  style={styles.textInput}
                />
                <button style={styles.submitBtn} onClick={handleOpenSubmit}>
                  Emit Evidence ➔
                </button>
              </div>
            ) : (
              <div style={styles.optionsGrid}>
                {currentQ.options?.map((opt) => (
                  <button
                    key={opt.label}
                    style={currentQ.format === 'pairwise' ? styles.pairwiseCard : styles.mcqCard}
                    onClick={() => handleSelectOption(opt)}
                  >
                    <span style={styles.optLabel}>{opt.label}</span>
                    <span style={styles.optText}>{opt.text}</span>
                  </button>
                ))}
              </div>
            )}

            {currentQ.format !== 'open' && (
              <div style={styles.confidenceRow}>
                <label style={styles.confLabel}>
                  My Confidence in this response: <strong>{Math.round(confidence * 100)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.60"
                  max="1.0"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  style={styles.slider}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={styles.completedBox}>
            <h2>🎉 Behavioral Onboarding Complete!</h2>
            <p>Your 26-question high-signal behavioral fingerprint has been extracted.</p>
          </div>
        )}

        <div style={styles.bottomBar}>
          <button style={styles.saveBtn} onClick={handleSaveProfile}>
            💾 Save Profile to SQLCipher
          </button>
          <button style={styles.previewBtn} onClick={handlePreviewPrompt}>
            🧬 Test My Clone (Preview System Prompt)
          </button>
        </div>

        {previewPrompt && (
          <div style={styles.promptPreviewBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#7DD3FC' }}>Compiled System Prompt (PersonaChat Terse Distillation):</strong>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setPreviewPrompt(null)}>✕</button>
            </div>
            <pre style={styles.promptText}>{previewPrompt}</pre>
          </div>
        )}
      </div>

      {/* Right Panel: Live Behavioral Case File */}
      <div style={styles.rightPanel}>
        <h3 style={styles.caseTitle}>📋 Live Behavioral Case File</h3>
        
        <div style={styles.section}>
          <div style={styles.secHeader}>OCEAN Trait Profiler (Live Shifts)</div>
          {Object.entries(ocean).map(([key, val]) => (
            <div key={key} style={styles.barRow}>
              <span style={styles.barLabel}>{key === 'O' ? 'Openness' : key === 'C' ? 'Conscientiousness' : key === 'E' ? 'Extraversion' : key === 'A' ? 'Agreeableness' : 'Neuroticism'}</span>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${val}%`, backgroundColor: key === 'O' ? '#7DD3FC' : key === 'C' ? '#34D399' : key === 'E' ? '#FBBF24' : key === 'A' ? '#A78BFA' : '#F87171' }} />
              </div>
              <span style={styles.barValue}>{val}</span>
            </div>
          ))}
        </div>

        <div style={styles.section}>
          <div style={styles.secHeader}>Cognitive & MBTI Axis Leans</div>
          <div style={styles.leanGrid}>
            <div style={styles.leanBox}><strong>System 1 vs 2:</strong> {mbtiLeans.J >= mbtiLeans.P ? `Analytical (System 2 +${mbtiLeans.J})` : `Intuitive Gut (System 1 +${mbtiLeans.P})`}</div>
            <div style={styles.leanBox}><strong>Logic vs Tact:</strong> {mbtiLeans.T >= mbtiLeans.F ? `Direct Logic (T +${mbtiLeans.T})` : `Diplomatic Tact (F +${mbtiLeans.F})`}</div>
            <div style={styles.leanBox}><strong>Data vs Intuition:</strong> {mbtiLeans.S >= mbtiLeans.N ? `Empirical (S +${mbtiLeans.S})` : `Abstract (N +${mbtiLeans.N})`}</div>
          </div>
        </div>

        <div style={styles.sectionLog}>
          <div style={styles.secHeader}>⚡ Live Extraction & Latent Update Log</div>
          <div style={styles.logList}>
            {extractionLog.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>Answer questions to emit live behavioral updates...</div>
            ) : (
              extractionLog.map((log, idx) => (
                <div key={idx} style={styles.logItem}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    backgroundColor: 'var(--color-bg-base)',
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 32px',
    overflowY: 'auto',
    borderRight: '1px solid var(--color-border-subtle)',
  },
  rightPanel: {
    width: 360,
    backgroundColor: 'var(--color-bg-surface)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    overflowY: 'auto',
  },
  avatarBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  moduleBadge: {
    marginTop: 8,
    padding: '4px 12px',
    borderRadius: 12,
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: 600,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 12,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  questionCategory: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.4,
    margin: 0,
    color: '#fff',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  mcqCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--color-border-subtle)',
    color: '#fff',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pairwiseCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 20px',
    borderRadius: 10,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    border: '1px solid rgba(167, 139, 250, 0.25)',
    color: '#fff',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 15,
  },
  optLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'var(--color-accent-blue)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
  },
  optText: {
    flex: 1,
    lineHeight: 1.4,
  },
  openInputBox: {
    display: 'flex',
    gap: 10,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid var(--color-border-subtle)',
    backgroundColor: 'var(--color-bg-base)',
    color: '#fff',
    fontSize: 14,
  },
  submitBtn: {
    padding: '12px 20px',
    borderRadius: 8,
    backgroundColor: 'var(--color-accent-blue)',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
  },
  confidenceRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  confLabel: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  bottomBar: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  },
  saveBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: 8,
    backgroundColor: '#10B981',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
  },
  previewBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: 8,
    backgroundColor: '#6366F1',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
  },
  promptPreviewBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--color-accent-blue)',
  },
  promptText: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 10,
    fontFamily: 'monospace',
  },
  caseTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: 12,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  secHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
  },
  barLabel: {
    width: 105,
    color: 'var(--color-text-secondary)',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  barValue: {
    width: 28,
    textAlign: 'right',
    fontWeight: 600,
  },
  leanGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  leanBox: {
    padding: '8px 10px',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--color-border-subtle)',
    fontSize: 12,
  },
  sectionLog: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  logList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    overflowY: 'auto',
    maxHeight: 220,
  },
  logItem: {
    fontSize: 11,
    padding: '6px 8px',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderLeft: '2px solid #7DD3FC',
    fontFamily: 'monospace',
    color: '#CBD5E1',
  },
  completedBox: {
    padding: 32,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    border: '1px solid var(--color-border-subtle)',
  },
};
