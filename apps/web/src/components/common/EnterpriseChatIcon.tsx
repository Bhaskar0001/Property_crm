import React from 'react';

interface EnterpriseChatIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'emerald' | 'white';
}

export const EnterpriseChatIcon: React.FC<EnterpriseChatIconProps> = ({
  className = '',
  size = 'md',
  variant = 'gold',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const gradientId = `chat-icon-grad-${variant}`;

  return (
    <svg
      className={`${sizeMap[size]} ${className} shrink-0`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {variant === 'gold' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        )}
        {variant === 'emerald' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        )}
        {variant === 'white' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        )}
      </defs>

      {/* Enterprise Rounded Chat Bubble Body */}
      <path
        d="M12 2C6.477 2 2 6.03 2 11C2 13.56 3.195 15.86 5.12 17.47L4.2 21.3C4.08 21.8 4.56 22.21 5 21.95L9.6 19.33C10.38 19.76 11.23 20 12 20C17.523 20 22 15.97 22 11C22 6.03 17.523 2 12 2Z"
        fill={`url(#${gradientId})`}
        fillOpacity="0.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3 Conversational Typing Dots inside */}
      <circle cx="8" cy="11" r="1.35" fill={`url(#${gradientId})`} />
      <circle cx="12" cy="11" r="1.35" fill={`url(#${gradientId})`} />
      <circle cx="16" cy="11" r="1.35" fill={`url(#${gradientId})`} />
    </svg>
  );
};
