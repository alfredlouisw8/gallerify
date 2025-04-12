'use client'

import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Gallery, GalleryCategory, GalleryCategoryImage } from '@prisma/client'
import {
  ArrowRightFromLineIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  ImageIcon,
  TrashIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import DeleteGalleryDialog from '@/features/gallery/components/delete-dialog-modal'

type GalleryDetailProps = {
  galleryData: Gallery
  collectionId: string
}

export default function GalleryCategoryDetail({
  galleryData,
  collectionId,
}: GalleryDetailProps) {
  const collection = galleryData.GalleryCategory.find(
    (cat: GalleryCategory) => cat.id === collectionId
  )

  const [images, setImages] = useState(collection.GalleryCategoryImage)
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setImages((items: GalleryCategoryImage[]) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const handleDragEnd = () => {
    setActiveId(null)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid p-4">
        {images.length === 0 ? (
          <div className="flex h-full items-center justify-center border-2 border-dotted p-6 hover:cursor-pointer">
            <div className="text-sm text-gray-600">
              Drag and drop or select a file
            </div>
          </div>
        ) : (
          <SortableContext
            items={images.map((img: GalleryCategoryImage) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className="xs:grid-cols-[repeat(auto-fill,_minmax(75px,1fr))] grid grid-cols-2
gap-4
md:grid-cols-[repeat(auto-fill,_minmax(150px,1fr))]  "
            >
              {images.map((item: GalleryCategoryImage) => (
                <DraggableImage
                  key={item.id}
                  item={item}
                  isBeingDragged={activeId === item.id}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {/* Dragged Image Preview (While Moving) */}
      <DragOverlay>
        {activeId ? (
          <Image
            src={
              JSON.parse(
                images.find((img: GalleryCategoryImage) => img.id === activeId)
                  ?.imageUrl
              ).url || ''
            }
            alt="Dragged Image"
            width={150}
            height={150}
            className="size-full object-contain opacity-100"
            priority
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// 🎯 Draggable Image Component
function DraggableImage({
  item,
  isBeingDragged,
}: {
  item: GalleryCategoryImage
  isBeingDragged: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative h-52 cursor-grab bg-gray-50 p-2"
    >
      <Image
        src={JSON.parse(item.imageUrl).url}
        alt="1"
        width={150}
        height={150}
        className={`size-full rounded-lg object-contain ${
          isBeingDragged ? 'opacity-20' : ''
        }`}
        priority
      />
      <div className="absolute right-1 top-1 z-10 rounded p-2 opacity-0 transition group-hover:opacity-100">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="z-20 size-7"
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag on click
            >
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align={'start'}>
            <div className="grid">
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag
              >
                <DownloadIcon className="ml-6 mr-4 size-4 " />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag
              >
                <ArrowRightFromLineIcon className="ml-6 mr-4 size-4 " />
                Move
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag
              >
                <ImageIcon className="ml-6 mr-4 size-4 " />
                Set as Cover
              </Button>
              <DeleteGalleryDialog
                triggerComponent={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full justify-start"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag
                  >
                    <TrashIcon className="ml-6 mr-4 size-4" />
                    Delete
                  </Button>
                }
                galleryId={item.id}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
