import React from 'react';

export type AvatarState = 'NEUTRAL' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'SASSY';

interface AvatarFaceProps {
  state: AvatarState;
  size?: number;
}

export const AvatarFace: React.FC<AvatarFaceProps> = ({ state, size = 160 }) => {
  // Dynamic glow colors based on AI mindset
  const getGlowColor = () => {
    switch (state) {
      case 'LISTENING': return '#10b981'; // Emerald audio capture
      case 'THINKING': return '#8b5cf6';  // Deep purple neural inference
      case 'SPEAKING': return '#06b6d4';  // Cyan active speech
      case 'SASSY': return '#f59e0b';     // Amber/Gold candid smirk
      case 'NEUTRAL':
      default: return '#38bdf8';          // Sky blue idle
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
      {/* Outer Holographic Radar & Audio Rings */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          filter: `drop-shadow(0 0 16px ${glowColor}66)`,
          animation: state === 'THINKING' ? 'spin 4s linear infinite' : state === 'LISTENING' ? 'pulse 1.4s ease-in-out infinite' : 'none'
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke={glowColor}
          strokeWidth="2"
          strokeDasharray="140 40 80 40"
          strokeLinecap="round"
          style={{ opacity: 0.6, transition: 'stroke 0.4s ease' }}
        />
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          style={{ opacity: 0.35 }}
        />
      </svg>

      {/* 3D Memoji / Bitmoji Character Head Container */}
      <svg
        width={size * 0.85}
        height={size * 0.85}
        viewBox="0 0 160 160"
        style={{
          zIndex: 2,
          transition: 'transform 0.4s ease',
          transform: state === 'SPEAKING' ? 'scale(1.05)' : state === 'LISTENING' ? 'scale(1.06)' : 'scale(1)'
        }}
      >
        <defs>
          {/* 3D Skin/Head Shading Gradient */}
          <radialGradient id="faceGradient" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2a3854" />
            <stop offset="60%" stopColor="#131c2e" />
            <stop offset="100%" stopColor="#080c14" />
          </radialGradient>

          {/* Cyber Headset Metallic Shading */}
          <linearGradient id="headsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Eye Iris Holographic Gradient */}
          <radialGradient id="irisGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor={glowColor} />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>

          {/* Cheek Blush Filter */}
          <filter id="blush">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Head Shadow / Back Rim Light */}
        <ellipse cx="80" cy="85" rx="58" ry="62" fill="none" stroke={glowColor} strokeWidth="3" opacity="0.35" />

        {/* 3D Sculpted Face Base */}
        <path
          d="M 28 72 C 28 36, 132 36, 132 72 C 132 115, 115 142, 80 142 C 45 142, 28 115, 28 72 Z"
          fill="url(#faceGradient)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* Cheek Blush (Glows when speaking or sassy) */}
        <ellipse cx="45" cy="98" rx="12" ry="7" fill={glowColor} opacity={state === 'SASSY' || state === 'SPEAKING' ? 0.28 : 0.1} filter="url(#blush)" />
        <ellipse cx="115" cy="98" rx="12" ry="7" fill={glowColor} opacity={state === 'SASSY' || state === 'SPEAKING' ? 0.28 : 0.1} filter="url(#blush)" />

        {/* Futuristic Cyber-Headset (Bitmoji / Apple Vision Pro vibe) */}
        <path
          d="M 20 65 Q 24 30 80 26 Q 136 30 140 65"
          fill="none"
          stroke="url(#headsetGrad)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Headset Ear Nodes with Glowing Status LED */}
        <rect x="14" y="62" width="12" height="26" rx="6" fill="url(#headsetGrad)" stroke={glowColor} strokeWidth="1.5" />
        <rect x="134" y="62" width="12" height="26" rx="6" fill="url(#headsetGrad)" stroke={glowColor} strokeWidth="1.5" />
        <circle cx="20" cy="75" r="2.5" fill={glowColor} />
        <circle cx="140" cy="75" r="2.5" fill={glowColor} />

        {/* --- EYEBROWS (3D Shaded & Expressive) --- */}
        {state === 'SASSY' ? (
          <>
            {/* Left Eyebrow (Lowered / Smirk) */}
            <path d="M 38 54 Q 50 56 62 55" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
            {/* Right Eyebrow (The Rock High Arch) */}
            <path d="M 96 44 Q 108 38 122 48" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          </>
        ) : state === 'LISTENING' ? (
          <>
            {/* Both Eyebrows Raised Wide */}
            <path d="M 38 46 Q 50 42 62 46" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 98 46 Q 110 42 122 46" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          </>
        ) : state === 'THINKING' ? (
          <>
            {/* Focused Squint Eyebrows */}
            <path d="M 40 54 Q 50 56 60 53" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 100 53 Q 110 56 120 54" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Neutral Smooth Eyebrows */}
            <path d="M 38 50 Q 50 48 62 50" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            <path d="M 98 50 Q 110 48 122 50" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
          </>
        )}

        {/* --- 3D EXPRESSIVE EYES --- */}
        {state === 'THINKING' ? (
          <>
            {/* Deep Thought Half-Closed Slits */}
            <rect x="42" y="66" width="18" height="6" rx="3" fill="url(#irisGrad)" />
            <rect x="100" y="66" width="18" height="6" rx="3" fill="url(#irisGrad)" />
          </>
        ) : state === 'LISTENING' ? (
          <>
            {/* Wide Alert Irises */}
            <circle cx="51" cy="68" r="12" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <circle cx="51" cy="68" r="9" fill="url(#irisGrad)" />
            <circle cx="109" cy="68" r="12" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <circle cx="109" cy="68" r="9" fill="url(#irisGrad)" />
            {/* Catchlight Reflections */}
            <circle cx="54" cy="65" r="3" fill="#ffffff" />
            <circle cx="112" cy="65" r="3" fill="#ffffff" />
          </>
        ) : (
          <>
            {/* Standard Apple Memoji 3D Capsule Eyes */}
            <rect x="40" y="60" width="22" height="18" rx="9" fill="#0f172a" />
            <circle cx="51" cy="69" r="7.5" fill="url(#irisGrad)" />
            <circle cx="54" cy="66" r="2.5" fill="#ffffff" />

            <rect x="98" y="60" width="22" height="18" rx="9" fill="#0f172a" />
            <circle cx="109" cy="69" r="7.5" fill="url(#irisGrad)" />
            <circle cx="112" cy="66" r="2.5" fill="#ffffff" />
          </>
        )}

        {/* 3D Subtle Nose Bridge */}
        <path d="M 80 76 L 76 88 Q 80 90 84 88 Z" fill="rgba(255, 255, 255, 0.05)" />

        {/* --- SCULPTED 3D MOUTH & LIP-SYNC --- */}
        {state === 'SPEAKING' ? (
          <g style={{ animation: 'lipSync 0.35s ease-in-out infinite alternate' }}>
            {/* Mouth Cavity */}
            <path
              d="M 54 108 Q 80 126 106 108 Q 80 114 54 108"
              fill="#1e112a"
              stroke={glowColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Top Teeth Glint */}
            <path d="M 62 109 Q 80 112 98 109" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
            {/* Tongue Arc */}
            <path d="M 68 116 Q 80 110 92 116" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
          </g>
        ) : state === 'SASSY' ? (
          /* Sculpted Memoji Smirk Curve */
          <path d="M 54 112 Q 76 114 106 100" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
        ) : state === 'THINKING' ? (
          /* Focused neutral dash */
          <path d="M 66 112 Q 80 112 94 112" fill="none" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
        ) : state === 'LISTENING' ? (
          /* Alert O-Shape Mouth */
          <circle cx="80" cy="112" r="7" fill="#1e112a" stroke={glowColor} strokeWidth="3" />
        ) : (
          /* Warm Confident Memoji Smile */
          <path d="M 56 108 Q 80 118 104 108" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        )}
      </svg>

      {/* Micro-animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes lipSync {
          0% { transform: scaleY(0.85); }
          100% { transform: scaleY(1.25); }
        }
      `}</style>
    </div>
  );
};
