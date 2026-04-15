import { z } from 'zod'

export const UserMetadataSchema = z.object({
  userId: z.string(),
  bannerImage: z.string().optional(),
  logo: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  aboutImage: z.string().optional(),
  aboutText: z.string().optional(),
})
export const UpdateProfileSchema = z.object({
  name: z.string().max(50).nullable(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Username can only contain lowercase letters, numbers, and hyphens'
    )
    .refine((v) => !v.startsWith('-') && !v.endsWith('-'), {
      message: 'Username cannot start or end with a hyphen',
    }),
  bannerImage: z.union([
    z.custom<File>((v) => v instanceof File, {
      message: 'Please select an image',
    }),
    z.string(), // Allow Cloudinary URLs
  ]),
  whatsapp: z.string().url().nullable(),
  instagram: z.string().url().nullable(),
  aboutImage: z.union([
    z.custom<File>((v) => v instanceof File, {
      message: 'Please select an image',
    }),
    z.string(), // Allow Cloudinary URLs
  ]),
  aboutText: z.string().nullable(),
  logo: z.union([
    z.custom<File>((v) => v instanceof File, {
      message: 'Please select an image',
    }),
    z.string(), // Allow Cloudinary URLs
  ]),
})
