'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'
import { deleteFromCloudinary } from '@/utils/cloudinary'

import getGalleryById from '../getGalleryById'
import { GallerySchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }

  let result

  const { title, bannerImage, date, isPublished, slug, galleryId } = data

  try {
    result = await prisma.$transaction(async (prisma) => {
      if (!galleryId) {
        throw new Error('Gallery not found')
      }

      const existingGallery = await getGalleryById(galleryId)

      if (!existingGallery) {
        throw new Error('Gallery not found')
      }

      const removedImage = existingGallery.bannerImage.filter(
        (image) => !bannerImage.includes(image)
      )

      if (removedImage.length > 0) {
        deleteFromCloudinary(
          removedImage.map((image) => JSON.parse(image).publicId)
        )
      }

      const gallery = await prisma.gallery.update({
        data: {
          title,
          bannerImage: bannerImage as string[],
          date: new Date(date),
          isPublished,
          slug,
        },
        where: {
          id: galleryId,
        },
      })

      return gallery
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

export const updateGallery = createSafeAction(GallerySchema, handler)
