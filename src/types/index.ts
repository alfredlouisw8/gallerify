// =============================================
// App-level TypeScript types (replacing Prisma generated types)
// These mirror the database schema but use camelCase
// =============================================

export type User = {
  id: string
  name: string | null
  email: string
  username: string
  emailVerified: Date | null
  password: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export type Account = {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  createdAt: Date
  updatedAt: Date
}

export type Session = {
  id: string
  sessionToken: string
  userId: string
  expires: Date
  createdAt: Date
  updatedAt: Date
}

export type UserMetadata = {
  id: string
  userId: string
  bannerImage: string | null
  whatsapp: string | null
  instagram: string | null
  aboutImage: string | null
  aboutText: string | null
  logo: string | null
}

export type UserMetadataWithUser = UserMetadata & {
  user: {
    username: string
  }
}

export type Gallery = {
  id: string
  title: string
  slug: string
  bannerImage: string[]
  userId: string
  date: Date
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export type GalleryCategory = {
  id: string
  name: string
  galleryId: string
}

export type GalleryCategoryImage = {
  id: string
  imageUrl: string
  categoryId: string
}

// Joined types (replaces Prisma include patterns)
export type GalleryWithCategory = Gallery & {
  GalleryCategory: GalleryCategoryWithImages[]
}

export type GalleryCategoryWithImages = GalleryCategory & {
  GalleryCategoryImage: GalleryCategoryImage[]
}

export type GalleryWithCategoryList = Gallery & {
  GalleryCategory: GalleryCategory[]
}

// =============================================
// Raw Supabase row types (snake_case from DB)
// Used internally for mapping DB rows → App types
// =============================================

export type UserRow = {
  id: string
  name: string | null
  email: string
  username: string
  email_verified: string | null
  password: string | null
  image: string | null
  created_at: string
  updated_at: string
}

export type UserMetadataRow = {
  id: string
  user_id: string
  banner_image: string | null
  whatsapp: string | null
  instagram: string | null
  about_image: string | null
  about_text: string | null
  logo: string | null
}

export type GalleryRow = {
  id: string
  title: string
  slug: string
  banner_image: string[]
  user_id: string
  date: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export type GalleryCategoryRow = {
  id: string
  name: string
  gallery_id: string
}

export type GalleryCategoryImageRow = {
  id: string
  image_url: string
  category_id: string
}

// =============================================
// Row → App type mappers
// =============================================

export function mapGallery(row: GalleryRow): Gallery {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    bannerImage: row.banner_image ?? [],
    userId: row.user_id,
    date: new Date(row.date),
    isPublished: row.is_published,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export function mapGalleryCategory(row: GalleryCategoryRow): GalleryCategory {
  return {
    id: row.id,
    name: row.name,
    galleryId: row.gallery_id,
  }
}

export function mapGalleryCategoryImage(
  row: GalleryCategoryImageRow
): GalleryCategoryImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    categoryId: row.category_id,
  }
}

export function mapUserMetadata(row: UserMetadataRow): UserMetadata {
  return {
    id: row.id,
    userId: row.user_id,
    bannerImage: row.banner_image,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    aboutImage: row.about_image,
    aboutText: row.about_text,
    logo: row.logo,
  }
}
