'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'

import { UserMetadataSchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }

  let result

  const { userId } = data

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    result = await prisma.$transaction(async (prisma) => {
      return await prisma.userMetadata.create({
        data: { ...data },
      })
    })

    revalidatePath(`/homepage`)
    return { data: result }
  } catch (error: any) {
    console.error(error.message)
    return {
      error: 'Failed to create gallery category image',
    }
  }
}

export const createUserMetadata = createSafeAction(UserMetadataSchema, handler)
