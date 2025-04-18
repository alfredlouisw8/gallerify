'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'

import { UpdateProfileSchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }

  let result

  const {
    username,
    aboutImage,
    aboutText,
    bannerImage,
    instagram,
    logo,
    whatsapp,
  } = data

  try {
    result = await prisma.$transaction(async (prisma) => {
      const existingUsername = await prisma.userMetadata.findUnique({
        where: { username: data.username },
      })

      if (existingUsername) {
        throw new Error('Username already exists')
      }

      return await prisma.userMetadata.update({
        data: {
          username,
          aboutImage,
          aboutText,
          bannerImage,
          instagram,
          logo,
          whatsapp,
        },
        where: {
          id: session.user.id,
        },
      })
    })
  } catch (error: any) {
    console.error(error.message)
    return {
      error: error.message || 'Failed to update profile',
    }
  }

  revalidatePath(`/profile/`)
  return { data: result }
}

export const updateProfile = createSafeAction(UpdateProfileSchema, handler)
