'use server'

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
  return await prisma.galleryCategoryImage.createMany({
    data: images.map((image) => ({
      imageUrl: image.url,
      categoryId: galleryCategoryId,
    })),
  })
}
