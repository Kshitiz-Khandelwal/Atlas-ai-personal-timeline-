import React from 'react';

export type AvatarState = 'NEUTRAL' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'SASSY';

interface AvatarFaceProps {
  state: AvatarState;
  size?: number;
}

export const AvatarFace: React.FC<AvatarFaceProps> = ({ state, size = 140 }) => {
  // Determine dynamic colors & animations based on state
  const getGlowColor = () => {
    switch (state) {
      case 'LISTENING': return '#10b981'; // Emerald pulse for microphone recording
      case 'THINKING': return '#8b5cf6';  // Purple spin for vector inference
      case 'SPEAKING': return '#3b82f6';  // Blue waveform for talking
      case 'SASSY': return '#f59e0b';     // Amber/Gold for candid sass & smirks
      case 'NEUTRAL':
      default: return '#06b6d4';          // Cyan default
    }
  };

  const glowColor = getGlowColor();

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Outer Rotating/Pulsing Orbital Ring */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          filter: `drop-shadow(0 0 12px ${glowColor}88)`,
          animation: state === 'THINKING' ? 'spin 3s linear infinite' : state === 'LISTENING' ? 'pulse 1.2s ease-in-out infinite' : 'none'
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke={glowColor}
          strokeWidth="2.5"
          strokeDasharray="140 40 80 40"
          strokeLinecap="round"
          style={{ opacity: 0.65, transition: 'stroke 0.4s ease' }}
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth="1"
          strokeDasharray="6 6"
          style={{ opacity: 0.3 }}
        />
      </svg>

      {/* Inner Core Face Engine */}
      <svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 140 140"
        style={{
          zIndex: 2,
          transition: 'transform 0.4s ease',
          transform: state === 'SPEAKING' ? 'scale(1.04)' : state === 'LISTENING' ? 'scale(1.06)' : 'scale(1)'
        }}
      >
        {/* Face Background Shield */}
        <circle
          cx="70"
          cy="70"
          r="64"
          fill="#0c101c"
          stroke={glowColor}
          strokeWidth="2"
          style={{ transition: 'stroke 0.4s ease' }}
        />

        {/* --- EYEBROWS --- */}
        {state === 'SASSY' ? (
          <>
            {/* Left Eyebrow (Normal/Lowered) */}
            <path d="M 32 46 Q 44 46 54 48" fill="none" stroke={glowColor} strokeWidth="4" strokeLinecap="round" />
            {/* Right Eyebrow (Raised High Smirk / The Rock style) */}
            <path d="M 86 38 Q 96 34 108 42" fill="none" stroke={glowColor} strokeWidth="4" strokeLinecap="round" />
          </>
        ) : state === 'LISTENING' ? (
          <>
            {/* Both Eyebrows Raised & Wide */}
            <path d="M 32 40 Q 44 36 54 42" fill="none" stroke={glowColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M 86 42 Q 96 36 108 40" fill="none" stroke={glowColor} strokeWidth="4" strokeLinecap="round" />
          </>
        ) : state === 'THINKING' ? (
          <>
            {/* Squinted / Focused Eyebrows */}
            <path d="M 34 48 Q 44 50 54 48" fill="none" stroke={glowColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M 86 48 Q 96 50 106 48" fill="none" stroke={glowColor} strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Neutral Calm Eyebrows */}
            <path d="M 32 44 Q 44 42 54 44" fill="none" stroke={glowColor} strokeWidth="3.5" strokeLinecap="round" style={{ opacity: 0.8 }} />
            <path d="M 86 44 Q 96 42 108 44" fill="none" stroke={glowColor} strokeWidth="3.5" strokeLinecap="round" style={{ opacity: 0.8 }} />
          </>
        )}

        {/* --- EYES --- */}
        {state === 'THINKING' ? (
          <>
            {/* Squinted horizontal eye slits */}
            <rect x="36" y="58" width="16" height="4" rx="2" fill={glowColor} />
            <rect x="88" y="58" width="16" height="4" rx="2" fill={glowColor} />
          </>
        ) : state === 'LISTENING' ? (
          <>
            {/* Wide alert circles */}
            <circle cx="44" cy="60" r="9" fill={glowColor} />
            <circle cx="96" cy="60" r="9" fill={glowColor} />
            {/* Inner pupil glint */}
            <circle cx="46" cy="58" r="3" fill="#ffffff" />
            <circle cx="98" cy="58" r="3" fill="#ffffff" />
          </>
        ) : (
          <>
            {/* Standard dynamic capsule eyes */}
            <rect x="38" y="54" width="12" height="14" rx="6" fill={glowColor} />
            <rect x="90" y="54" width="12" height="14" rx="6" fill={glowColor} />
            {/* Glint */}
            <circle cx="42" cy="58" r="2.5" fill="#ffffff" style={{ opacity: 0.9 }} />
            <circle cx="94" cy="58" r="2.5" fill="#ffffff" style={{ opacity: 0.9 }} />
          </>
        )}

        {/* --- MOUTH / LIP-SYNC --- */}
        {state === 'SPEAKING' ? (
          <path
            d="M 45 92 Q 70 108 95 92 Q 70 102 45 92"
            fill={glowColor}
            stroke={glowColor}
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ animation: 'pulse 0.4s ease-in-out infinite alternate' }}
          />
        ) : state === 'SASSY' ? (
          /* Smirking tilted curve */
          <path d="M 48 94 Q 68 96 92 86" fill="none" stroke={glowColor} strokeWidth="4" strokeLinecap="round" />
        ) : state === 'THINKING' ? (
          /* Small focused dot/dash */
          <path d="M 60 94 Q 70 94 80 94" fill="none" stroke={glowColor} strokeWidth="3" strokeLinecap="round" style={{ opacity: 0.7 }} />
        ) : state === 'LISTENING' ? (
          /* Open slight O shape */
          <circle cx="70" cy="94" r="6" fill="none" stroke={glowColor} strokeWidth="3.5" />
        ) : (
          /* Neutral calm arc */
          <path d="M 52 92 Q 70 96 88 92" fill="none" stroke={glowColor} strokeWidth="3.5" strokeLinecap="round" style={{ opacity: 0.85 }} />
        )}
      </svg>

      {/* Inline Keyframe Styles for Avatar Micro-Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(0.97); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.97); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
