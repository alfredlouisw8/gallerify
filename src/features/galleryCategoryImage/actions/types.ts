import { GalleryCategoryImage } from '@prisma/client'
import { z } from 'zod'

import { ActionState } from '@/lib/create-safe-action'

import { GalleryCategoryImageSchema } from './schema'

export type InputType = z.infer<typeof GalleryCategoryImageSchema>
export type ReturnType = ActionState<InputType, GalleryCategoryImage[]>
