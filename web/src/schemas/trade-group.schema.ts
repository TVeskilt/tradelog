import { z } from 'zod';

export const CREATE_TRADE_GROUP_SCHEMA = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),

  strategyType: z.enum(['CALENDAR_SPREAD', 'RATIO_CALENDAR_SPREAD', 'CUSTOM'], {
    message: 'Strategy type is required',
  }),

  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});

export const UPDATE_TRADE_GROUP_SCHEMA = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .optional(),

  strategyType: z.enum(['CALENDAR_SPREAD', 'RATIO_CALENDAR_SPREAD', 'CUSTOM']).optional(),

  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});

export type CreateTradeGroupSchema = z.infer<typeof CREATE_TRADE_GROUP_SCHEMA>;
export type UpdateTradeGroupSchema = z.infer<typeof UPDATE_TRADE_GROUP_SCHEMA>;
