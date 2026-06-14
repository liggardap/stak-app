import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    passwordConfirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords must match',
    path: ['passwordConfirmation'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
