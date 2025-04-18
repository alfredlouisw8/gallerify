import { UserMetadata } from '@prisma/client'
import { z } from 'zod'

import { ActionState } from '@/lib/create-safe-action'

import { UserMetadataSchema } from '@/features/homepage/actions/schema'

export type InputType = z.infer<typeof UserMetadataSchema>
export type ReturnType = ActionState<InputType, UserMetadata>
