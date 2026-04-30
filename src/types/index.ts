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
  subscriptionExpiredAt: string | null
  homepagePreferences: HomepagePreferences
  customDomain: string | null
  businessName: string | null
  location: string | null
  onboardingCompleted: boolean
}

export type HomepagePreferences = {
  colorTheme: 'dark' | 'light' | 'rose' | 'sand' | 'olive'
  accentColor: 'gold' | 'ivory' | 'sage' | 'rose' | 'slate'
  fontPairing: 'bodoni-jost' | 'playfair-inter' | 'cormorant-outfit' | 'dm-serif-dm-sans' | 'fraunces-nunito-sans' | 'eb-garamond-lato' | 'cinzel-raleway' | 'lora-montserrat' | 'spectral-karla' | 'libre-baskerville-source-sans' | 'italiana-open-sans' | 'tenor-sans-mulish' | 'forum-nunito'
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
  coverDesign: 'classic' | 'centered' | 'minimal' | 'bold' | 'framed' | 'journal' | 'vintage' | 'cinematic' | 'video-classic' | 'video-centered' | 'magazine'
  colorTheme: 'dark' | 'light' | 'rose' | 'sand' | 'olive' | 'custom'
  customColorTheme?: string
  photoLayout: 'masonry' | 'grid' | 'editorial' | 'blog'
  accentColor: 'gold' | 'ivory' | 'sage' | 'rose' | 'slate' | 'custom'
  customAccentColor?: string
  fontPairing: 'bodoni-jost' | 'playfair-inter' | 'cormorant-outfit' | 'dm-serif-dm-sans' | 'fraunces-nunito-sans' | 'eb-garamond-lato' | 'cinzel-raleway' | 'lora-montserrat' | 'spectral-karla' | 'libre-baskerville-source-sans' | 'italiana-open-sans' | 'tenor-sans-mulish' | 'forum-nunito'
  photoSpacing: 'tight' | 'relaxed' | 'airy'
  overlayIntensity: 'subtle' | 'medium' | 'strong'
  thumbnailSize: 'regular' | 'large'
  grainIntensity: 'none' | 'subtle' | 'strong'
  categoryBarStyle: 'pills' | 'underline' | 'text'
  bannerFocalPoint: { x: number; y: number }
  bannerVideoUrl?: string
  collectionHeaderStyle?: 'none' | 'text-center' | 'text-left' | 'image-center'
  categoryCovers?: Record<string, string>
}

export const DEFAULT_GALLERY_PREFERENCES: GalleryPreferences = {
  coverDesign: 'classic',
  colorTheme: 'dark',
  photoLayout: 'masonry',
  accentColor: 'gold',
  fontPairing: 'bodoni-jost',
  photoSpacing: 'relaxed',
  overlayIntensity: 'medium',
  thumbnailSize: 'regular',
  grainIntensity: 'none',
  categoryBarStyle: 'pills',
  bannerFocalPoint: { x: 50, y: 50 },
}

export type Gallery = {
  id: string
  title: string
  slug: string
  bannerImage: string[]
  userId: string
  date: Date
  isPublished: boolean
  isPasswordProtected: boolean
  passwordPlain: string | null
  clientAccessEnabled: boolean
  downloadEnabled: boolean
  downloadPinRequired: boolean
  isClientPasswordProtected: boolean
  clientPasswordPlain: string | null
  showClientSelects: boolean
  watermarkId: string | null
  preferences: GalleryPreferences
  createdAt: Date
  updatedAt: Date
}

export type GalleryCategory = {
  id: string
  name: string
  galleryId: string
  displayOrder: number
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
  subscription_expired_at: string | null
  homepage_preferences: Record<string, unknown> | null
  custom_domain: string | null
  business_name: string | null
  location: string | null
  onboarding_completed: boolean
}

