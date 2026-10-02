// ============================================
// REAL ESTATE PROPERTY OS - Shared Constants
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_RATE_LIMIT_MINUTES = 1;

export const JWT_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 200 },
  web: { width: 1200, height: 800 },
  original: null,
} as const;

export const CURRENCY_CACHE_TTL = 3600; // 1 hour in seconds

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;
