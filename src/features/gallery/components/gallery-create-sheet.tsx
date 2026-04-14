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

import GalleryCreateForm from './gallery-create-form'

export default function GalleryCreateSheet() {
  const [open, setOpen] = useState(false)

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
