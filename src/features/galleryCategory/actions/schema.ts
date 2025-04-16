import { z } from 'zod'

export const GalleryCategorySchema = z.object({
  name: z.string(),
  galleryId: z.string(),
  galleryCategoryId: z.string().optional(),
})
