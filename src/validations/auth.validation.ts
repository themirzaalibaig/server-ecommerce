import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,}$/,
        {
          message:
            'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character',
        }
      ),
    image: z
      .object({
        url: z.string(),
        public_id: z.string(),
      })
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,}$/,
        {
          message:
            'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character',
        }
      ),
  }),
});
