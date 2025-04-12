import prisma from '@/lib/prisma'

export default async function getGalleryById(galleryId: string) {
  const response = await prisma.gallery.findUnique({
    where: {
      id: galleryId,
    },
    include: {
      GalleryCategory: {
        include: {
          GalleryCategoryImage: true, // Include related GalleryCategoryImage
        },
      },
    },
  })

  return response
}
