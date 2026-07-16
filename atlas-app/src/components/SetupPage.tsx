import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SetupPageProps {
  onUnlocked: () => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({ onUnlocked }) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const handleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters long.');
      return;
    }
    if (passphrase !== confirm) {
      setError('Passphrases do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const phrase: string = await invoke('init_vault', { passphrase });
      setRecoveryPhrase(phrase);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Failed to initialize vault.');
    } finally {
      setLoading(false);
    }
  };

  if (recoveryPhrase) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Your Recovery Phrase</h1>
          <p style={styles.subtitle}>
            If you lose both your passphrase and recovery phrase, your Atlas vault cannot be recovered by anyone, including the developers. Write these down and store them safely.
          </p>
          <div style={styles.recoveryBox}>
            <code>{recoveryPhrase}</code>
          </div>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={savedConfirmed}
              onChange={(e) => setSavedConfirmed(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            I have written down my 24-word recovery phrase.
          </label>
          <button
            style={styles.button}
            disabled={!savedConfirmed}
            onClick={onUnlocked}
          >
            Enter Atlas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Atlas</h1>
        <p style={styles.subtitle}>
          Set a master passphrase to secure your local-first identity OS. Your data is encrypted at rest using Argon2id and SQLCipher AES-256.
        </p>
        <form onSubmit={handleInit} style={styles.form}>
          <div>
            <label style={styles.label}>Master Passphrase</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter at least 8 characters"
              required
            />
          </div>
          <div>
            <label style={styles.label}>Confirm Passphrase</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-type your passphrase"
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Securing Vault...' : 'Initialize Vault'}
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
    maxWidth: 440,
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
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-xs)',
    display: 'block',
  },
  button: {
    marginTop: 'var(--spacing-sm)',
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
  recoveryBox: {
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    padding: 'var(--spacing-md)',
    borderRadius: 8,
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    lineHeight: 1.6,
    wordBreak: 'break-word',
    color: 'var(--color-accent-blue)',
  },
  checkboxLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
};
