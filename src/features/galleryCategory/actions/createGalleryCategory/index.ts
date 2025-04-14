'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'

import { GalleryCategorySchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }

  let result

  const { galleryId, name } = data

  try {
    result = await prisma.$transaction(async (prisma) => {
      const galleryCategory = await prisma.galleryCategory.create({
        data: {
          galleryId: galleryId,
          name: name,
        },
      })

      return galleryCategory
    })
  } catch (error: any) {
    console.error(error.message)
    return {
      error: 'Failed to create gallery category',
    }
  }

  revalidatePath(`/gallery/${galleryId}/collection/${result.id}`)
  return { data: result }
}

export const createGalleryCategory = createSafeAction(
  GalleryCategorySchema,
  handler
)
