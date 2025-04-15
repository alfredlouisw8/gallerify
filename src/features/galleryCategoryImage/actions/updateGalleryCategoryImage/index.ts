'use server'

import { revalidatePath } from 'next/cache'

import getGalleryCategoryImageById from '@/features/galleryCategoryImage/actions/getGalleryCategoryImageById'
import { GalleryCategoryImageSchema } from '@/features/galleryCategoryImage/actions/schema'
import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'

import { InputType, ReturnTypeSingle } from '../types'

const handler = async (data: InputType): Promise<ReturnTypeSingle> => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }

  let result

  const { categoryId, galleryCategoryImageId } = data

  try {
    result = await prisma.$transaction(async (prisma) => {
      if (!categoryId || !galleryCategoryImageId) {
        throw new Error('Gallery not found')
      }

      const existingGalleryCategoryImage = await getGalleryCategoryImageById(
        galleryCategoryImageId
      )

      if (!existingGalleryCategoryImage) {
        throw new Error('Image not found')
      }

      return await prisma.galleryCategoryImage.update({
        data: {
          categoryId,
        },
        where: {
          id: galleryCategoryImageId,
        },
      })
    })
  } catch (error: any) {
    console.error(error.message)
    return {
      error: error.message || 'Failed to update gallery',
    }
  }

  revalidatePath(`/gallery`)
  return { data: result }
}

export const updateGalleryCategoryImage = createSafeAction(
  GalleryCategoryImageSchema,
  handler
)
