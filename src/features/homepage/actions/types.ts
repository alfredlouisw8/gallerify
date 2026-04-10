import { z } from 'zod'

import { ActionState } from '@/lib/create-safe-action'
import { UserMetadata } from '@/types'

import { UpdateProfileSchema } from './schema'

export type InputType = z.infer<typeof UpdateProfileSchema>
export type ReturnType = ActionState<InputType, UserMetadata>
