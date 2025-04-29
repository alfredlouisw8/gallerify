import { UserMetadata } from '@prisma/client'

export type ProfileData = UserMetadata & {
  user: {
    username: string
  }
}
