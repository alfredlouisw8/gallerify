import prisma from '@/lib/prisma'

export default async function getImagesByCategoryId(categoryId: string) {
  const response = await prisma.galleryCategoryImage.findMany({
    where: {
      categoryId,
    },
  })

  return response
}
