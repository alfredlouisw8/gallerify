import { NextResponse } from 'next/server'

import getCategoryById from '@/features/galleryCategory/actions/getCategoryById'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const category = await getCategoryById(id)

  return NextResponse.json(category)
}
