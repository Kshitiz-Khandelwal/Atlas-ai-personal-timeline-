import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AvatarFace, AvatarState } from './AvatarFace';

interface FirstRunShowcaseProps {
  onNavigateTab: (tab: 'CLONE' | 'CHAT' | 'TIMELINE' | 'GRAPH' | 'SETTINGS' | 'ENGINES') => void;
}

export const FirstRunShowcase: React.FC<FirstRunShowcaseProps> = ({ onNavigateTab }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [demoAvatarState, setDemoAvatarState] = useState<AvatarState>('NEUTRAL');
  const [toolExecutionLog, setToolExecutionLog] = useState<string | null>(null);
  const [isExecutingTool, setIsExecutingTool] = useState<boolean>(false);

  const handleExecuteDemoTool = async (tool: string, params: any, label: string) => {
    setIsExecutingTool(true);
    setDemoAvatarState('THINKING');
    setToolExecutionLog(`⚡ Executing OS action: ${label}...`);
    try {
      const res: { success: boolean; message: string; action_taken: string } = await invoke('execute_agentic_tool', {
        tool,
        params
      });
      setDemoAvatarState('SPEAKING');
      setToolExecutionLog(`✅ ${res.message} (${res.action_taken})`);
      setTimeout(() => setDemoAvatarState('NEUTRAL'), 3000);
    } catch (err: any) {
      setDemoAvatarState('NEUTRAL');
      const errMsg = typeof err === 'string' ? err : JSON.stringify(err);
      setToolExecutionLog(`⚠️ Execution status: ${errMsg}`);
    } finally {
      setIsExecutingTool(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: '🔐 1. Zero-Trust Local Vault (SQLCipher + Argon2id)',
      subtitle: 'Your identity and memories never leave this machine.',
      content: (
        <div style={S.stepCardContent}>
          <p style={S.bodyText}>
            Unlike cloud AI assistants that mine your chat logs and voice data on remote server farms, Atlas is a <strong>100% local, zero-trust system</strong>. Everything is encrypted inside an AES-256 local database powered by SQLCipher.
          </p>
          <div style={S.featureGrid}>
            <div style={S.featureBox}>
              <span style={S.featureIcon}>🔑</span>
              <div>
                <div style={S.featureTitle}>Argon2id Key Derivation</div>
                <div style={S.featureDesc}>Passphrase is never stored on disk. Encryption keys are derived in RAM with Argon2id memory-hard hashing.</div>
              </div>
            </div>
            <div style={S.featureBox}>
              <span style={S.featureIcon}>🛡️</span>
              <div>
                <div style={S.featureTitle}>BIP-39 Recovery Phrase</div>
                <div style={S.featureDesc}>Full disaster recovery via 24-word standardized mnemonic phrase. Your identity vault is sovereign.</div>
              </div>
            </div>
          </div>
          <div style={S.buttonRow}>
            <button style={S.primaryBtn} onClick={() => setActiveStep(2)}>
              Next: Behavioral Fingerprint →
            </button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: '🧬 2. Behavioral Evidence Engine (Evidence > Opinion)',
      subtitle: 'Extracting how you actually think, not how society says you should.',
      content: (
        <div style={S.stepCardContent}>
          <p style={S.bodyText}>
            Research over the last two years (PersonaChat, BIG5-CHAT, TwinVoice 2025) proves that people are unreliable narrators of their own personality when answering traditional questionnaires. Atlas uses an <strong>adaptive 21-question situational test</strong> that forces realistic trade-offs to extract verifiable behavioral evidence.
          </p>
          <div style={S.metricsPreview}>
            <div style={S.metricBarBox}>
              <div style={S.metricLabelRow}><span>Brutal Honesty vs Diplomacy</span><span style={S.metricVal}>85% Direct</span></div>
              <div style={S.metricBarBg}><div style={{ ...S.metricBarFill, width: '85%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }} /></div>
            </div>
            <div style={S.metricBarBox}>
              <div style={S.metricLabelRow}><span>System 1 Intuition vs System 2 Logic</span><span style={S.metricVal}>72% Analytical</span></div>
              <div style={S.metricBarBg}><div style={{ ...S.metricBarFill, width: '72%', background: 'linear-gradient(90deg, #818cf8, #a78bfa)' }} /></div>
            </div>
          </div>
          <div style={S.buttonRow}>
            <button style={S.secondaryBtn} onClick={() => setActiveStep(1)}>← Back</button>
            <button style={S.primaryBtn} onClick={() => setActiveStep(3)}>Next: Mirror Persona Chat →</button>
            <button style={S.outlineBtn} onClick={() => onNavigateTab('CLONE')}>Jump to Clone Tab 🧬</button>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: '💬 3. Mirror Persona Chat & Sassy Avatar',
      subtitle: 'Atlas addresses you exactly as you want (`ok bhai`) with local 8B LLMs.',
      content: (
        <div style={S.stepCardContent}>
          <p style={S.bodyText}>
            Atlas distills your behavioral DNA into a terse 6–8 line system prompt (`compile_mirror_persona_prompt`) injected directly into local Ollama (`llama3.1:8b`, `qwen3:8b`). At the same time, our real-time sentiment driver (`inferAvatarState`) animates your digital twin avatar across 5 distinct emotional states.
          </p>
          <div style={S.avatarDemoRow}>
            <div style={S.avatarPreviewBox}>
              <AvatarFace state={demoAvatarState} size={120} />
              <div style={S.avatarStateBadge}>State: {demoAvatarState}</div>
            </div>
            <div style={S.avatarBtnColumn}>
              <div style={S.avatarHint}>Click below to test live avatar expressions:</div>
              <div style={S.avatarButtons}>
                {(['NEUTRAL', 'LISTENING', 'THINKING', 'SPEAKING', 'SASSY'] as AvatarState[]).map(st => (
                  <button
                    key={st}
                    onClick={() => setDemoAvatarState(st)}
                    style={{
                      ...S.avatarStateBtn,
                      ...(demoAvatarState === st ? S.avatarStateBtnActive : {})
                    }}
                  >
                    {st === 'SASSY' ? '🔥 SASSY (Sarcasm)' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={S.buttonRow}>
            <button style={S.secondaryBtn} onClick={() => setActiveStep(2)}>← Back</button>
            <button style={S.primaryBtn} onClick={() => setActiveStep(4)}>Next: Agentic PC Control →</button>
            <button style={S.outlineBtn} onClick={() => onNavigateTab('CHAT')}>Jump to Chat Tab ✨</button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: '⚡ 4. Agentic OS Control (`agentic.rs`)',
      subtitle: 'Native Windows automation executed silently right from your chat instructions.',
      content: (
        <div style={S.stepCardContent}>
          <p style={S.bodyText}>
            When you say <em>"Atlas, put on some chill beats and open VS Code"</em>, Atlas parses <code>{'<TOOL_CALL>'}</code> blocks from Ollama and executes real native Windows system actions using Rust's `Command` and powershell bindings. Try clicking the live test buttons below:
          </p>
          <div style={S.toolActionGrid}>
            <button
              style={S.toolActionCard}
              disabled={isExecutingTool}
              onClick={() => handleExecuteDemoTool('launch_app', { app: 'vscode' }, 'VS Code Launch')}
            >
              <span style={S.toolActionIcon}>💻</span>
              <div style={S.toolActionText}>
                <strong>Launch VS Code</strong>
                <span>Spawns `code` process</span>
              </div>
            </button>

            <button
              style={S.toolActionCard}
              disabled={isExecutingTool}
              onClick={() => handleExecuteDemoTool('open_folder', { path: 'desktop' }, 'Open Desktop')}
            >
              <span style={S.toolActionIcon}>📁</span>
              <div style={S.toolActionText}>
                <strong>Open Desktop Folder</strong>
                <span>Spawns Windows Explorer</span>
              </div>
            </button>

            <button
              style={S.toolActionCard}
              disabled={isExecutingTool}
              onClick={() => handleExecuteDemoTool('control_volume', { mute: true }, 'Volume Toggle Mute')}
            >
              <span style={S.toolActionIcon}>🔊</span>
              <div style={S.toolActionText}>
                <strong>Toggle Mute Volume</strong>
                <span>Calls CoreAudio API</span>
              </div>
            </button>

            <button
              style={S.toolActionCard}
              disabled={isExecutingTool}
              onClick={() => handleExecuteDemoTool('play_music', { playlist: 'lofi beats' }, 'Spotify Lofi Beats')}
            >
              <span style={S.toolActionIcon}>🎧</span>
              <div style={S.toolActionText}>
                <strong>Play Spotify Beats</strong>
                <span>Opens `spotify://` URI</span>
              </div>
            </button>
          </div>

          {toolExecutionLog && (
            <div style={S.executionLogBox}>
              <code>{toolExecutionLog}</code>
            </div>
          )}

          <div style={S.buttonRow}>
            <button style={S.secondaryBtn} onClick={() => setActiveStep(3)}>← Back</button>
            <button style={S.primaryBtn} onClick={() => setActiveStep(5)}>Next: Voice & Memory Graph →</button>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: '🎙️ 5. Voice Diary & Vector Memory Graph',
      subtitle: 'Push-to-talk audio (`cpal`), local Whisper, and sqlite-vec KNN vector retrieval.',
      content: (
        <div style={S.stepCardContent}>
          <p style={S.bodyText}>
            Every voice note or text reflection is embedded via local ONNX (`bge-small-en-v1.5`) into 384-dimensional vectors stored inside `sqlite-vec`. When you ask a question, Atlas retrieves top nearest neighbors with hybrid semantic + recency reranking.
          </p>
          <div style={S.completionBanner}>
            <div style={S.completionTitle}>🎉 Your Digital Twin Architecture is Live!</div>
            <div style={S.completionSub}>
              You have unlocked all 5 core engines of Atlas Identity OS. Select your starting tab below to begin pair-programming or journaling with your mirror twin.
            </div>
          </div>
          <div style={S.finalButtonsRow}>
            <button style={S.launchMainBtn} onClick={() => onNavigateTab('CLONE')}>
              🧬 Start Persona Onboarding
            </button>
            <button style={{ ...S.launchMainBtn, background: 'linear-gradient(135deg, #a78bfa, #818cf8)' }} onClick={() => onNavigateTab('CHAT')}>
              ✨ Open Mirror Chat & Voice
            </button>
            <button style={S.secondaryBtn} onClick={() => onNavigateTab('TIMELINE')}>
              ⏳ View Timeline
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={S.container}>
      {/* Top Banner */}
      <div style={S.heroHeader}>
        <div style={S.badgeText}>🚀 FIRST RUN SHOWCASE & ARCHITECTURE DEMO</div>
        <h1 style={S.heroTitle}>Welcome to Atlas Identity OS</h1>
        <p style={S.heroSubtitle}>
          A local-first digital twin that learns your behavioral fingerprint, thinks like you do, and controls your PC.
        </p>
      </div>

      {/* Step Indicator Tabs */}
      <div style={S.stepTabsBar}>
        {steps.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveStep(s.id)}
            style={{
              ...S.stepTab,
              ...(activeStep === s.id ? S.stepTabActive : {})
            }}
          >
            <span style={S.stepNum}>{s.id}</span>
            <span style={S.stepTabTitle}>{s.title.split('. ')[1] || s.title}</span>
          </button>
        ))}
      </div>

      {/* Active Step Card */}
      <div style={S.cardBox}>
        <div style={S.cardHeaderRow}>
          <div>
            <h2 style={S.cardTitle}>{steps.find(s => s.id === activeStep)?.title}</h2>
            <div style={S.cardSubtitle}>{steps.find(s => s.id === activeStep)?.subtitle}</div>
          </div>
          <span style={S.stepCountBadge}>Step {activeStep} of {steps.length}</span>
        </div>
        {steps.find(s => s.id === activeStep)?.content}
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    paddingBottom: 40,
  },
  heroHeader: {
    textAlign: 'center',
    padding: '24px 20px',
    background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, rgba(20, 20, 28, 0.4) 100%)',
    borderRadius: 16,
    border: '1px solid rgba(125, 211, 252, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: '#38bdf8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 700,
    background: 'linear-gradient(90deg, #ffffff, #38bdf8, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'var(--color-text-secondary)',
    maxWidth: 640,
    margin: '0 auto',
    lineHeight: 1.5,
  },
  stepTabsBar: {
    display: 'flex',
    gap: 8,
    background: 'var(--color-bg-surface)',
    padding: 6,
    borderRadius: 12,
    border: '1px solid var(--color-border-subtle)',
    overflowX: 'auto',
  },
  stepTab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    minWidth: 140,
  },
  stepTabActive: {
    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.15))',
    color: '#fff',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    boxShadow: '0 2px 12px rgba(56, 189, 248, 0.1)',
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
  },
  stepTabTitle: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardBox: {
    background: 'rgba(20, 20, 28, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 28,
    backdropFilter: 'blur(20px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    marginTop: 4,
  },
  stepCountBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text-secondary)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  stepCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 1.6,
    color: 'var(--color-text-primary)',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  featureBox: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.4,
  },
  buttonRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)',
    transition: 'transform 0.1s ease',
  },
  secondaryBtn: {
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
  },
  outlineBtn: {
    background: 'transparent',
    color: '#38bdf8',
    padding: '10px 18px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: '1px solid #38bdf8',
    cursor: 'pointer',
  },
  metricsPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    background: 'rgba(0,0,0,0.3)',
    padding: 18,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  metricBarBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  metricLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
  },
  metricVal: {
    color: '#38bdf8',
    fontFamily: 'var(--font-mono)',
  },
  metricBarBg: {
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  avatarDemoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    background: 'rgba(0,0,0,0.3)',
    padding: 24,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  avatarPreviewBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  avatarStateBadge: {
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    color: '#a78bfa',
    background: 'rgba(167, 139, 250, 0.15)',
    padding: '4px 10px',
    borderRadius: 12,
    border: '1px solid rgba(167, 139, 250, 0.3)',
  },
  avatarBtnColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  avatarHint: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  avatarButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarStateBtn: {
    padding: '8px 14px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text-primary)',
    border: '1px solid rgba(255,255,255,0.12)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  avatarStateBtnActive: {
    background: '#38bdf8',
    color: '#000',
    borderColor: '#38bdf8',
    boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)',
  },
  toolActionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 14,
  },
  toolActionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  toolActionIcon: {
    fontSize: 28,
    background: 'rgba(255,255,255,0.06)',
    width: 48,
    height: 48,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolActionText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  executionLogBox: {
    padding: 12,
    borderRadius: 8,
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
  },
  completionBanner: {
    padding: 24,
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.15))',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    textAlign: 'center',
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  completionSub: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  },
  finalButtonsRow: {
    display: 'flex',
    gap: 14,
    justifyContent: 'center',
    marginTop: 8,
  },
  launchMainBtn: {
    background: 'linear-gradient(135deg, #38bdf8, #60a5fa)',
    color: '#000',
    padding: '12px 24px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
  }
};
