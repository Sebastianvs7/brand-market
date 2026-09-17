import { z } from 'zod';

export const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  price: z.number().finite().nonnegative(),
  image: z.url(),
  category: z.string().optional(),
});
export const productsSchema = z.array(productSchema);
export type Product = Readonly<z.infer<typeof productSchema>>;
