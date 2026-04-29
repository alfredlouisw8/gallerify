'use client'

import { useTranslations } from 'next-intl'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Watermark } from '@/types'
import { WatermarkTab } from './WatermarkTab'

type Props = {
  publicContent: React.ReactNode
  initialWatermarks: Watermark[]
}

export function HomepageTabs({ publicContent, initialWatermarks }: Props) {
  const t = useTranslations('HomepageTabs')

  return (
    <Tabs defaultValue="public-page" className="space-y-5">
      <TabsList className="h-9 rounded-lg bg-muted p-1 gap-0.5">
        <TabsTrigger value="public-page" className="h-7 rounded-md px-4 text-xs">
          {t('publicPage')}
        </TabsTrigger>
        <TabsTrigger value="watermarks" className="h-7 rounded-md px-4 text-xs">
          {t('watermarks')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="public-page" className="mt-0">
        {publicContent}
      </TabsContent>

      <TabsContent value="watermarks" className="mt-0">
        <WatermarkTab initialWatermarks={initialWatermarks} />
      </TabsContent>
    </Tabs>
  )
}
