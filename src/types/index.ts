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
  name: string | null
  username: string | null
  bannerImage: string | null
  whatsapp: string | null
  instagram: string | null
  aboutImage: string | null
  aboutText: string | null
  logo: string | null
  // Subscription / billing
  plan: string
  trialEndsAt: string | null
  storageUsedBytes: number
  lsCustomerId: string | null
  lsSubscriptionId: string | null
  subscriptionStatus: string
  currentPeriodEnd: string | null
  homepagePreferences: HomepagePreferences
}

export type HomepagePreferences = {
  colorTheme: 'dark' | 'light' | 'rose' | 'sand' | 'olive'
  accentColor: 'gold' | 'ivory' | 'sage' | 'rose' | 'slate'
  fontPairing: 'bodoni-jost' | 'playfair-inter' | 'cormorant-outfit'
  overlayIntensity: 'subtle' | 'medium' | 'strong'
  coverPosition: 'left' | 'center' | 'right'
}

export const DEFAULT_HOMEPAGE_PREFERENCES: HomepagePreferences = {
  colorTheme: 'dark',
  accentColor: 'gold',
  fontPairing: 'bodoni-jost',
  overlayIntensity: 'medium',
  coverPosition: 'center',
}

export type GalleryPreferences = {
  titleAlign: 'left' | 'center' | 'right'
  colorTheme: 'dark' | 'light' | 'rose' | 'sand' | 'olive'
  photoLayout: 'masonry' | 'grid' | 'editorial'
  accentColor: 'gold' | 'ivory' | 'sage' | 'rose' | 'slate'
  fontPairing: 'bodoni-jost' | 'playfair-inter' | 'cormorant-outfit'
  photoSpacing: 'tight' | 'relaxed' | 'airy'
  overlayIntensity: 'subtle' | 'medium' | 'strong'
  thumbnailSize: 'regular' | 'large'
}

export const DEFAULT_GALLERY_PREFERENCES: GalleryPreferences = {
  titleAlign: 'left',
  colorTheme: 'dark',
  photoLayout: 'masonry',
  accentColor: 'gold',
  fontPairing: 'bodoni-jost',
  photoSpacing: 'relaxed',
  overlayIntensity: 'medium',
  thumbnailSize: 'regular',
}

export type Gallery = {
  id: string
  title: string
  slug: string
  bannerImage: string[]
  userId: string
  date: Date
  isPublished: boolean
  preferences: GalleryPreferences
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
  displayOrder: number
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
  name: string | null
  username: string | null
  banner_image: string | null
  whatsapp: string | null
  instagram: string | null
  about_image: string | null
  about_text: string | null
  logo: string | null
  // Subscription / billing
  plan: string
  trial_ends_at: string | null
  storage_used_bytes: number
  ls_customer_id: string | null
  ls_subscription_id: string | null
  subscription_status: string
  current_period_end: string | null
  homepage_preferences: Record<string, unknown> | null
}

export type GalleryRow = {
  id: string
  title: string
  slug: string
  banner_image: string[]
  user_id: string
  date: string
  is_published: boolean
  preferences: Record<string, unknown> | null
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
  display_order: number
}

// =============================================
// Row → App type mappers
// =============================================

function parseHomepagePreferences(raw: Record<string, unknown> | null | undefined): HomepagePreferences {
  return {
    colorTheme: (['dark', 'light', 'rose', 'sand', 'olive'].includes(raw?.colorTheme as string)
      ? raw!.colorTheme
      : DEFAULT_HOMEPAGE_PREFERENCES.colorTheme) as HomepagePreferences['colorTheme'],
    accentColor: (['gold', 'ivory', 'sage', 'rose', 'slate'].includes(raw?.accentColor as string)
      ? raw!.accentColor
      : DEFAULT_HOMEPAGE_PREFERENCES.accentColor) as HomepagePreferences['accentColor'],
    fontPairing: (['bodoni-jost', 'playfair-inter', 'cormorant-outfit'].includes(raw?.fontPairing as string)
      ? raw!.fontPairing
      : DEFAULT_HOMEPAGE_PREFERENCES.fontPairing) as HomepagePreferences['fontPairing'],
    overlayIntensity: (['subtle', 'medium', 'strong'].includes(raw?.overlayIntensity as string)
      ? raw!.overlayIntensity
      : DEFAULT_HOMEPAGE_PREFERENCES.overlayIntensity) as HomepagePreferences['overlayIntensity'],
    coverPosition: (['left', 'center', 'right'].includes(raw?.coverPosition as string)
      ? raw!.coverPosition
      : DEFAULT_HOMEPAGE_PREFERENCES.coverPosition) as HomepagePreferences['coverPosition'],
  }
}

