import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UnlockPageProps {
  onUnlocked: () => void;
  onReset?: () => void;
}

export const UnlockPage: React.FC<UnlockPageProps> = ({ onUnlocked, onReset }) => {
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await invoke('unlock_vault', { passphrase });
      onUnlocked();
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : (err?.message || 'Invalid passphrase.');
      setError(errMsg);
      if (errMsg.toLowerCase().includes('not initialized') && onReset) {
        setTimeout(() => onReset(), 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Unlock Atlas</h1>
        <p style={styles.subtitle}>
          Enter your master passphrase to unlock your identity graph.
        </p>
        <form onSubmit={handleUnlock} style={styles.form}>
          <div>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Master Passphrase"
              required
              autoFocus
            />
          </div>
          {error && (
            <div style={styles.error}>
              {error}
              {error.toLowerCase().includes('not initialized') && onReset && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={onReset}
                    style={{
                      background: 'none',
                      border: '1px underline var(--color-accent-cyan)',
                      color: 'var(--color-accent-cyan)',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: 0
                    }}
                  >
                    Click here to initialize your vault now →
                  </button>
                </div>
              )}
            </div>
          )}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Decrypting...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg-base)',
    padding: 'var(--spacing-lg)',
  },
  card: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 12,
    padding: 'var(--spacing-xl)',
    maxWidth: 400,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  subtitle: {
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  button: {
    width: '100%',
    padding: '12px',
  },
  error: {
    color: 'var(--color-confidence-low)',
    fontSize: 13,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 'var(--spacing-sm)',
    borderRadius: 6,
  },
};
