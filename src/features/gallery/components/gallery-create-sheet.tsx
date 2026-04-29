'use client'

import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import GalleryCreateForm from './gallery-create-form'

type Props = {
  canCreate: boolean
}

export default function GalleryCreateSheet({ canCreate }: Props) {
  const [open, setOpen] = useState(false)

  if (!canCreate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button size="sm" className="gap-2 rounded-full" disabled>
                <PlusIcon className="size-3.5" />
                New gallery
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Your subscription has expired. Please upgrade to create galleries.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2 rounded-full">
          <PlusIcon className="size-3.5" />
          New gallery
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-4">
          <SheetTitle>Create gallery</SheetTitle>
        </SheetHeader>
        <GalleryCreateForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