function parsePreferences(raw: Record<string, unknown> | null | undefined): GalleryPreferences {
  return {
    titleAlign: (['left', 'center', 'right'].includes(raw?.titleAlign as string)
      ? raw!.titleAlign
      : DEFAULT_GALLERY_PREFERENCES.titleAlign) as GalleryPreferences['titleAlign'],
    colorTheme: (['dark', 'light', 'rose', 'sand', 'olive'].includes(raw?.colorTheme as string)
      ? raw!.colorTheme
      : DEFAULT_GALLERY_PREFERENCES.colorTheme) as GalleryPreferences['colorTheme'],
    photoLayout: (['masonry', 'grid', 'editorial'].includes(raw?.photoLayout as string)
      ? raw!.photoLayout
      : DEFAULT_GALLERY_PREFERENCES.photoLayout) as GalleryPreferences['photoLayout'],
    accentColor: (['gold', 'ivory', 'sage', 'rose', 'slate'].includes(raw?.accentColor as string)
      ? raw!.accentColor
      : DEFAULT_GALLERY_PREFERENCES.accentColor) as GalleryPreferences['accentColor'],
    fontPairing: (['bodoni-jost', 'playfair-inter', 'cormorant-outfit'].includes(raw?.fontPairing as string)
      ? raw!.fontPairing
      : DEFAULT_GALLERY_PREFERENCES.fontPairing) as GalleryPreferences['fontPairing'],
    photoSpacing: (['tight', 'relaxed', 'airy'].includes(raw?.photoSpacing as string)
      ? raw!.photoSpacing
      : DEFAULT_GALLERY_PREFERENCES.photoSpacing) as GalleryPreferences['photoSpacing'],
    overlayIntensity: (['subtle', 'medium', 'strong'].includes(raw?.overlayIntensity as string)
      ? raw!.overlayIntensity
      : DEFAULT_GALLERY_PREFERENCES.overlayIntensity) as GalleryPreferences['overlayIntensity'],
    thumbnailSize: (['regular', 'large'].includes(raw?.thumbnailSize as string)
      ? raw!.thumbnailSize
      : DEFAULT_GALLERY_PREFERENCES.thumbnailSize) as GalleryPreferences['thumbnailSize'],
  }
}

export function mapGallery(row: GalleryRow): Gallery {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    bannerImage: row.banner_image ?? [],
    userId: row.user_id,
    date: new Date(row.date),
    isPublished: row.is_published,
    preferences: parsePreferences(row.preferences),
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
    displayOrder: row.display_order ?? 0,
  }
}

export function mapUserMetadata(row: UserMetadataRow): UserMetadata {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name ?? null,
    username: row.username,
    bannerImage: row.banner_image,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    aboutImage: row.about_image,
    aboutText: row.about_text,
    logo: row.logo,
    plan: row.plan ?? 'free_trial',
    trialEndsAt: row.trial_ends_at ?? null,
    storageUsedBytes: row.storage_used_bytes ?? 0,
    lsCustomerId: row.ls_customer_id ?? null,
    lsSubscriptionId: row.ls_subscription_id ?? null,
    subscriptionStatus: row.subscription_status ?? 'trialing',
    currentPeriodEnd: row.current_period_end ?? null,
    homepagePreferences: parseHomepagePreferences(row.homepage_preferences),
  }
}
