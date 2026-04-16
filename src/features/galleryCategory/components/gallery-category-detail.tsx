'use client'

import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CheckIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FolderInputIcon,
  ImageIcon,
  TrashIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import useSWR from 'swr'

import { bulkDeleteGalleryCategoryImages } from '@/features/galleryCategoryImage/actions/bulkDeleteGalleryCategoryImages'
import { bulkMoveGalleryCategoryImages } from '@/features/galleryCategoryImage/actions/bulkMoveGalleryCategoryImages'
import { createGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/createGalleryCategoryImage'
import { deleteGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/deleteGalleryCategoryImage'
import { reorderGalleryCategoryImages } from '@/features/galleryCategoryImage/actions/reorderGalleryCategoryImages'
import { onImagesUpload } from '@/utils/functions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false)
  const [targetCategoryId, setTargetCategoryId] = useState('')
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkMoving, setIsBulkMoving] = useState(false)

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = () => setSelectedIds(new Set())

  // Escape key clears selection
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSelection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)
    try {
      await bulkDeleteGalleryCategoryImages(Array.from(selectedIds))
      await mutate()
      clearSelection()
      toast({ title: 'Photos deleted.' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Delete failed',
        variant: 'destructive',
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleBulkMove = async () => {
    if (!targetCategoryId) return
    setIsBulkMoving(true)
    try {
      await bulkMoveGalleryCategoryImages(Array.from(selectedIds), targetCategoryId)
      await mutate()
      clearSelection()
      setBulkMoveOpen(false)
      setTargetCategoryId('')
      toast({ title: 'Photos moved.' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Move failed',
        variant: 'destructive',
      })
    } finally {
      setIsBulkMoving(false)
    }
  }

  // ── Upload / drop zone ───────────────────────────────────────────────────
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

  // ── Drag-to-reorder ──────────────────────────────────────────────────────
  const imagesRef = useRef<GalleryCategoryImage[]>([])
  const preDragOrderRef = useRef<string[]>([])

  const activeImage = activeId
    ? images?.find((img) => img.id === activeId)
    : undefined

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
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
    const orderChanged = newOrder.some(
      (id, i) => id !== preDragOrderRef.current[i]
    )
    if (!orderChanged) return

    const result = await reorderGalleryCategoryImages(newOrder)
    if (result?.error) {
      toast({
        title: 'Failed to save order',
        description: result.error,
        variant: 'destructive',
      })
      await mutate()
      return
    }
    mutate(
      (current) =>
        current
          ? { ...current, GalleryCategoryImage: imagesRef.current }
          : current,
      { revalidate: false }
    )
    toast({ title: 'Order saved.' })
  }

  useEffect(() => {
    if (categoryData) {
      setImages(categoryData.GalleryCategoryImage)
      imagesRef.current = categoryData.GalleryCategoryImage
    }
  }, [categoryData])

  if (isLoading) return <div>Loading images...</div>
  if (error) return <div>Failed to load images</div>

  const selectionActive = selectedIds.size > 0
  const categories = galleryData.GalleryCategory.filter(
    (c) => c.id !== collectionId
  )

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-5">
        <h1 className="text-xl">{categoryData?.name}</h1>
        <GalleryCategoryImageAddForm
          collectionId={collectionId}
          mutateData={mutate}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
        />
      </div>

      {/* ── Selection toolbar ── */}
      {selectionActive && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} selected
          </span>
          <button
            onClick={clearSelection}
            className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkMoveOpen(true)}
            >
              <FolderInputIcon className="mr-1.5 size-3.5" />
              Move to…
            </Button>
            <DeleteGalleryDialog
              triggerComponent={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBulkDeleting}
                >
                  <TrashIcon className="mr-1.5 size-3.5" />
                  {isBulkDeleting
                    ? 'Deleting…'
                    : `Delete ${selectedIds.size}`}
                </Button>
              }
              description={`${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''} will be permanently deleted.`}
              onConfirm={handleBulkDelete}
            />
          </div>
        </div>
      )}

      {/* ── Bulk move dialog ── */}
      <Dialog
        open={bulkMoveOpen}
        onOpenChange={(v) => {
          setBulkMoveOpen(v)
          if (!v) setTargetCategoryId('')
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Move {selectedIds.size} photo
              {selectedIds.size > 1 ? 's' : ''} to…
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Select
              value={targetCategoryId}
              onValueChange={setTargetCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkMoveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleBulkMove}
              disabled={!targetCategoryId || isBulkMoving}
            >
              {isBulkMoving ? 'Moving…' : 'Move'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Image grid ── */}
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
                    isDragActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <p
                  className={`text-base font-medium tracking-wide transition-colors duration-200 ${
                    isDragActive
                      ? 'text-primary'
                      : 'text-foreground/70 group-hover:text-foreground'
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
                    {Math.round(
                      (uploadProgress.uploaded / uploadProgress.total) * 100
                    )}
                    %
                  </p>
                </div>
              )}
            </div>
          ) : (
            <SortableContext
              items={(images ?? []).map((img: GalleryCategoryImage) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4 xs:grid-cols-[repeat(auto-fill,_minmax(75px,1fr))] md:grid-cols-[repeat(auto-fill,_minmax(150px,1fr))]">
                {images?.map((item: GalleryCategoryImage) => (
                  <DraggableImage
                    key={item.id}
                    item={item}
                    mutate={mutate}
                    galleryData={galleryData}
                    isBeingDragged={activeId === item.id}
                    isSelected={selectedIds.has(item.id)}
                    selectionActive={selectionActive}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

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

// ── Draggable image card ────────────────────────────────────────────────────

function DraggableImage({
  item,
  isBeingDragged,
  mutate,
  galleryData,
  isSelected,
  selectionActive,
  onToggleSelect,
}: {
  item: GalleryCategoryImage
  isBeingDragged: boolean
  mutate: () => void
  galleryData: GalleryWithCategory
  isSelected: boolean
  selectionActive: boolean
  onToggleSelect: (id: string) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const didDragRef = useRef(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  // Track whether this item was actually dragged so we don't fire select on drag-end click
  useEffect(() => {
    if (isDragging) didDragRef.current = true
  }, [isDragging])

  const style = { transform: CSS.Transform.toString(transform), transition }

  const handleClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    onToggleSelect(item.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // Disable reorder drag while items are selected or a dialog is open
      {...(selectionActive || dialogOpen ? {} : listeners)}
      onClick={handleClick}
      className={[
        'group relative h-52 cursor-pointer rounded-lg p-2 transition-all duration-150',
        isBeingDragged ? 'opacity-20' : '',
        isSelected
          ? 'bg-primary/10 ring-2 ring-primary shadow-md'
          : 'bg-muted/40 hover:bg-muted/70 hover:shadow-lg hover:ring-2 hover:ring-primary/25',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image
        src={getStorageUrl(item.imageUrl)}
        alt=""
        width={150}
        height={150}
        className="size-full rounded-md object-contain"
        sizes="(max-width: 768px) 50vw, 150px"
        priority
      />

      {/* Selection indicator — top-left */}
      <div
        className={[
          'absolute left-2 top-2 flex size-5 items-center justify-center rounded-full border-2 transition-all duration-150',
          isSelected
            ? 'border-primary bg-primary'
            : 'border-white/80 bg-black/25 opacity-0 group-hover:opacity-100',
        ].join(' ')}
      >
        {isSelected && (
          <CheckIcon className="size-3 text-white" strokeWidth={3} />
        )}
      </div>

      {/* Three-dot context menu — top-right */}
      <div
        className="absolute right-1 top-1 z-10 rounded p-1 opacity-0 transition group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Popover>
          <PopoverTrigger asChild>
            <div onPointerDown={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="z-20 size-7">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            <div className="grid">
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start py-6"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <DownloadIcon className="ml-6 mr-4 size-4" />
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
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ImageIcon className="ml-6 mr-4 size-4" />
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
