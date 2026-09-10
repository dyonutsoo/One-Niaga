import type { Platform, PlatformId } from './types';

export const PLATFORMS: Platform[] = [
  { id: 'shopee', name: 'Shopee', color: '#EE4D2D' },
  { id: 'lazada', name: 'Lazada', color: '#0F146D' },
  { id: 'tiktok', name: 'TikTok Shop', color: '#12968C' },
  { id: 'webstore', name: 'Webstore', color: '#5B4B8A' },
];

export const PLATFORM_IDS: PlatformId[] = PLATFORMS.map((p) => p.id);

export const CONTENT_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ms', label: 'Bahasa Malaysia' },
  { id: 'zh', label: 'Chinese (简体中文)' },
] as const;

export const UI_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ms', label: 'Bahasa Malaysia' },
  { id: 'zh', label: '中文' },
] as const;
