import { z } from 'zod'

import { ActionState } from '@/lib/create-safe-action'
import { User } from '@/types'

import { ChangePasswordSchema } from './schema'

export type InputType = z.infer<typeof ChangePasswordSchema>
export type ReturnType = ActionState<InputType, User>
