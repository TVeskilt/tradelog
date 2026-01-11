import type { ApiError } from '@/types/api-error';
import type { UseFormSetError } from 'react-hook-form';

type ErrorMessage = string;

const FIELD_KEYWORD_MAP: Record<string, string> = {
  symbol: 'symbol',
  strike: 'strikePrice',
  expiry: 'expiryDate',
  quantity: 'quantity',
  cost: 'costBasis',
  value: 'currentValue',
  notes: 'notes',
} as const;

export const extractApiErrorMessages = (error: ApiError): ErrorMessage[] => {
  const message = error.response?.data?.message;
  if (!message) return [];
  return Array.isArray(message) ? message : [message];
};

export const isApiValidationError = (error: unknown): error is ApiError => {
  const apiError = error as ApiError;
  return apiError.response?.status === 400 && !!apiError.response?.data?.message;
};

const matchesFieldKeyword = (message: string, keyword: string): boolean => {
  return message.toLowerCase().includes(keyword);
};

const detectFieldFromMessage = (message: string): string | null => {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('type') && lowerMsg.includes('trade')) {
    return 'tradeType';
  }

  if (lowerMsg.includes('type') && lowerMsg.includes('option')) {
    return 'optionType';
  }

  for (const [keyword, field] of Object.entries(FIELD_KEYWORD_MAP)) {
    if (matchesFieldKeyword(message, keyword)) {
      return field;
    }
  }

  return null;
};

export const applyValidationErrorsToForm = <T extends Record<string, unknown>>(
  messages: ErrorMessage[],
  setError: UseFormSetError<T>,
): void => {
  messages.forEach((msg) => {
    const field = detectFieldFromMessage(msg);
    if (field) {
      setError(field as Parameters<UseFormSetError<T>>[0], { message: msg });
    }
  });
};
