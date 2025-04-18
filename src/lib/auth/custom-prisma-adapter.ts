import { PrismaAdapter } from '@auth/prisma-adapter'
import { type Adapter } from 'next-auth/adapters'

import prisma from '@/lib/prisma'

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function generateUniqueUsername(name: string) {
  const base = slugifyName(name)
  let username = base
  let counter = 1

  while (await prisma.userMetadata.findUnique({ where: { username } })) {
    username = `${base}-${counter++}`
  }

  return username
}

export function CustomPrismaAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma)

  return {
    ...adapter,
    async createUser(data) {
      // Omit `id` field to let MongoDB generate ObjectId
      const { id: _, ...rest } = data

      const user = await prisma.user.create({
        data: {
          ...rest,
        },
      })

      const username = await generateUniqueUsername(data.name ?? 'user')

      await prisma.userMetadata.create({
        data: {
          userId: user.id,
          username,
        },
      })

      return user
    },
  }
}
