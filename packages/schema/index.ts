import { z } from 'zod';

export const TopUpSchema = z.object({
  amount: z.number().min(100, { message: 'Minimum top-up amount is 100 CZK' })
});

export type TopUpFormData = z.infer<typeof TopUpSchema>;
