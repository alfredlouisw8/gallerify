'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EllipsisVerticalIcon, GripVerticalIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { deleteGalleryCategory } from '@/features/galleryCategory/actions/deleteGalleryCategory'
import { reorderGalleryCategories } from '@/features/galleryCategory/actions/reorderGalleryCategories'
import DeleteGalleryDialog from '@/features/gallery/components/delete-dialog-modal'
import GalleryCategoryUpdateForm from '@/features/galleryCategory/components/gallery-category-update-form'
import { GalleryCategoryWithImages, GalleryWithCategory } from '@/types'

type GalleryCategoryListProps = {
  galleryData: GalleryWithCategory
}

type ItemProps = {
  category: GalleryCategoryWithImages
  galleryId: string
  isActive: boolean
  isDragOverlay?: boolean
  onDelete?: () => Promise<void>
}

function CategoryItem({ category, galleryId, isActive, isDragOverlay, onDelete }: ItemProps) {
  const href = `/gallery/${galleryId}/collection/${category.id}`
  const imageCount = category.GalleryCategoryImage?.length ?? 0

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isDragOverlay ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between transition-colors ${
        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/60'
      } ${isDragOverlay ? 'rounded-md border border-border bg-background shadow-lg' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="ml-3 cursor-grab touch-none active:cursor-grabbing"
        tabIndex={-1}
      >
        <GripVerticalIcon className="size-3.5 text-muted-foreground/40" />
      </button>

      {/* Category link */}
      <Link
        href={href}
        className="flex flex-1 items-center gap-2 px-2 py-2.5"
      >
        <span className="truncate text-sm">{category.name}</span>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          {imageCount}
        </span>
      </Link>

      {/* Actions */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <EllipsisVerticalIcon className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1" align="end">
          <GalleryCategoryUpdateForm
            galleryId={galleryId}
            galleryCategoryData={category}
          />
          <DeleteGalleryDialog
            triggerComponent={
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash2Icon className="size-3.5 mr-1" />
                Delete
              </button>
            }
            title="Delete category?"
            description={`"${category.name}" and all its photos will be permanently deleted.`}
            onConfirm={onDelete}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function GalleryCategoryList({ galleryData }: GalleryCategoryListProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [categories, setCategories] = useState<GalleryCategoryWithImages[]>(() =>
    [...galleryData.GalleryCategory].sort((a, b) => a.displayOrder - b.displayOrder)
  )
  const [activeId, setActiveId] = useState<string | null>(null)

  // Sync when server re-renders pass fresh galleryData (e.g. after router.refresh())
  useEffect(() => {
    setCategories(
      [...galleryData.GalleryCategory].sort((a, b) => a.displayOrder - b.displayOrder)
    )
  }, [galleryData.GalleryCategory])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(categories, oldIndex, newIndex)

    setCategories(reordered)
    reorderGalleryCategories(
      galleryData.id,
      reordered.map((c) => c.id)
    )
  }

  const activeCategory = activeId ? categories.find((c) => c.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {categories.map((category) => {
            const href = `/gallery/${galleryData.id}/collection/${category.id}`
            const handleDelete = async () => {
              await deleteGalleryCategory(category.id)
              setCategories((prev) => prev.filter((c) => c.id !== category.id))
              router.refresh()
              // If the deleted category is currently active, navigate to gallery root
              if (pathname === href) {
                const remaining = categories.filter((c) => c.id !== category.id)
                if (remaining.length > 0) {
                  router.push(`/gallery/${galleryData.id}/collection/${remaining[0].id}`)
                } else {
                  router.push(`/gallery/${galleryData.id}`)
                }
              }
            }
            return (
              <CategoryItem
                key={category.id}
                category={category}
                galleryId={galleryData.id}
                isActive={pathname === href}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeCategory && (
          <CategoryItem
            category={activeCategory}
            galleryId={galleryData.id}
            isActive={false}
            isDragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
