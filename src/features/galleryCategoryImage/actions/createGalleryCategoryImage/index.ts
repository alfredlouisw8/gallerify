'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'

import { GalleryCategoryImageSchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }

  let result

  const { categoryId, imageUrl } = data

  try {
    const gallery = await prisma.galleryCategory.findUnique({
      where: { id: categoryId },
      select: { galleryId: true },
    })

    if (!gallery) {
      return { error: 'Gallery category not found' }
    }

    result = await prisma.$transaction(async (prisma) => {
      const createdImages = await Promise.all(
        imageUrl.map((url) =>
          prisma.galleryCategoryImage.create({
            data: {
              imageUrl: url as string,
              categoryId,
            },
          })
        )
      )

      return createdImages
    })

    console.log(`/gallery/${gallery.galleryId}/collection/${categoryId}`)

    revalidatePath(`/gallery/${gallery.galleryId}/collection/${categoryId}`)
    return { data: result }
  } catch (error: any) {
    console.error(error.message)
    return {
      error: 'Failed to create gallery category image',
    }
  }
}

export const createGalleryCategoryImage = createSafeAction(
  GalleryCategoryImageSchema,
  handler
)
