import { z } from 'zod';
export const userSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
});
export type User = Readonly<z.infer<typeof userSchema>>;