export type GalleryRow = {
  id: string
  title: string
  slug: string
  banner_image: string[]
  user_id: string
  date: string
  is_published: boolean
  password_hash: string | null
  password_plain: string | null
  client_access_enabled: boolean | null
  download_enabled: boolean | null
  download_pin: string | null
  client_password_hash: string | null
  client_password_plain: string | null
  show_client_selects: boolean | null
  watermark_id: string | null
  preferences: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type GalleryCategoryRow = {
  id: string
  name: string
  gallery_id: string
  display_order: number
}

export type GalleryCategoryImageRow = {
  id: string
  image_url: string
  category_id: string
  display_order: number
}

// =============================================
// Image comment types
// =============================================

export type ImageCommentType = 'comment' | 'feedback' | 'request'

export type ImageComment = {
  id: string
  galleryId: string
  imageId: string
  clientName: string | null
  type: ImageCommentType
  comment: string
  createdAt: string
  ownerReply: string | null
  ownerRepliedAt: string | null
  isDone: boolean
  doneAt: string | null
}

export type ImageCommentRow = {
  id: string
  gallery_id: string
  image_id: string
  client_name: string | null
  type: 'comment' | 'feedback' | 'request'
  comment: string
  created_at: string
  owner_reply: string | null
  owner_replied_at: string | null
  is_done: boolean
  done_at: string | null
}

export function mapImageComment(row: ImageCommentRow): ImageComment {
  return {
    id: row.id,
    galleryId: row.gallery_id,
    imageId: row.image_id,
    clientName: row.client_name,
    type: row.type,
    comment: row.comment,
    createdAt: row.created_at,
    ownerReply: row.owner_reply ?? null,
    ownerRepliedAt: row.owner_replied_at ?? null,
    isDone: row.is_done ?? false,
    doneAt: row.done_at ?? null,
  }
}

// =============================================
// Watermark types
// =============================================

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type Watermark = {
  id: string
  userId: string
  name: string
  type: 'text' | 'image'
  text: string | null
  textColor: 'white' | 'black'
  imageUrl: string | null
  scale: number
  opacity: number
  position: WatermarkPosition
  createdAt: string
  updatedAt: string
}

export type WatermarkRow = {
  id: string
  user_id: string
  name: string
  type: 'text' | 'image'
  text: string | null
  text_color: 'white' | 'black'
  image_url: string | null
  scale: number
  opacity: number
  position: string
  created_at: string
  updated_at: string
}

const VALID_WATERMARK_POSITIONS: WatermarkPosition[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

export function mapWatermark(row: WatermarkRow): Watermark {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    text: row.text,
    textColor: row.text_color,
    imageUrl: row.image_url,
    scale: row.scale,
    opacity: row.opacity,
    position: VALID_WATERMARK_POSITIONS.includes(row.position as WatermarkPosition)
      ? (row.position as WatermarkPosition)
      : 'bottom-center',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
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
    fontPairing: (['bodoni-jost', 'playfair-inter', 'cormorant-outfit', 'dm-serif-dm-sans', 'fraunces-nunito-sans', 'eb-garamond-lato', 'cinzel-raleway', 'lora-montserrat', 'spectral-karla', 'libre-baskerville-source-sans', 'italiana-open-sans', 'tenor-sans-mulish', 'forum-nunito'].includes(raw?.fontPairing as string)
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
    coverDesign: (['classic', 'centered', 'minimal', 'bold', 'framed', 'journal', 'vintage', 'cinematic', 'video-classic', 'video-centered', 'magazine'].includes(raw?.coverDesign as string)
      ? raw!.coverDesign
      : (['left', 'center', 'right'].includes(raw?.titleAlign as string) ? 'classic' : DEFAULT_GALLERY_PREFERENCES.coverDesign)) as GalleryPreferences['coverDesign'],
    colorTheme: (['dark', 'light', 'rose', 'sand', 'olive', 'custom'].includes(raw?.colorTheme as string)
      ? raw!.colorTheme
      : DEFAULT_GALLERY_PREFERENCES.colorTheme) as GalleryPreferences['colorTheme'],
    customColorTheme: typeof raw?.customColorTheme === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.customColorTheme)
      ? raw.customColorTheme
      : undefined,
    photoLayout: (['masonry', 'grid', 'editorial', 'blog'].includes(raw?.photoLayout as string)
      ? raw!.photoLayout
      : DEFAULT_GALLERY_PREFERENCES.photoLayout) as GalleryPreferences['photoLayout'],
    accentColor: (['gold', 'ivory', 'sage', 'rose', 'slate', 'custom'].includes(raw?.accentColor as string)
      ? raw!.accentColor
      : DEFAULT_GALLERY_PREFERENCES.accentColor) as GalleryPreferences['accentColor'],
    customAccentColor: typeof raw?.customAccentColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.customAccentColor)
      ? raw.customAccentColor
      : undefined,
    fontPairing: (['bodoni-jost', 'playfair-inter', 'cormorant-outfit', 'dm-serif-dm-sans', 'fraunces-nunito-sans', 'eb-garamond-lato', 'cinzel-raleway', 'lora-montserrat', 'spectral-karla', 'libre-baskerville-source-sans', 'italiana-open-sans', 'tenor-sans-mulish', 'forum-nunito'].includes(raw?.fontPairing as string)
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
    grainIntensity: (['none', 'subtle', 'strong'].includes(raw?.grainIntensity as string)
      ? raw!.grainIntensity
      : DEFAULT_GALLERY_PREFERENCES.grainIntensity) as GalleryPreferences['grainIntensity'],
    categoryBarStyle: (['pills', 'underline', 'text'].includes(raw?.categoryBarStyle as string)
      ? raw!.categoryBarStyle
      : DEFAULT_GALLERY_PREFERENCES.categoryBarStyle) as GalleryPreferences['categoryBarStyle'],
    bannerFocalPoint: (
      raw?.bannerFocalPoint !== null &&
      typeof raw?.bannerFocalPoint === 'object' &&
      typeof (raw.bannerFocalPoint as Record<string, unknown>).x === 'number' &&
      typeof (raw.bannerFocalPoint as Record<string, unknown>).y === 'number'
    ) ? raw!.bannerFocalPoint as { x: number; y: number }
      : DEFAULT_GALLERY_PREFERENCES.bannerFocalPoint,
    bannerVideoUrl: typeof raw?.bannerVideoUrl === 'string' ? raw.bannerVideoUrl : undefined,
    collectionHeaderStyle: (['none', 'text-center', 'text-left', 'image-center'].includes(raw?.collectionHeaderStyle as string)
      ? raw!.collectionHeaderStyle
      : undefined) as GalleryPreferences['collectionHeaderStyle'],
    categoryCovers: (raw?.categoryCovers !== null && typeof raw?.categoryCovers === 'object' && !Array.isArray(raw.categoryCovers))
      ? raw.categoryCovers as Record<string, string>
      : undefined,
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
    isPasswordProtected: !!row.password_hash,
    passwordPlain: row.password_plain ?? null,
    clientAccessEnabled: !!row.client_access_enabled,
    downloadEnabled: !!row.download_enabled,
    downloadPinRequired: !!row.download_enabled && !!row.download_pin,
    isClientPasswordProtected: !!row.client_password_hash,
    clientPasswordPlain: row.client_password_plain ?? null,
    showClientSelects: !!row.show_client_selects,
    watermarkId: row.watermark_id ?? null,
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
    displayOrder: row.display_order ?? 0,
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
    subscriptionExpiredAt: row.subscription_expired_at ?? null,
    homepagePreferences: parseHomepagePreferences(row.homepage_preferences),
    customDomain: row.custom_domain ?? null,
    businessName: row.business_name ?? null,
    location: row.location ?? null,
    onboardingCompleted: row.onboarding_completed ?? false,
  }
}
