import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SetupPage } from './components/SetupPage';
import { UnlockPage } from './components/UnlockPage';
import './App.css';

export const App: React.FC = () => {
  const [dbExists, setDbExists] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkState = async () => {
    try {
      const [exists, unlocked]: [boolean, boolean] = await invoke('check_vault_state');
      setDbExists(exists);
      setIsUnlocked(unlocked);
    } catch (err) {
      console.error('Failed to check vault state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkState();
  }, []);

  if (loading || dbExists === null) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Initializing Atlas Vault...</p>
      </div>
    );
  }

  if (!dbExists) {
    return <SetupPage onUnlocked={() => { setDbExists(true); setIsUnlocked(true); }} />;
  }

  if (!isUnlocked) {
    return <UnlockPage onUnlocked={() => setIsUnlocked(true)} />;
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.avatarMini} />
          <span style={styles.logoText}>Atlas identity OS</span>
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
      </header>
      <main style={styles.mainContent}>
        <div style={styles.emptyStateCard}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Vault Active & Encrypted</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 8 }}>
            Phase 1 Core is initialized. Your local-first database is running with SQLCipher AES-256 and Argon2id.
          </p>
          <div style={styles.statusRow}>
            <span style={styles.statusDot} />
            <span style={{ fontSize: 13, color: 'var(--color-confidence-high)' }}>Local SQLite Vault Unlocked</span>
          </div>
        </div>
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
  },
  header: {
    height: 56,
    borderBottom: '1px solid var(--color-border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-bg-surface)',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateCard: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 12,
    padding: 'var(--spacing-xl)',
    maxWidth: 500,
    width: '100%',
    textAlign: 'center',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'var(--spacing-lg)',
    padding: 'var(--spacing-sm)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-confidence-high)',
  },
};

export default App;
