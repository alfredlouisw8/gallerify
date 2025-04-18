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
