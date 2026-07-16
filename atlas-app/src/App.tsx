import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { SetupPage } from './components/SetupPage';
import { UnlockPage } from './components/UnlockPage';
import { ChatPanel } from './components/ChatPanel';
import { TimelineView } from './components/TimelineView';
import { NetworkGraph } from './components/NetworkGraph';
import { SettingsPage } from './components/SettingsPage';
import './App.css';

export const App: React.FC = () => {
  const [vaultExists, setVaultExists] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'TIMELINE' | 'GRAPH' | 'SETTINGS' | 'ENGINES'>('CHAT');

  // Phase 2 UI States
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
        <p style={styles.loadingText}>Loading Atlas Core Engine...</p>
      </div>
    );
  }

  if (vaultExists === false) {
    return <SetupPage onUnlocked={() => { setVaultExists(true); setIsUnlocked(true); }} />;
  }

  if (!isUnlocked) {
    return <UnlockPage onUnlocked={() => setIsUnlocked(true)} onReset={() => setVaultExists(false)} />;
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.avatarMini} />
          <span style={styles.logoText}>Atlas identity OS</span>
          <span style={styles.phaseBadge}>Phase 5 Active</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-base)', padding: 4, borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
            <button
              onClick={() => setActiveTab('CHAT')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: activeTab === 'CHAT' ? 'var(--color-accent-blue)' : 'transparent',
                color: activeTab === 'CHAT' ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              ✨ Avatar & Chat
            </button>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: activeTab === 'TIMELINE' ? 'var(--color-accent-blue)' : 'transparent',
                color: activeTab === 'TIMELINE' ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              ⏳ Timeline
            </button>
            <button
              onClick={() => setActiveTab('GRAPH')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: activeTab === 'GRAPH' ? 'var(--color-accent-blue)' : 'transparent',
                color: activeTab === 'GRAPH' ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              🕸️ Network
            </button>
            <button
              onClick={() => setActiveTab('SETTINGS')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: activeTab === 'SETTINGS' ? 'var(--color-accent-blue)' : 'transparent',
                color: activeTab === 'SETTINGS' ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => setActiveTab('ENGINES')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: activeTab === 'ENGINES' ? 'var(--color-accent-blue)' : 'transparent',
                color: activeTab === 'ENGINES' ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              🛠️ Engines
            </button>
          </div>
          <button
            style={styles.lockButton}
            onClick={async () => {
              await invoke('lock_vault');
              setIsUnlocked(false);
            }}
          >
            Lock Vault
          </button>
        </div>
      </header>

      <main style={styles.mainContent}>
        {activeTab === 'CHAT' ? (
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
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Voice Diary Capture (`cpal`)</h3>
            <p style={styles.cardDesc}>Record raw microphone PCM audio to local 16kHz WAV format.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {!isRecording ? (
                <button style={styles.recordBtn} onClick={handleStartRecording}>
                  Start Recording
                </button>
              ) : (
                <button style={styles.stopBtn} onClick={handleStopRecording}>
                  Stop & Save WAV
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
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={styles.cardTitle}>Vector Graph Search (`sqlite-vec`)</h3>
              <button
                style={{ ...styles.lockButton, borderColor: 'var(--color-accent-blue)', color: 'var(--color-accent-blue)' }}
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
                Download & Load Model
              </button>
            </div>
            <p style={styles.cardDesc}>Embed text via local ONNX and query top-K nearest neighbors.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input
                type="text"
                placeholder="Enter thought or memory..."
                value={embedText}
                onChange={(e) => setEmbedText(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
              />
              <button style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: 'var(--color-accent-blue)', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={handleEmbedAndSearch}>Embed & Store</button>
            </div>
            {embedResult && <div style={styles.pathBox}>{embedResult}</div>}
          </div>

          {/* Card 3: Filesystem Watcher (`notify`) */}
          <div style={styles.cardFull}>
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
    width: 24,
    height: 24,
    border: '2px solid var(--color-border-subtle)',
    borderTopColor: 'var(--color-accent-blue)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg-base)',
    overflowY: 'auto',
  },
  header: {
    height: 56,
    borderBottom: '1px solid var(--color-border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-bg-surface)',
    flexShrink: 0,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent-blue)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 16,
    color: 'var(--color-text-primary)',
  },
  phaseBadge: {
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: 'var(--color-accent-blue)',
    padding: '2px 8px',
    borderRadius: 12,
    marginLeft: 8,
  },
  lockButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-subtle)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    padding: '6px 12px',
  },
  mainContent: {
    flex: 1,
    padding: 'var(--spacing-xl)',
    display: 'flex',
    justifyContent: 'center',
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
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 12,
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardFull: {
    gridColumn: 'span 2',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 12,
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  cardDesc: {
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    marginTop: 4,
  },
  recordBtn: {
    backgroundColor: 'hsl(142, 60%, 45%)',
  },
  stopBtn: {
    backgroundColor: 'hsl(0, 70%, 50%)',
    animation: 'pulse 1.5s infinite',
  },
  pathBox: {
    marginTop: 16,
    padding: 10,
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--color-accent-blue)',
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
    padding: '8px 12px',
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    border: '1px solid var(--color-border-subtle)',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'hsl(142, 60%, 45%)',
  },
};

export default App;
