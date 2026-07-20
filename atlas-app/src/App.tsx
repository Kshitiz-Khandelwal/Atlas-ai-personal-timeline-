import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { SetupPage } from './components/SetupPage';
import { UnlockPage } from './components/UnlockPage';
import { ChatPanel } from './components/ChatPanel';
import { TimelineView } from './components/TimelineView';
import { NetworkGraph } from './components/NetworkGraph';
import { SettingsPage } from './components/SettingsPage';
import { PersonalityCloner } from './components/PersonalityCloner';
import { FirstRunShowcase } from './components/FirstRunShowcase';
import './App.css';

export type ActiveTab = 'SHOWCASE' | 'CLONE' | 'CHAT' | 'TIMELINE' | 'GRAPH' | 'SETTINGS' | 'ENGINES';

export const App: React.FC = () => {
  const [vaultExists, setVaultExists] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('SHOWCASE');

  // Phase 2/4/5 UI States for ENGINES test tab
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingPath, setRecordingPath] = useState<string | null>(null);
  const [observedFiles, setObservedFiles] = useState<string[]>([]);
  const [embedText, setEmbedText] = useState<string>('');
  const [embedResult, setEmbedResult] = useState<string | null>(null);

  useEffect(() => {
    checkState();
    let unlisten: (() => void) | undefined;
    async function setupListeners() {
      unlisten = await listen<string>('fs-change', (event) => {
        setObservedFiles((prev) => [event.payload, ...prev.slice(0, 9)]);
      });
    }
    setupListeners();

    // Global escape key listener & blur handler to hide app like OS spotlight
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if ('__TAURI_INTERNALS__' in window) {
          import('@tauri-apps/api/window').then(mod => {
            mod.getCurrentWindow().hide().catch(() => {});
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Listen for window blur (clicking outside Atlas window) if in desktop mode
    let unlistenFocus: (() => void) | undefined;
    if ('__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/window').then(mod => {
        mod.getCurrentWindow().onFocusChanged(({ payload: focused }) => {
          if (!focused && localStorage.getItem('atlas_blur_hide') !== 'false') {
            mod.getCurrentWindow().hide().catch(() => {});
          }
        }).then(u => { unlistenFocus = u; });
      });
    }

    return () => {
      if (unlisten) unlisten();
      if (unlistenFocus) unlistenFocus();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const checkState = async () => {
    try {
      const res: any = await invoke('check_vault_state');
      const exists = Array.isArray(res) ? Boolean(res[0]) : Boolean(res);
      const unlocked = Array.isArray(res) ? Boolean(res[1]) : false;
      setVaultExists(exists);
      if (unlocked) setIsUnlocked(true);
    } catch (err) {
      console.error('Failed checking state:', err);
      setVaultExists(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      await invoke('start_voice_recording');
      setIsRecording(true);
    } catch (err: any) {
      alert('Error starting audio: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
    }
  };

  const handleStopRecording = async () => {
    try {
      const path: string = await invoke('stop_voice_recording');
      setIsRecording(false);
      setRecordingPath(path);
    } catch (err: any) {
      alert('Error stopping audio: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
    }
  };

  const handleEmbedAndSearch = async () => {
    if (!embedText.trim()) return;
    try {
      const nodeId = `node_${Date.now()}`;
      await invoke('embed_and_store', { nodeId, text: embedText });
      const results: Array<[string, number]> = await invoke('search_graph_vector', { query: embedText, topK: 3 });
      setEmbedResult(`Stored vector. Nearest: ${JSON.stringify(results)}`);
    } catch (err: any) {
      setEmbedResult('Error: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading Atlas Identity OS Engine...</p>
      </div>
    );
  }

  if (vaultExists === false) {
    return <SetupPage onUnlocked={() => { setVaultExists(true); setIsUnlocked(true); }} />;
  }

  if (!isUnlocked) {
    return <UnlockPage onUnlocked={() => setIsUnlocked(true)} onReset={() => setVaultExists(false)} />;
  }

  const navItems: Array<{ id: ActiveTab; label: string }> = [
    { id: 'SHOWCASE', label: '🚀 Demo Showcase' },
    { id: 'CLONE', label: '🧬 Persona Clone' },
    { id: 'CHAT', label: '✨ Mirror Chat' },
    { id: 'TIMELINE', label: '⏳ Timeline' },
    { id: 'GRAPH', label: '🕸️ Network Graph' },
    { id: 'ENGINES', label: '🛠️ Core Engines' },
    { id: 'SETTINGS', label: '⚙️ Settings' },
  ];

  return (
    <div className="atlas-app-root" style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.avatarMini} />
          <span style={styles.logoText}>Atlas Identity OS</span>
          <span style={styles.phaseBadge}>v0.5 Glassmorphic</span>
        </div>
        
        <div style={styles.navBar}>
          <div className="nav-tabs-group">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-btn${activeTab === item.id ? ' active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            className="lock-btn"
            onClick={async () => {
              await invoke('lock_vault');
              setIsUnlocked(false);
            }}
          >
            🔒 Lock Vault
          </button>
        </div>
      </header>

      <main className="atlas-main-content" style={styles.mainContent}>
        {activeTab === 'SHOWCASE' ? (
          <FirstRunShowcase onNavigateTab={(tab) => setActiveTab(tab)} />
        ) : activeTab === 'CLONE' ? (
          <PersonalityCloner />
        ) : activeTab === 'CHAT' ? (
          <ChatPanel />
        ) : activeTab === 'TIMELINE' ? (
          <TimelineView />
        ) : activeTab === 'GRAPH' ? (
          <NetworkGraph />
        ) : activeTab === 'SETTINGS' ? (
          <SettingsPage onLock={async () => { await invoke('lock_vault'); setIsUnlocked(false); }} />
        ) : (
          <div style={styles.gridContainer}>
          
            {/* Card 1: Voice Diary Capture */}
            <div className="glass-card" style={styles.card}>
              <h3 style={styles.cardTitle}>Voice Diary Capture (`cpal`)</h3>
              <p style={styles.cardDesc}>Record raw microphone PCM audio to local 16kHz WAV format.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                {!isRecording ? (
                  <button style={styles.recordBtn} onClick={handleStartRecording}>
                    🎙️ Start Recording
                  </button>
                ) : (
                  <button style={styles.stopBtn} onClick={handleStopRecording}>
                    ⏹ Stop & Save WAV
                  </button>
                )}
              </div>
              {recordingPath && (
                <div style={styles.pathBox}>
                  Saved locally: <code>{recordingPath}</code>
                </div>
              )}
            </div>

            {/* Card 2: Vector Search (`sqlite-vec` + `ort`) */}
            <div className="glass-card" style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={styles.cardTitle}>Vector Graph Search (`sqlite-vec`)</h3>
                <button
                  style={{ ...styles.lockButton, borderColor: 'var(--color-accent-cyan)', color: 'var(--color-accent-cyan)' }}
                  onClick={async () => {
                    setEmbedResult('Downloading/Loading bge-small-en-v1.5.onnx (~133MB)... please wait...');
                    try {
                      const msg: string = await invoke('load_embedding_model');
                      setEmbedResult(msg);
                    } catch (err: any) {
                      setEmbedResult('Error loading model: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
                    }
                  }}
                >
                  📥 Load ONNX Model
                </button>
              </div>
              <p style={styles.cardDesc}>Embed text via local ONNX and query top-K nearest neighbors.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Enter thought or memory..."
                  value={embedText}
                  onChange={(e) => setEmbedText(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border-subtle)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--color-text-primary)' }}
                />
                <button style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #38bdf8, #818cf8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={handleEmbedAndSearch}>Embed & Search</button>
              </div>
              {embedResult && <div style={styles.pathBox}>{embedResult}</div>}
            </div>

            {/* Card 3: Filesystem Watcher (`notify`) */}
            <div className="glass-card" style={styles.cardFull}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={styles.cardTitle}>Filesystem Watcher (`notify`)</h3>
                  <p style={styles.cardDesc}>Monitoring directory: <code>~/Atlas-Observed/</code> for new .md, .txt, .pdf drops.</p>
                </div>
                <span style={styles.liveDot} />
              </div>
              <div style={styles.fileList}>
                {observedFiles.length === 0 ? (
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>No recent files observed... Drop any .md file in your Atlas-Observed folder to test!</span>
                ) : (
                  observedFiles.map((file, i) => (
                    <div key={i} style={styles.fileItem}>
                      📄 <code>{file}</code>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg-base)',
    gap: 'var(--spacing-md)',
  },
  spinner: {
    width: 28,
    height: 28,
    border: '3px solid var(--color-border-subtle)',
    borderTopColor: 'var(--color-accent-cyan)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontFamily: 'var(--font-display)',
    fontSize: 15,
    color: 'var(--color-text-secondary)',
  },
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg-base)',
  },
  header: {
    height: 64,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'rgba(16, 16, 22, 0.8)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
    boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 18,
    background: 'linear-gradient(90deg, #ffffff, #38bdf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  phaseBadge: {
    fontSize: 11,
    fontWeight: 600,
    background: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    padding: '3px 10px',
    borderRadius: 14,
    border: '1px solid rgba(56, 189, 248, 0.3)',
    marginLeft: 6,
  },
  navBar: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
  },
  navTabsGroup: {
    display: 'flex',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 4,
    borderRadius: 10,
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  navBtn: {
    padding: '7px 13px',
    borderRadius: 7,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
    transition: 'all 0.15s ease',
  },
  navBtnActive: {
    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(167, 139, 250, 0.2))',
    color: '#fff',
    border: '1px solid rgba(56, 189, 248, 0.4)',
    boxShadow: '0 2px 10px rgba(56, 189, 248, 0.15)',
  },
  lockButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  mainContent: {
    flex: 1,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--spacing-lg)',
    maxWidth: 960,
    width: '100%',
    alignContent: 'start',
  },
  card: {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardFull: {
    gridColumn: 'span 2',
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
  },
  cardDesc: {
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 1.4,
  },
  recordBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    padding: '9px 18px',
    borderRadius: 8,
    fontWeight: 600,
    border: 'none',
  },
  stopBtn: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    padding: '9px 18px',
    borderRadius: 8,
    fontWeight: 600,
    border: 'none',
    animation: 'pulse 1.5s infinite',
  },
  pathBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    borderRadius: 8,
    fontSize: 12,
    color: '#38bdf8',
    fontFamily: 'var(--font-mono)',
    wordBreak: 'break-all',
  },
  fileList: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  fileItem: {
    padding: '10px 14px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 10px #10b981',
  },
};

export default App;
