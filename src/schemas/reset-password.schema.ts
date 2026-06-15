import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords must match',
    path: ['password_confirmation'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
