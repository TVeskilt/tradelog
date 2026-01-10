export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  TRADES: '/v1/trades',
  TRADE_GROUPS: '/v1/trade-groups',
} as const;
