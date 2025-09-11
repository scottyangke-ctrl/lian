import { z } from 'zod';

export const klinesSchema = z.object({
  symbol: z.string().nonempty('Symbol is required'),
  interval: z.string().nonempty('Interval is required'),
  limit: z.string().nonempty('Limit is required').regex(/^\d+$/, 'Limit must be a number'),
});