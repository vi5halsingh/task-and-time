import { z } from 'zod';

export const dailySummaryQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid calendar date' })
    .optional(),
  timezone: z.string().trim().optional(),
});

export type DailySummaryQuery = z.infer<typeof dailySummaryQuerySchema>;
