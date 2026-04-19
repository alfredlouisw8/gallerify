'use client'

import { CheckIcon, PlusIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { createGalleryCategory } from '@/features/galleryCategory/actions/createGalleryCategory'
import { GalleryCategoryWithImages, GalleryWithCategory } from '@/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  galleryData: GalleryWithCategory
  collectionId: string
  count: number
  onMove: (targetCategoryId: string) => Promise<void>
}

export default function MoveToCategoryModal({
  open,
  onOpenChange,
  galleryData,
  collectionId,
  count,
  onMove,
}: Props) {
  const [categories, setCategories] = useState<GalleryCategoryWithImages[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [isMoving, setIsMoving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [isCreatingLoading, setIsCreatingLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync from prop — excludes current collection and reflects deletions
  useEffect(() => {
    setCategories(
      (galleryData.GalleryCategory as GalleryCategoryWithImages[]).filter(
        (c) => c.id !== collectionId
      )
    )
  }, [galleryData.GalleryCategory, collectionId])

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setSelectedId('')
      setIsCreating(false)
      setNewName('')
    }
  }, [open])

  // Focus input when inline create opens
  useEffect(() => {
    if (isCreating) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isCreating])

  const handleMove = async () => {
    if (!selectedId) return
    setIsMoving(true)
    try {
      await onMove(selectedId)
      onOpenChange(false)
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Move failed',
        variant: 'destructive',
      })
    } finally {
      setIsMoving(false)
    }
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    setIsCreatingLoading(true)
    try {
      const result = await createGalleryCategory({
        galleryId: galleryData.id,
        name,
        galleryCategoryId: '',
      })
      if (result.error) throw new Error(result.error)
      if (result.data) {
        const newCat: GalleryCategoryWithImages = {
          ...result.data,
          GalleryCategoryImage: [],
        }
        setCategories((prev) => [...prev, newCat])
        setSelectedId(result.data.id)
        setIsCreating(false)
        setNewName('')
      }
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Failed to create category',
        variant: 'destructive',
      })
    } finally {
      setIsCreatingLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Move {count > 1 ? `${count} photos` : 'photo'} to
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 py-2">
          {/* Category list */}
          {categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No other categories
            </p>
          ) : (
            <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {categories.map((cat) => {
                const isSelected = selectedId === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedId(cat.id)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/40'
                      }`}
                    >
                      {isSelected && <CheckIcon className="size-2.5 text-primary-foreground" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 truncate text-left font-medium">
                      {cat.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {cat.GalleryCategoryImage.length}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Inline create */}
          <div className="mt-1 border-t pt-2">
            {isCreating ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleCreate()
                    if (e.key === 'Escape') {
                      setIsCreating(false)
                      setNewName('')
                    }
                  }}
                  placeholder="Category name"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
                <Button
                  size="sm"
                  onClick={() => void handleCreate()}
                  disabled={!newName.trim() || isCreatingLoading}
                >
                  {isCreatingLoading ? '…' : 'Create'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false)
                    setNewName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <PlusIcon className="size-3.5" />
                Create new category
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => void handleMove()}
            disabled={!selectedId || isMoving}
          >
            {isMoving ? 'Moving…' : 'Move'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
