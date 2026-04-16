'use client'

import { PlusCircleIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { MultiImageUpload } from '@/components/forms/multi-image-upload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import useGalleryCategoryImageAddForm from '@/features/galleryCategoryImage/hooks/use-gallery-category-image-add-form'

type GalleryCategoryImageAddFormProps = {
  collectionId: string
  mutateData: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function GalleryCategoryImageAddForm({
  collectionId,
  mutateData,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: GalleryCategoryImageAddFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen! : internalOpen
  const setOpen = (value: boolean) => {
    if (isControlled) externalOnOpenChange?.(value)
    else setInternalOpen(value)
  }

  // Reset form contents each time the dialog opens
  const prevOpen = useRef(open)
  useEffect(() => {
    if (open && !prevOpen.current) {
      setFormKey((k) => k + 1)
    }
    prevOpen.current = open
  }, [open])

  const onSuccessCallback = () => {
    mutateData()
    setOpen(false)
  }

  const { form, handleSubmit } = useGalleryCategoryImageAddForm({
    collectionId,
    onSuccessCallback,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        <Button variant="ghost">
          <PlusCircleIcon className="mr-2 size-3" />
          Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>add your amazing image</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              key={formKey}
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-8"
            >
              <MultiImageUpload
                name="imageUrl"
                accept="image/*"
                required
                imagePreview
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                Submit
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
