import React, { useEffect, useState } from 'react';

export type AvatarState = 'NEUTRAL' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'SASSY';

interface AvatarFaceProps {
  state: AvatarState;
  size?: number;
}

// One consistent "character" identity — a glossy lavender blob head, like a
// cross between Apple Memoji's soft 3D material and Siri's colored glow.
// The head material never changes; only the aura, eyes and mouth shift per
// state, so it reads as one character having different moods rather than
// five different faces.

const ACCENT: Record<AvatarState, { glow: string; name: string }> = {
  NEUTRAL: { glow: '#7DD3FC', name: 'sky' },
  LISTENING: { glow: '#34D399', name: 'emerald' },
  THINKING: { glow: '#A78BFA', name: 'violet' },
  SPEAKING: { glow: '#22D3EE', name: 'cyan' },
  SASSY: { glow: '#FBBF24', name: 'amber' },
};

export const AvatarFace: React.FC<AvatarFaceProps> = ({ state, size = 160 }) => {
  const accent = ACCENT[state].glow;

  // Idle blink — independent of emotional state, purely a life-like tic.
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const cycle = () => {
      const delay = 2600 + Math.random() * 2600;
      window.setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        window.setTimeout(() => !cancelled && setBlink(false), 140);
        cycle();
      }, delay);
    };
    cycle();
    return () => {
      cancelled = true;
    };
  }, []);

  const isState = (s: AvatarState) => state === s;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        margin: '0 auto',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Glossy plastic material for the head */}
          <radialGradient id="headGrad" cx="38%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#F4F1FF" />
            <stop offset="45%" stopColor="#C9BFFB" />
            <stop offset="80%" stopColor="#8B7CF2" />
            <stop offset="100%" stopColor="#6857D6" />
          </radialGradient>

          <radialGradient id="earGrad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#D8CFFC" />
            <stop offset="100%" stopColor="#7A6BE0" />
          </radialGradient>

          <radialGradient id="irisGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor={accent} />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>

          <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>

          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="bigBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* ---- Siri-style ambient aura, breathing behind the head ---- */}
        <circle
          cx="100"
          cy="102"
          r="92"
          fill="url(#auraGrad)"
          filter="url(#bigBlur)"
          style={{
            transition: 'fill 0.5s ease',
            animation:
              state === 'LISTENING'
                ? 'auraPulse 1.1s ease-in-out infinite'
                : state === 'THINKING'
                ? 'auraPulse 2.2s ease-in-out infinite'
                : 'auraBreathe 3.6s ease-in-out infinite',
          }}
        />

        {/* ---- Grounding shadow ---- */}
        <ellipse cx="100" cy="192" rx="46" ry="7" fill="#0f0b2e" opacity="0.18" filter="url(#softBlur)" />

        {/* ---- Head + face group, gentle idle bob ---- */}
        <g style={{ animation: 'bob 4.5s ease-in-out infinite', transformOrigin: '100px 100px' }}>
          {/* Antenna — the character's signature trait, tip glows with state color */}
          <line x1="100" y1="28" x2="100" y2="10" stroke="#8B7CF2" strokeWidth="4" strokeLinecap="round" />
          <circle
            cx="100"
            cy="8"
            r="6"
            fill={accent}
            style={{
              transition: 'fill 0.5s ease',
              animation: 'antennaGlow 2s ease-in-out infinite',
            }}
          />

          {/* Ears */}
          <circle cx="20" cy="102" r="13" fill="url(#earGrad)" />
          <circle cx="180" cy="102" r="13" fill="url(#earGrad)" />
          <circle cx="20" cy="102" r="4" fill={accent} opacity="0.9" style={{ transition: 'fill 0.5s ease' }} />
          <circle cx="180" cy="102" r="4" fill={accent} opacity="0.9" style={{ transition: 'fill 0.5s ease' }} />

          {/* Head */}
          <path
            d="M 100 28 C 146 28 170 62 170 100 C 170 144 142 182 100 182 C 58 182 30 144 30 100 C 30 62 54 28 100 28 Z"
            fill="url(#headGrad)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
          />

          {/* Specular highlight, gives the glossy Memoji-plastic look */}
          <ellipse cx="70" cy="58" rx="26" ry="16" fill="#ffffff" opacity="0.4" filter="url(#softBlur)" />

          {/* Cheek blush */}
          <ellipse
            cx="52" cy="120" rx="11" ry="6.5" fill="#FF8FAE"
            opacity={isState('SASSY') || isState('SPEAKING') ? 0.5 : 0.22}
            filter="url(#softBlur)"
            style={{ transition: 'opacity 0.4s ease' }}
          />
          <ellipse
            cx="148" cy="120" rx="11" ry="6.5" fill="#FF8FAE"
            opacity={isState('SASSY') || isState('SPEAKING') ? 0.5 : 0.22}
            filter="url(#softBlur)"
            style={{ transition: 'opacity 0.4s ease' }}
          />

          {/* ---- Eyebrows — all variants stacked, crossfaded by opacity ---- */}
          <g style={variantStyle(isState('NEUTRAL') || isState('SPEAKING'))}>
            <path d="M 44 68 Q 63 62 78 67" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
            <path d="M 122 67 Q 137 62 156 68" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g style={variantStyle(isState('LISTENING'))}>
            <path d="M 44 58 Q 63 50 78 57" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
            <path d="M 122 57 Q 137 50 156 58" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g style={variantStyle(isState('THINKING'))}>
            <path d="M 46 66 Q 62 76 79 71" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
            <path d="M 121 65 Q 138 58 154 62" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g style={variantStyle(isState('SASSY'))}>
            <path d="M 44 74 Q 62 78 79 74" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
            <path d="M 120 55 Q 138 44 158 56" fill="none" stroke="#3a2f6e" strokeWidth="5" strokeLinecap="round" />
          </g>

          {/* ---- Eyes — stacked variants + blink overlay ---- */}
          <g style={variantStyle(isState('NEUTRAL') || isState('SPEAKING'))}>
            <EyePair blinkScale={blink ? 0.06 : 1} eyeHeight={38} irisR={11} />
          </g>
          <g style={variantStyle(isState('LISTENING'))}>
            <EyePair blinkScale={blink ? 0.06 : 1} eyeHeight={44} irisR={13} wide />
          </g>
          <g style={variantStyle(isState('THINKING'))}>
            <rect x="45" y="90" width="34" height="7" rx="3.5" fill="#3a2f6e" />
            <rect x="121" y="90" width="34" height="7" rx="3.5" fill="#3a2f6e" />
          </g>
          <g style={variantStyle(isState('SASSY'))}>
            <rect x="45" y="92" width="34" height="6" rx="3" fill="#3a2f6e" />
            <g>
              <rect x="119" y="79" width="36" height="38" rx="16" fill="#ffffff" />
              <circle cx="137" cy="98" r="12" fill="url(#irisGrad)" />
              <circle cx="141" cy="94" r="3.4" fill="#ffffff" />
            </g>
          </g>

          {/* ---- Nose shading, minimal ---- */}
          <path d="M 100 108 L 96 122 Q 100 125 104 122 Z" fill="rgba(255,255,255,0.15)" />

          {/* ---- Mouths — stacked variants ---- */}
          <g style={variantStyle(isState('NEUTRAL'))}>
            <path d="M 66 138 Q 100 156 134 138" fill="none" stroke="#3a2f6e" strokeWidth="5.5" strokeLinecap="round" />
          </g>
          <g style={variantStyle(isState('LISTENING'))}>
            <ellipse cx="100" cy="142" rx="9" ry="11" fill="#2b2450" stroke={accent} strokeWidth="2.5" style={{ transition: 'stroke 0.5s ease' }} />
          </g>
          <g style={variantStyle(isState('THINKING'))}>
            <path d="M 80 142 Q 96 148 116 140" fill="none" stroke="#3a2f6e" strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <g style={variantStyle(isState('SASSY'))}>
            <path d="M 68 134 Q 96 148 132 122" fill="none" stroke="#3a2f6e" strokeWidth="5.5" strokeLinecap="round" />
          </g>
          <g
            style={{
              ...variantStyle(isState('SPEAKING')),
              animation: isState('SPEAKING') ? 'talk 0.32s ease-in-out infinite alternate' : undefined,
              transformOrigin: '100px 142px',
            }}
          >
            <path d="M 70 134 Q 100 160 130 134 Q 100 146 70 134" fill="#2b2450" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" style={{ transition: 'stroke 0.5s ease' }} />
            <path d="M 78 136 Q 100 141 122 136" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes auraBreathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes auraPulse {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes antennaGlow {
          0%, 100% { opacity: 0.75; r: 6; }
          50% { opacity: 1; r: 7.5; }
        }
        @keyframes talk {
          0% { transform: scaleY(0.75); }
          100% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
};

// Shared opacity/scale crossfade so switching states morphs smoothly
// instead of snapping between conditionally-rendered shapes.
function variantStyle(active: boolean): React.CSSProperties {
  return {
    opacity: active ? 1 : 0,
    transition: 'opacity 0.35s ease',
  };
}

const EyePair: React.FC<{
  blinkScale: number;
  eyeHeight: number;
  irisR: number;
  wide?: boolean;
}> = ({ blinkScale, eyeHeight, irisR, wide }) => (
  <>
    <g style={{ transform: `scaleY(${blinkScale})`, transformOrigin: '62px 99px', transition: 'transform 0.1s ease' }}>
      <rect x={wide ? 43 : 45} y={99 - eyeHeight / 2} width={wide ? 38 : 34} height={eyeHeight} rx={eyeHeight / 2} fill="#ffffff" />
      <circle cx="62" cy="99" r={irisR} fill="url(#irisGrad)" />
      <circle cx={65.5} cy={95.5} r={irisR * 0.3} fill="#ffffff" />
    </g>
    <g style={{ transform: `scaleY(${blinkScale})`, transformOrigin: '138px 99px', transition: 'transform 0.1s ease' }}>
      <rect x={wide ? 119 : 121} y={99 - eyeHeight / 2} width={wide ? 38 : 34} height={eyeHeight} rx={eyeHeight / 2} fill="#ffffff" />
      <circle cx="138" cy="99" r={irisR} fill="url(#irisGrad)" />
      <circle cx={141.5} cy={95.5} r={irisR * 0.3} fill="#ffffff" />
    </g>
  </>
);

export default AvatarFace;
