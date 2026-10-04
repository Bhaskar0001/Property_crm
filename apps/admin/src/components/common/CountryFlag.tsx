import React, { useState } from 'react';

interface CountryFlagProps {
  code?: string;
  name?: string;
  flagUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-4 h-3 rounded-[2px]',
  sm: 'w-6 h-4 rounded-xs',
  md: 'w-8 h-5.5 rounded-sm',
  lg: 'w-12 h-8 rounded-md',
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  name,
  flagUrl,
  size = 'sm',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const cleanCode = (code || '').trim().toLowerCase();

  // If explicit flagUrl provided, use it; otherwise compute from flagcdn.com using clean 2-letter ISO code
  const src =
    !hasError && flagUrl
      ? flagUrl
      : cleanCode && cleanCode.length === 2
      ? `https://flagcdn.com/w80/${cleanCode}.png`
      : null;

  const srcSet =
    src && cleanCode && cleanCode.length === 2 && !flagUrl
      ? `https://flagcdn.com/w160/${cleanCode}.png 2x`
      : undefined;

  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.sm;

  if (!src || hasError) {
    return (
      <span
        title={name || code || 'Country'}
        className={`inline-flex items-center justify-center bg-slate-100 text-slate-600 font-bold font-mono uppercase text-[10px] border border-slate-200 shadow-xs select-none ${sizeClasses} ${className}`}
      >
        {cleanCode.substring(0, 2) || '🌐'}
      </span>
    );
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      alt={name ? `${name} Flag` : `${code || ''} Flag`}
      title={name ? `${name} (${(code || '').toUpperCase()})` : (code || '').toUpperCase()}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`inline-block object-cover border border-slate-200/90 shadow-xs shrink-0 select-none ${sizeClasses} ${className}`}
    />
  );
};
