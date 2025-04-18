import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  username: z.string().min(1).max(20),
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
