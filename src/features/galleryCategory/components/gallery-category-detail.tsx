'use client'

import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DownloadIcon,
  EllipsisVerticalIcon,
  ImageIcon,
  TrashIcon,
  UploadCloudIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import useSWR from 'swr'

import { createGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/createGalleryCategoryImage'
import { deleteGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/deleteGalleryCategoryImage'
import { reorderGalleryCategoryImages } from '@/features/galleryCategoryImage/actions/reorderGalleryCategoryImages'
import { onImagesUpload } from '@/utils/functions'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import DeleteGalleryDialog from '@/features/gallery/components/delete-dialog-modal'
import GalleryCategoryImageAddForm from '@/features/galleryCategoryImage/components/gallery-category-image-add-form'
import GalleryCategoryImageMoveForm from '@/features/galleryCategoryImage/components/gallery-category-image-move-form'
import { getStorageUrl } from '@/lib/utils'
import {
  GalleryCategoryImage,
  GalleryCategoryWithImages,
  GalleryWithCategory,
} from '@/types'
import { fetchCategoryDetail } from '../fetcher'

type GalleryDetailProps = {
  galleryData: GalleryWithCategory
  collectionId: string
}

export default function GalleryCategoryDetail({
  galleryData,
  collectionId,
}: GalleryDetailProps) {
  const {
    data: categoryData,
    error,
    isLoading,
    mutate,
  } = useSWR<GalleryCategoryWithImages | null>(
    collectionId ? `category-detail-${collectionId}` : null,
    () => fetchCategoryDetail(collectionId)
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const [images, setImages] = useState<GalleryCategoryImage[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    uploaded: number
    total: number
  } | null>(null)

  const handleFileDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return
      setIsUploading(true)
      setUploadProgress({ uploaded: 0, total: acceptedFiles.length })
      try {
        const uploadedUrls = await onImagesUpload(
          acceptedFiles,
          'uploads',
          (uploaded, total) => setUploadProgress({ uploaded, total })
        )
        const result = await createGalleryCategoryImage({
          categoryId: collectionId,
          imageUrl: uploadedUrls,
        })
        if (result?.error) throw new Error(result.error)
        await mutate()
        toast({
          title: `${acceptedFiles.length} photo${acceptedFiles.length > 1 ? 's' : ''} uploaded!`,
        })
      } catch (err) {
        toast({
          title: err instanceof Error ? err.message : 'Upload failed',
          variant: 'destructive',
        })
      } finally {
        setIsUploading(false)
        setUploadProgress(null)
      }
    },
    [collectionId, mutate]
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop: handleFileDrop,
    multiple: true,
    accept: { 'image/*': [] },
    noClick: true,
  })
  // Always holds the latest reordered array (avoids stale closure in handleDragEnd)
  const imagesRef = useRef<GalleryCategoryImage[]>([])
  // Snapshot of order before drag started, so we can detect real changes
  const preDragOrderRef = useRef<string[]>([])

  const activeImage = activeId
    ? images?.find((img) => img.id === activeId)
    : undefined

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
    // Capture the order before any dragging happens
    preDragOrderRef.current = imagesRef.current.map((img) => img.id)
  }

  const handleDragOver = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setImages((items) => {
      if (!items) return []
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      const next = arrayMove(items, oldIndex, newIndex)
      imagesRef.current = next
      return next
    })
  }

  const handleDragEnd = async () => {
    setActiveId(null)

    const newOrder = imagesRef.current.map((img) => img.id)
    const orderChanged = newOrder.some((id, i) => id !== preDragOrderRef.current[i])
    if (!orderChanged) return

    const result = await reorderGalleryCategoryImages(newOrder)

    if (result?.error) {
      toast({ title: 'Failed to save order', description: result.error, variant: 'destructive' })
      await mutate()
      return
    }

    mutate(
      (current) => current
        ? { ...current, GalleryCategoryImage: imagesRef.current }
        : current,
      { revalidate: false }
    )

    toast({ title: 'Order saved', description: 'Image order has been updated.' })
  }

  useEffect(() => {
    if (categoryData) {
      setImages(categoryData.GalleryCategoryImage)
      imagesRef.current = categoryData.GalleryCategoryImage
    }
  }, [categoryData])

  if (isLoading) return <div>Loading images...</div>
  if (error) return <div>Failed to load images</div>

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-5">
        <h1 className="text-xl">{categoryData?.name}</h1>
        <GalleryCategoryImageAddForm
          collectionId={collectionId}
          mutateData={mutate}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
        />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid">
          {images?.length === 0 ? (
            <div
              {...getRootProps()}
              onClick={isUploading ? undefined : openFileDialog}
              className={`group flex w-full flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed px-8 py-24 text-center transition-all duration-200 ${
                isUploading
                  ? 'cursor-wait border-border bg-secondary/30'
                  : isDragActive
                    ? 'cursor-copy border-primary bg-primary/5'
                    : 'cursor-pointer border-border bg-secondary/30 hover:border-primary/30 hover:bg-secondary/60'
              }`}
            >
              <input {...getInputProps()} />
              <div
                className={`flex size-16 items-center justify-center rounded-full ring-1 transition-all duration-200 ${
                  isDragActive
                    ? 'bg-primary/10 ring-primary/40'
                    : 'bg-muted ring-border group-hover:bg-muted/80 group-hover:ring-primary/20'
                }`}
              >
                <UploadCloudIcon
                  className={`size-7 transition-colors duration-200 ${
                    isDragActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <p
                  className={`text-base font-medium tracking-wide transition-colors duration-200 ${
                    isDragActive ? 'text-primary' : 'text-foreground/70 group-hover:text-foreground'
                  }`}
                >
                  {uploadProgress
                    ? `Uploading ${uploadProgress.uploaded} / ${uploadProgress.total}…`
                    : isDragActive
                      ? 'Release to upload'
                      : 'Drop your photos here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploadProgress
                    ? 'Please wait while your photos are being saved'
                    : 'or click to browse — multiple images supported'}
                </p>
              </div>
              {uploadProgress && (
                <div className="w-48 space-y-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)}%
                  </p>
                </div>
              )}
            </div>
          ) : (
            <SortableContext
              items={(images ?? []).map((img: GalleryCategoryImage) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div
                className="xs:grid-cols-[repeat(auto-fill,_minmax(75px,1fr))] grid grid-cols-2
gap-4
md:grid-cols-[repeat(auto-fill,_minmax(150px,1fr))]  "
              >
                {images?.map((item: GalleryCategoryImage) => (
                  <DraggableImage
                    key={item.id}
                    item={item}
                    mutate={mutate}
                    galleryData={galleryData}
                    isBeingDragged={activeId === item.id}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Dragged Image Preview (While Moving) */}
        <DragOverlay>
          {activeId && activeImage?.imageUrl ? (
            <Image
              src={getStorageUrl(activeImage.imageUrl)}
              alt="Dragged Image"
              width={150}
              height={150}
              className="size-full object-contain opacity-100"
              priority
              sizes="150px"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

// 🎯 Draggable Image Component
function DraggableImage({
  item,
  isBeingDragged,
  mutate,
  galleryData,
}: {
  item: GalleryCategoryImage
  isBeingDragged: boolean
  mutate: () => void
  galleryData: GalleryWithCategory
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
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
      {...(dialogOpen ? {} : listeners)} // ✅ disable drag when dialog open
      className="group relative h-52 cursor-grab bg-gray-50 p-2"
    >
      <Image
        src={getStorageUrl(item.imageUrl)}
        alt=""
        width={150}
        height={150}
        className={`size-full rounded-lg object-contain ${
          isBeingDragged ? 'opacity-20' : ''
        }`}
        sizes="(max-width: 768px) 50vw, 150px"
        priority
      />
      <div className="absolute right-1 top-1 z-10 rounded p-2 opacity-0 transition group-hover:opacity-100">
        <Popover>
          <PopoverTrigger asChild>
            <div onPointerDown={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="z-20 size-7">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align={'start'}>
            <div className="grid">
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start py-6"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag
              >
                <DownloadIcon className="ml-6 mr-4 size-4 " />
                Download
              </Button>
              <GalleryCategoryImageMoveForm
                categoryImageId={item.id}
                mutateData={mutate}
                galleryData={galleryData}
                setDialogOpen={setDialogOpen}
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start py-6"
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
                    className="w-full justify-start py-6"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <TrashIcon className="ml-6 mr-4 size-4" />
                    Delete
                  </Button>
                }
                description="This image will be permanently deleted."
                onConfirm={async () => {
                  await deleteGalleryCategoryImage(item.id)
                  await mutate()
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
