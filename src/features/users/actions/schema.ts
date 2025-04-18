import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  username: z.string().min(1).max(20),
  bannerImage: z.string().nullable(),
  whatsapp: z.string().nullable(),
  instagram: z.string().nullable(),
  aboutImage: z.string().nullable(),
  aboutText: z.string().nullable(),
  logo: z.string().nullable(),
})
