import { GalleryCategory } from '@prisma/client'
import { z } from 'zod'

import { ActionState } from '@/lib/create-safe-action'

import { GalleryCategorySchema } from './schema'

export type InputType = z.infer<typeof GalleryCategorySchema>
export type ReturnType = ActionState<InputType, GalleryCategory>
