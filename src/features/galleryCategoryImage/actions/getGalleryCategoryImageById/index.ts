
import prisma from '@/lib/prisma'

export default async function getGalleryCategoryImageById(galleryCategoryImageId: string) {
  return await prisma.galleryCategoryImage.findUnique({
    where: {
      id: galleryCategoryImageId,
    },
  })
}
