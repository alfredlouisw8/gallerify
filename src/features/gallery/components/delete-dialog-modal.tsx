'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

import deleteGallery from '../actions/deleteGallery'

type Props = {
  triggerComponent: React.ReactNode
  galleryId?: string
  onConfirm?: () => Promise<void>
  title?: string
  description?: string
}

export default function DeleteGalleryDialog({
  triggerComponent,
  galleryId,
  onConfirm,
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone.',
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      if (onConfirm) {
        await onConfirm()
      } else if (galleryId) {
        await deleteGallery(galleryId)
      }
      toast({ title: 'Deleted successfully' })
      setOpen(false)
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Failed to delete',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
