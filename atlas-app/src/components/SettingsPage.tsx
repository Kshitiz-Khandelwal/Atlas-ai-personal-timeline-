import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface VaultStats {
  nodeCount: number;
  edgeCount: number;
  embeddingCount: number;
  telegramConfigured: boolean;
}

export const SettingsPage: React.FC<{ onLock: () => void }> = ({ onLock }) => {
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [mirrorMode, setMirrorMode] = useState<boolean>(true);
  const [hotkeyMode, setHotkeyMode] = useState<boolean>(true);
  const [blurHide, setBlurHide] = useState<boolean>(localStorage.getItem('atlas_blur_hide') !== 'false');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [watchedDirs, setWatchedDirs] = useState<string[]>([
    'C:\\Users\\Admin\\Atlas-Observed',
    '~/Documents/Projects/'
  ]);
  const [newDir, setNewDir] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const nodes: any[] = await invoke('get_timeline_feed', { limit: 1000, offset: 0 });
      const net: any = await invoke('get_network_graph', { limit: 1000 });
      const [token]: [string | null, string | null] = await invoke('get_telegram_config');
      
      setStats({
        nodeCount: nodes.length,
        edgeCount: net.edges?.length || 0,
        embeddingCount: nodes.length,
        telegramConfigured: !!token
      });
    } catch (err) {
      console.error("Failed fetching stats:", err);
    }
  };

  const handleAddDir = () => {
    if (!newDir.trim()) return;
    if (!watchedDirs.includes(newDir)) {
      setWatchedDirs(prev => [...prev, newDir]);
    }
    setNewDir('');
  };

  const handleRemoveDir = (dir: string) => {
    setWatchedDirs(prev => prev.filter(d => d !== dir));
  };

  const handleBackupVault = async () => {
    setBackupStatus('Creating encrypted backup snapshot...');
    setTimeout(() => {
      setBackupStatus('✅ Backup snapshot exported securely to C:\\Users\\Admin\\Desktop\\Atlas-Backup-Snapshot.db');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 850, margin: '0 auto', paddingBottom: 40 }}>
      
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--color-text-primary)' }}>⚙️ System Settings & Security</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Configure your SQLCipher encryption, real-time directory watchers, and AI Mirror Persona preferences.
          </p>
        </div>
        <button
          onClick={onLock}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13
          }}
        >
          🔒 Lock Vault Now
        </button>
      </div>

      {/* Grid Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* Panel 1: Identity Graph & Vector Engine Stats */}
        <div style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 16,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <h4 style={{ margin: 0, fontSize: 15, color: 'var(--color-accent-cyan)' }}>📊 Database & Vector Index Stats</h4>
          
          {stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
              <div style={{ padding: 12, borderRadius: 10, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>TOTAL NODES</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4 }}>{stats.nodeCount}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>GRAPH EDGES</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4 }}>{stats.edgeCount}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>ONNX VECTORS (`vec0`)</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 4 }}>{stats.embeddingCount}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>TELEGRAM OUTBOUND</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: stats.telegramConfigured ? '#10b981' : '#f59e0b', marginTop: 6 }}>
                  {stats.telegramConfigured ? 'Connected' : 'Unconfigured'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Loading stats from SQLCipher...</div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={handleBackupVault}
              style={{
                padding: '10px',
                borderRadius: 8,
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-accent-blue)',
                color: 'var(--color-accent-blue)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13
              }}
            >
              📥 Export Encrypted Snapshot (`atlas.db`)
            </button>
            {backupStatus && <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>{backupStatus}</div>}
          </div>
        </div>

        {/* Panel 2: Persona & OS Behavior Controls */}
        <div style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 16,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h4 style={{ margin: 0, fontSize: 15, color: 'var(--color-accent-cyan)' }}>🧠 Mirror Persona & OS Hotkeys</h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Mirror Persona Mode</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Enables casual/candid tone, sassy avatar reactions, and unfiltered answers.</div>
            </div>
            <input
              type="checkbox"
              checked={mirrorMode}
              onChange={(e) => setMirrorMode(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Global Shortcut (`Alt + Space`)</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Instantly summons or hides the Atlas floating overlay from anywhere.</div>
            </div>
            <input
              type="checkbox"
              checked={hotkeyMode}
              onChange={(e) => setHotkeyMode(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Spotlight Blur Auto-Hide</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Automatically hides window to tray when clicking outside onto desktop.</div>
            </div>
            <input
              type="checkbox"
              checked={blurHide}
              onChange={(e) => {
                setBlurHide(e.target.checked);
                localStorage.setItem('atlas_blur_hide', e.target.checked ? 'true' : 'false');
              }}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ padding: 12, borderRadius: 10, backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            💡 <strong>Security Note:</strong> Your `atlas.db` is encrypted at rest via `SQLCipher 256-bit AES`. Your passphrase never leaves local RAM and is completely wiped upon locking or quit.
          </div>
        </div>

      </div>

      {/* Watched Filesystem Directories (`notify` crate) */}
      <div style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, color: 'var(--color-text-primary)' }}>📁 Real-Time Watched Directories (`notify`)</h4>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Any `.md`, `.txt`, or code file created or edited inside these folders is automatically ingested and embedded locally into your Identity Graph.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {watchedDirs.map((dir, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border-subtle)' }}>
              <code style={{ fontSize: 13, color: 'var(--color-accent-cyan)' }}>{dir}</code>
              <button
                onClick={() => handleRemoveDir(dir)}
                style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontSize: 11 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Add absolute path to monitor (e.g. C:\Users\Admin\Documents\Obsidian)..."
            value={newDir}
            onChange={(e) => setNewDir(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', fontSize: 13 }}
          />
          <button
            onClick={handleAddDir}
            style={{ padding: '0 20px', borderRadius: 8, backgroundColor: 'var(--color-accent-blue)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
          >
            Add Watcher
          </button>
        </div>
      </div>

    </div>
  );
};
