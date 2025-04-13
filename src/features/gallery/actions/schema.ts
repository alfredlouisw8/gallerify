import { z } from 'zod'

export const GallerySchema = z.object({
  bannerImage: z.array(
    z.union([
      z.custom<File>((v) => v instanceof File, {
        message: 'Please select an image',
      }),
      z.string(), // Allow Cloudinary URLs
    ])
  ),
  title: z.string(),
  date: z.string(),
  isPublished: z.boolean(),
  slug: z.string(),
  galleryId: z.string().optional(),
})
