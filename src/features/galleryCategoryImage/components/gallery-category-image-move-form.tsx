'use client'

import { ArrowRightFromLineIcon } from 'lucide-react'
import React, { useState } from 'react'

import { SelectFormField } from '@/components/forms/select-form-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { GalleryWithCategory } from '@/features/gallery/actions/getGalleryById'
import useGalleryCategoryImageMoveForm from '@/features/galleryCategoryImage/hooks/use-gallery-category-image-move-form'

type GalleryCategoryImageAddFormProps = {
  categoryImageId: string
  mutateData: () => void
  galleryData: GalleryWithCategory
  setDialogOpen: (open: boolean) => void
}

export default function GalleryCategoryImageMoveForm({
  categoryImageId,
  mutateData,
  galleryData,
  setDialogOpen,
}: GalleryCategoryImageAddFormProps) {
  const [open, setOpen] = useState(false)

  const onSuccessCallback = () => {
    mutateData()
    setOpen(false)
    setDialogOpen(false)
  }

  const categories = galleryData.GalleryCategory.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  const { form, handleSubmit } = useGalleryCategoryImageMoveForm({
    categoryImageId,
    onSuccessCallback,
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        setDialogOpen(v)
      }}
    >
      <DialogTrigger
        onClick={() => setOpen(true)}
        asChild
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" className="w-full justify-start py-6">
          <ArrowRightFromLineIcon className="ml-2 mr-4 size-4" />
          Move
        </Button>
      </DialogTrigger>
      <DialogContent className="z-50 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Move Image to</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-8"
            >
              <SelectFormField
                name="categoryId"
                label="Select Category"
                items={categories}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Move
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
