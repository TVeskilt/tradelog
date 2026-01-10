import { z } from 'zod';

export const CREATE_TRADE_SCHEMA = z.object({
  symbol: z
    .string({ message: 'Symbol is required' })
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Z]+$/, 'Symbol must contain only uppercase letters')
    .transform((val) => val.toUpperCase()),

  strikePrice: z
    .number({ message: 'Strike price is required' })
    .min(0.01, 'Strike price must be greater than 0')
    .multipleOf(0.01, 'Strike price must have at most 2 decimal places'),

  expiryDate: z
    .string({ message: 'Expiry date is required' })
    .min(1, 'Expiry date is required')
    .refine(
      (val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: 'Expiry date must be today or in the future',
      }
    ),

  tradeType: z.enum(['BUY', 'SELL'], {
    message: 'Trade type is required',
  }),

  optionType: z.enum(['CALL', 'PUT'], {
    message: 'Option type is required',
  }),

  quantity: z
    .number({ message: 'Quantity is required' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),

  costBasis: z
    .number({ message: 'Cost basis is required' })
    .multipleOf(0.01, 'Cost basis must have at most 2 decimal places'),

  currentValue: z
    .number({ message: 'Current value is required' })
    .multipleOf(0.01, 'Current value must have at most 2 decimal places'),

  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().or(z.literal('')),

  tradeGroupUuid: z.string().uuid().optional(),
});

export type CreateTradeSchema = z.infer<typeof CREATE_TRADE_SCHEMA>;
