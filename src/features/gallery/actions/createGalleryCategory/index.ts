'use server'

import prisma from '@/lib/prisma'

type Params = {
  galleryId: string
  name: string
}

export async function createGalleryCategory({ galleryId, name }: Params) {
  return await prisma.galleryCategory.create({
    data: {
      galleryId: galleryId,
      name: name,
    },
  })
}
