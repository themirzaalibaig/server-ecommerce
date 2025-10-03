import { z } from 'zod';
import { Size } from '../types/models';

const imageSchema = z.object({
  url: z.string().url('Invalid URL'),
  public_id: z.string().min(1, 'Public ID is required'),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name must be at least 1 character')
      .max(200, 'Name cannot exceed 200 characters'),
    description: z
      .string()
      .min(1, 'Description must be at least 1 character')
      .max(2000, 'Description cannot exceed 2000 characters'),
    price: z.number().min(0, 'Price cannot be negative'),
    tags: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    thumbnail: imageSchema.required(),
    images: z
      .array(imageSchema)
      .min(1, 'At least one image is required')
      .max(10, 'Cannot upload more than 10 images'),
    stock: z.number().min(0, 'Stock cannot be negative'),
    category: z.string().min(1, 'Category ID is required'),
    size: z.array(z.enum(Size)).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(1, 'Name must be at least 1 character')
        .max(200, 'Name cannot exceed 200 characters')
        .optional(),
      description: z
        .string()
        .min(1, 'Description must be at least 1 character')
        .max(2000, 'Description cannot exceed 2000 characters')
        .optional(),
      price: z.number().min(0, 'Price cannot be negative').optional(),
      tags: z.array(z.string()).optional(),
      color: z.array(z.string()).optional(),
      thumbnail: imageSchema.optional(),
      images: z
        .array(imageSchema)
        .min(1, 'At least one image is required')
        .max(10, 'Cannot upload more than 10 images')
        .optional(),
      stock: z.number().min(0, 'Stock cannot be negative').optional(),
      category: z.string().min(1, 'Category ID is required').optional(),
      size: z.array(z.enum(Size)).optional(),
    })
    .partial(),
});
