import { Gallery } from '@prisma/client'
import { z } from 'zod'

import { ActionState } from '@/lib/create-safe-action'

import { GallerySchema } from './schema'

export type InputType = z.infer<typeof GallerySchema>
export type ReturnType = ActionState<InputType, Gallery>
