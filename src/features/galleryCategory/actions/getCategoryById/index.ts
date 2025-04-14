import { Prisma } from '@prisma/client'

import prisma from '@/lib/prisma'

export default async function getCategoryById(categoryId: string) {
  const response = await prisma.galleryCategory.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      GalleryCategoryImage: true, // Include related GalleryCategoryImage
    },
  })

  return response
}

export type GalleryCategoryWithImages = Prisma.GalleryCategoryGetPayload<{
  include: { GalleryCategoryImage: true }
}>
