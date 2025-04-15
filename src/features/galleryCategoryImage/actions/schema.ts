import { z } from 'zod'

export const GalleryCategoryImageSchema = z.object({
  imageUrl: z
    .array(
      z.union([
        z.custom<File>((v) => v instanceof File, {
          message: 'Please select an image',
        }),
        z.string(), // Allow Cloudinary URLs
      ])
    )
    .optional(),
  categoryId: z.string(),
  galleryCategoryImageId: z.string().optional(),
})

export const GalleryCategoryImageMoveSchema = z.object({
  categoryId: z.string(),
  galleryCategoryImageId: z.string(),
})
