'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import prisma from '@/lib/prisma'

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

  const { title, bannerImage, date, isPublished, slug } = data

  try {
    result = await prisma.$transaction(async (prisma) => {
      const gallery = await prisma.gallery.create({
        data: {
          title,
          bannerImage: bannerImage as string[],
          userId: session.user.id,
          date: new Date(date),
          isPublished,
          slug,
        },
      })

      const galleryCategory = await prisma.galleryCategory.create({
        data: {
          galleryId: gallery.id,
          name: 'Category 1',
        },
      })

      return gallery
    })
  } catch (error: any) {
    console.error(error.message)
    return {
      error: 'Failed to create gallery',
    }
  }

  revalidatePath(`/gallery`)
  return { data: result }
}

export const createGallery = createSafeAction(GallerySchema, handler)
