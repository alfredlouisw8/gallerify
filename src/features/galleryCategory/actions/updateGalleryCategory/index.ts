'use server'

import { revalidatePath } from 'next/cache'

import getCategoryById from '@/features/galleryCategory/actions/getCategoryById'
import { GalleryCategorySchema } from '@/features/galleryCategory/actions/schema'
import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'

import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }

  let result

  const { name, galleryCategoryId, galleryId } = data

  try {
    result = await prisma.$transaction(async (prisma) => {
      if (!galleryId || !galleryCategoryId) {
        throw new Error('Gallery not found')
      }

      const existingGalleryCategory = await getCategoryById(galleryCategoryId)

      if (!existingGalleryCategory) {
        throw new Error('Gallery Category not found')
      }

      return await prisma.galleryCategory.update({
        data: {
          name,
        },
        where: {
          id: galleryCategoryId,
        },
      })
    })
  } catch (error: any) {
    console.error(error.message)
    return {
      error: error.message || 'Failed to update gallery',
    }
  }

  revalidatePath(`/gallery/${galleryId}/collection/${result.id}`)
  return { data: result }
}

export const updateGalleryCategory = createSafeAction(
  GalleryCategorySchema,
  handler
)
