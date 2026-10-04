import React from 'react';

interface LuxuryEmblemProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'silver' | 'emerald';
}

export const LuxuryEmblem: React.FC<LuxuryEmblemProps> = ({
  className = '',
  size = 'md',
  variant = 'gold',
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const gradientId = `luxury-grad-${variant}`;
  const strokeGradId = `luxury-stroke-${variant}`;

  return (
    <svg
      className={`${sizeMap[size]} ${className} shrink-0`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {variant === 'gold' && (
          <>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </>
        )}
        {variant === 'emerald' && (
          <>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#065F46" />
            </linearGradient>
          </>
        )}
        {variant === 'silver' && (
          <>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Exterior Luxury Crest Shield */}
      <path
        d="M24 3L39 9.5V22.5C39 31.8 32.6 40.5 24 45C15.4 40.5 9 31.8 9 22.5V9.5L24 3Z"
        fill={`url(#${gradientId})`}
        fillOpacity="0.16"
        stroke={`url(#${strokeGradId})`}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Inner Architectural Diamond Keylines */}
      <path
        d="M24 10L32 17.5L24 25L16 17.5L24 10Z"
        stroke={`url(#${strokeGradId})`}
        strokeWidth="1.5"
        fill={`url(#${gradientId})`}
        fillOpacity="0.3"
      />

      {/* Center 8-Point Star / Compass Starburst */}
      <path
        d="M24 14V21M20.5 17.5H27.5M21.5 15L26.5 20M21.5 20L26.5 15"
        stroke="#FFFFFF"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Lower Keystone / Monogram Flourish */}
      <path
        d="M19 29C19 29 21.5 32 24 32C26.5 32 29 29 29 29M24 32V38"
        stroke={`url(#${strokeGradId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
