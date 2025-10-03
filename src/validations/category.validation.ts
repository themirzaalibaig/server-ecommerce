import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name must be at least 1 character').max(100, 'Name cannot exceed 100 characters'),
    slug: z.string().min(1, 'Slug is required').max(100, 'Slug cannot exceed 100 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    image: z
      .object({
        url: z.string(),
        public_id: z.string(),
      })
      .optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name must be at least 1 character').max(100, 'Name cannot exceed 100 characters').optional(),
      slug: z.string().min(1, 'Slug must be at least 1 character').max(100, 'Slug cannot exceed 100 characters').optional(),
      description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
      image: z
        .object({
          url: z.string(),
          public_id: z.string(),
        })
        .optional(),
    })
    .partial(),
});