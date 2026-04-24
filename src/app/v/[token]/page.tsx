import { CalendarIcon, CameraIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { getVendorShareByToken } from '@/features/gallery/actions/getVendorShareByToken'
import { VendorGalleryClient } from './VendorGalleryClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const share = await getVendorShareByToken(token)
  if (!share || share === 'expired') return { title: 'Vendor Gallery' }
  return {
    title: `Photos for ${share.vendorName}`,
    description: `Gallery shared by ${share.photographer.name ?? 'your photographer'}`,
  }
}

export default async function VendorSharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const share = await getVendorShareByToken(token)

  if (!share) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white gap-3">
        <CameraIcon className="size-10 text-neutral-600" />
        <p className="text-lg font-semibold">Link not found</p>
        <p className="text-sm text-neutral-400">This vendor gallery link doesn&apos;t exist or has been removed.</p>
      </div>
    )
  }

  if (share === 'expired') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white gap-3">
        <CalendarIcon className="size-10 text-neutral-600" />
        <p className="text-lg font-semibold">Link expired</p>
        <p className="text-sm text-neutral-400">This vendor gallery link has expired. Please contact the photographer.</p>
      </div>
    )
  }

  return <VendorGalleryClient share={share} token={token} />
}

