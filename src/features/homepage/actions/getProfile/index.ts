import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/prisma'

export default async function getProfile() {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'Unauthorized',
    }
  }
  return await prisma.userMetadata.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  })
}
