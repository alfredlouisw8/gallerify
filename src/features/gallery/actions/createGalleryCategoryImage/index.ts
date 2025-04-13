'use server'

import { revalidatePath } from 'next/cache'

import prisma from '@/lib/prisma'

type ImageInput = {
  url: string
}

type Params = {
  galleryCategoryId: string
  images: ImageInput[]
}

export async function createGalleryCategoryImages({
  galleryCategoryId,
  images,
}: Params) {
  let result

  try {
    result = await prisma.$transaction(async (prisma) => {
      return await prisma.galleryCategoryImage.createMany({
        data: images.map((image) => ({
          imageUrl: image.url,
          categoryId: galleryCategoryId,
        })),
      })
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
