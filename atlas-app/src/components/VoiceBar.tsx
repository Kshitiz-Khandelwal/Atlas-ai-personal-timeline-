import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export type VoiceBarState = 'idle' | 'recording' | 'transcribing' | 'error';

interface VoiceBarProps {
  /** Called when transcription completes — text goes straight into chat */
  onTranscribed: (text: string) => void;
  /** Called when recording starts — lets parent shift AvatarFace to LISTENING */
  onRecordingStart?: () => void;
  /** Called when recording stops — lets parent shift AvatarFace to THINKING */
  onRecordingStop?: () => void;
  disabled?: boolean;
}

export const VoiceBar: React.FC<VoiceBarProps> = ({
  onTranscribed,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
}) => {
  const [state, setState] = useState<VoiceBarState>('idle');
  const [statusText, setStatusText] = useState('Hold to talk, release to transcribe');
  const [wavBars] = useState(() => Array.from({ length: 20 }, () => Math.random()));
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Keyboard shortcut: Ctrl+Shift+Space
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space' && state === 'idle' && !disabled) {
        e.preventDefault();
        await handleStartRecording();
      }
      if (e.ctrlKey && e.shiftKey && e.code === 'Space' && state === 'recording' && !disabled) {
        e.preventDefault();
        await handleStopAndTranscribe();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, disabled]);

  const handleStartRecording = async () => {
    if (state !== 'idle' || disabled) return;
    try {
      await invoke('start_voice_recording');
      setState('recording');
      setStatusText('Recording... press again to stop & transcribe');
      onRecordingStart?.();
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch (err: any) {
      setState('error');
      setStatusText('Microphone error: ' + (typeof err === 'string' ? err : JSON.stringify(err)));
      setTimeout(() => { setState('idle'); setStatusText('Hold to talk, release to transcribe'); }, 3000);
    }
  };

  const handleStopAndTranscribe = async () => {
    if (state !== 'recording') return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState('transcribing');
    setStatusText('Transcribing via local Whisper...');
    onRecordingStop?.();

    try {
      // stop_and_transcribe: stops recording + sends to Ollama Whisper in one call
      const text: string = await invoke('stop_and_transcribe');
      setState('idle');
      setElapsedMs(0);
      setStatusText('Hold to talk, release to transcribe');
      onTranscribed(text);
    } catch (err: any) {
      // Fallback: just stop recording without transcription
      try { await invoke('stop_voice_recording'); } catch { /* ignore */ }
      setState('error');
      const errMsg = typeof err === 'string' ? err : JSON.stringify(err);

      if (errMsg.includes('ollama pull whisper') || errMsg.includes('unavailable')) {
        setStatusText('⚠️ Whisper not installed. Run: ollama pull whisper');
      } else {
        setStatusText('Transcription failed: ' + errMsg.slice(0, 60));
      }
      setElapsedMs(0);
      setTimeout(() => { setState('idle'); setStatusText('Hold to talk, release to transcribe'); }, 4000);
    }
  };

  const handleButtonClick = async () => {
    if (state === 'idle') await handleStartRecording();
    else if (state === 'recording') await handleStopAndTranscribe();
  };

  const formatElapsed = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const tenth = Math.floor((ms % 1000) / 100);
    return `${s}.${tenth}s`;
  };

  const stateColors = {
    idle: '#10b981',        // emerald
    recording: '#ef4444',   // red
    transcribing: '#a78bfa', // purple
    error: '#f97316',       // orange
  };
  const color = stateColors[state];

  return (
    <div style={S.wrapper}>
      {/* Main mic button */}
      <button
        onClick={handleButtonClick}
        disabled={disabled || state === 'transcribing'}
        style={{
          ...S.micBtn,
          backgroundColor: `${color}22`,
          border: `2px solid ${color}`,
          boxShadow: state === 'recording'
            ? `0 0 20px ${color}60, 0 0 40px ${color}30`
            : state === 'transcribing'
            ? `0 0 16px ${color}50`
            : 'none',
        }}
        title={state === 'idle' ? 'Click or Ctrl+Shift+Space to start voice input' : 'Click to stop and transcribe'}
      >
        {state === 'transcribing' ? (
          <span style={{ fontSize: 20, animation: 'spin 1s linear infinite' }}>⚙️</span>
        ) : state === 'recording' ? (
          <span style={{ fontSize: 24, color }}>⏹</span>
        ) : state === 'error' ? (
          <span style={{ fontSize: 22 }}>⚠️</span>
        ) : (
          <MicIcon color={color} />
        )}
      </button>

      {/* Waveform + status */}
      <div style={S.infoCol}>
        <div style={S.statusRow}>
          {/* Live waveform visualization */}
          <div style={S.waveform}>
            {wavBars.map((h, i) => (
              <div
                key={i}
                style={{
                  ...S.wavBar,
                  height: state === 'recording'
                    ? `${10 + Math.sin(Date.now() / 200 + i * 0.7) * 12 + h * 8}px`
                    : state === 'transcribing'
                    ? `${6 + Math.sin(Date.now() / 400 + i) * 6}px`
                    : '4px',
                  backgroundColor: color,
                  opacity: state === 'idle' ? 0.3 : 0.9,
                  transition: 'height 0.1s ease',
                }}
              />
            ))}
          </div>

          {/* Elapsed time */}
          {state === 'recording' && (
            <span style={{ ...S.elapsed, color }}>{formatElapsed(elapsedMs)}</span>
          )}
        </div>

        {/* Status label */}
        <div style={{ ...S.statusLabel, color: state === 'error' ? '#f97316' : 'var(--color-text-secondary)' }}>
          {statusText}
        </div>

        {/* Keyboard shortcut hint */}
        <div style={S.shortcutHint}>
          <kbd style={S.kbd}>Ctrl</kbd>+<kbd style={S.kbd}>Shift</kbd>+<kbd style={S.kbd}>Space</kbd> to toggle
        </div>
      </div>
    </div>
  );
};

const MicIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const S: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--color-border-subtle)',
  },
  micBtn: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  infoCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  waveform: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    height: 28,
  },
  wavBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 2,
  },
  elapsed: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'monospace',
  },
  statusLabel: {
    fontSize: 11,
    lineHeight: 1.3,
  },
  shortcutHint: {
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  kbd: {
    padding: '1px 4px',
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    fontSize: 9,
    fontFamily: 'monospace',
    color: 'var(--color-text-secondary)',
  },
};
