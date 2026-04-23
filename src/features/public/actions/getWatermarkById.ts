import supabase from '@/lib/supabase'
import { Watermark, WatermarkRow, mapWatermark } from '@/types'

export async function getWatermarkById(id: string): Promise<Watermark | null> {
  const { data, error } = await supabase
    .from('watermarks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapWatermark(data as WatermarkRow)
}
