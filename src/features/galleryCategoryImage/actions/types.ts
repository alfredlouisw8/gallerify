import { z } from 'zod'

import { ActionState } from '@/lib/create-safe-action'
import { GalleryCategoryImage } from '@/types'

import { GalleryCategoryImageSchema } from './schema'

export type InputType = z.infer<typeof GalleryCategoryImageSchema>
export type ReturnType = ActionState<InputType, GalleryCategoryImage[]>
export type ReturnTypeSingle = ActionState<InputType, GalleryCategoryImage>
