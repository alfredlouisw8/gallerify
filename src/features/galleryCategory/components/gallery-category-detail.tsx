'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeftRightIcon,
  ArrowRightFromLineIcon,
  CheckIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FolderInputIcon,
  Grid2X2Icon,
  Grid3X3Icon,
  ImageIcon,
  Share2Icon,
  TrashIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'

import { VendorShareModal } from '@/features/gallery/components/VendorShareModal'
import { bulkDeleteGalleryCategoryImages } from '@/features/galleryCategoryImage/actions/bulkDeleteGalleryCategoryImages'
import { bulkMoveGalleryCategoryImages } from '@/features/galleryCategoryImage/actions/bulkMoveGalleryCategoryImages'
import { createGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/createGalleryCategoryImage'
import { deleteGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/deleteGalleryCategoryImage'
import { replaceGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/replaceGalleryCategoryImage'
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
import MoveToCategoryModal from '@/features/galleryCategory/components/move-to-category-modal'
import { getStorageUrl } from '@/lib/utils'
import {
  GalleryCategoryImage,
  GalleryCategoryWithImages,
  GalleryCategory,
  GalleryWithCategory,
} from '@/types'
import { fetchCategoryDetail } from '../fetcher'

const CAT_DROP_PREFIX = 'cat-drop-'

type GalleryDetailProps = {
  galleryData: GalleryWithCategory
  collectionId: string
}

// ── Category drop zone ──────────────────────────────────────────────────────

function CategoryDropZone({
  category,
  dragCount,
  compact,
}: {
  category: GalleryCategory
  dragCount: number
  compact?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${CAT_DROP_PREFIX}${category.id}` })

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 transition-all duration-150 ${
          isOver
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-dashed border-border bg-muted/20 text-muted-foreground'
        }`}
      >
        <FolderInputIcon className="size-3.5 shrink-0" />
        <span className="truncate text-xs font-medium leading-tight">{category.name}</span>
        {isOver && dragCount > 1 && (
          <span className="ml-auto shrink-0 text-xs opacity-70">+{dragCount}</span>
        )}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition-all duration-150 ${
        isOver
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-dashed border-border bg-muted/30 text-muted-foreground'
      }`}
    >
      <FolderInputIcon className="size-4 shrink-0" />
      <span className="text-xs font-medium leading-tight">{category.name}</span>
      {isOver && dragCount > 1 && (
        <span className="text-xs opacity-70">+{dragCount}</span>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function GalleryCategoryDetail({
  galleryData,
  collectionId,
}: GalleryDetailProps) {
  const router = useRouter()
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

  // Use pointer position first (for the fixed category panel), fall back to
  // center-distance for image grid reordering.
  const collisionDetection = useCallback(
    (...args: Parameters<typeof pointerWithin>) => {
      const pointerHits = pointerWithin(...args)
      if (pointerHits.length > 0) return pointerHits
      return closestCenter(...args)
    },
    []
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
  const [gridSize, setGridSize] = useState<'small' | 'large'>('small')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [vendorShareOpen, setVendorShareOpen] = useState(false)

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = () => setSelectedIds(new Set())

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

  const handleBulkMove = async (targetCategoryId: string) => {
    await bulkMoveGalleryCategoryImages(Array.from(selectedIds), targetCategoryId)
    await mutate()
    router.refresh()
    clearSelection()
    toast({ title: 'Photos moved.' })
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

  // ── Drag-to-reorder / drag-to-move ───────────────────────────────────────
  const imagesRef = useRef<GalleryCategoryImage[]>([])
  const preDragOrderRef = useRef<string[]>([])
  const selectedDragOrderRef = useRef<GalleryCategoryImage[]>([])

  const activeImage = activeId ? images.find((img) => img.id === activeId) : undefined

  // How many items will be moved: if dragging a selected image → all selected; otherwise just 1
  const dragCount =
    activeId && selectedIds.size > 0 && selectedIds.has(activeId)
      ? selectedIds.size
      : 1

  const isMultiDrag = dragCount > 1

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string)
    preDragOrderRef.current = imagesRef.current.map((img) => img.id)
    // Capture original order of selected items once — used throughout the drag
    selectedDragOrderRef.current = imagesRef.current.filter((img) =>
      selectedIds.has(img.id)
    )
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return

    const overId = over.id as string
    if (overId.startsWith(CAT_DROP_PREFIX)) return

    // Compute directly from active.id — avoids stale closure on isMultiDrag (state-derived)
    const activeIdStr = active.id as string
    const isMulti = selectedIds.size > 1 && selectedIds.has(activeIdStr)

    setImages((items) => {
      const activeIdx = items.findIndex((img) => img.id === activeIdStr)
      const overIdx = items.findIndex((img) => img.id === overId)
      if (activeIdx === -1 || overIdx === -1) return items

      if (isMulti) {
        // Selected items are LOCKED — they never swap among themselves.
        // The whole group moves only when hovering over a non-selected item.
        if (selectedIds.has(overId)) return items // hovering over another selected → no change

        // Always use the original captured order so selected items never reorder during drag
        const selected = selectedDragOrderRef.current
        const nonSelected = items.filter((img) => !selectedIds.has(img.id))

        const overInNonSelected = nonSelected.findIndex((img) => img.id === overId)
        // Insert before or after depending on drag direction
        const insertAt = overIdx > activeIdx ? overInNonSelected + 1 : overInNonSelected

        const result = [
          ...nonSelected.slice(0, insertAt),
          ...selected,
          ...nonSelected.slice(insertAt),
        ]
        imagesRef.current = result
        return result
      }

      // Single drag reorder
      const next = arrayMove(items, activeIdx, overIdx)
      imagesRef.current = next
      return next
    })
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return

    const overId = over.id as string
    const activeIdStr = active.id as string
    const isMulti = selectedIds.size > 1 && selectedIds.has(activeIdStr)

    // ── Drop on a category zone → move ──────────────────────────────────────
    if (overId.startsWith(CAT_DROP_PREFIX)) {
      const targetCatId = overId.slice(CAT_DROP_PREFIX.length)
      const idsToMove = isMulti
        ? Array.from(selectedIds)
        : [activeIdStr]

      // Optimistic: remove moved images from local state
      setImages((prev) => prev.filter((img) => !idsToMove.includes(img.id)))
      imagesRef.current = imagesRef.current.filter((img) => !idsToMove.includes(img.id))
      clearSelection()

      try {
        await bulkMoveGalleryCategoryImages(idsToMove, targetCatId)
        await mutate()
        router.refresh() // re-run layout server component so sidebar counts update
        const targetName = galleryData.GalleryCategory.find(
          (c) => c.id === targetCatId
        )?.name
        toast({ title: `Moved to "${targetName}".` })
      } catch (err) {
        await mutate()
        toast({
          title: err instanceof Error ? err.message : 'Move failed',
          variant: 'destructive',
        })
      }
      return
    }

    // ── Drop on an image → reorder ───────────────────────────────────────────
    const newOrder = imagesRef.current.map((img) => img.id)
    const orderChanged = newOrder.some(
      (id, i) => id !== preDragOrderRef.current[i]
    )
    if (!orderChanged) return

    const result = await reorderGalleryCategoryImages(newOrder)
    if (result?.error) {
      toast({ title: 'Failed to save order', variant: 'destructive' })
      await mutate()
      return
    }
    mutate(
      (current) =>
        current ? { ...current, GalleryCategoryImage: imagesRef.current } : current,
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
  const otherCategories = galleryData.GalleryCategory.filter((c) => c.id !== collectionId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex flex-col gap-4 ${selectionActive ? 'pb-28' : ''}`}>
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-5">
          <h1 className="text-xl">{categoryData?.name}</h1>
          <div className="flex items-center gap-2">
            {/* Grid size toggle */}
            <div className="hidden sm:flex items-center rounded-lg border border-border p-0.5">
              <button
                onClick={() => setGridSize('small')}
                className={`rounded-md p-1.5 transition-colors ${
                  gridSize === 'small'
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Small grid"
              >
                <Grid3X3Icon className="size-3.5" />
              </button>
              <button
                onClick={() => setGridSize('large')}
                className={`rounded-md p-1.5 transition-colors ${
                  gridSize === 'large'
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Large grid"
              >
                <Grid2X2Icon className="size-3.5" />
              </button>
            </div>
            <GalleryCategoryImageAddForm
              collectionId={collectionId}
              mutateData={mutate}
              open={uploadOpen}
              onOpenChange={setUploadOpen}
            />
          </div>
        </div>

        {/* ── Selection toolbar — fixed floating bar at bottom ── */}
        {selectionActive && (
          <div className="pointer-events-none fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 shadow-2xl dark:bg-neutral-100">
              {/* Count + clear */}
              <span className="text-sm font-semibold tabular-nums text-white dark:text-neutral-900">{selectedIds.size}</span>
              <span className="hidden text-sm text-neutral-400 sm:inline dark:text-neutral-600">selected</span>
              <button
                onClick={clearSelection}
                title="Clear selection"
                className="ml-0.5 rounded-md p-1 text-neutral-400 hover:bg-white/10 hover:text-white dark:text-neutral-600 dark:hover:bg-black/10 dark:hover:text-neutral-900"
              >
                <XIcon className="size-3.5" />
              </button>

              {/* Select all */}
              {selectedIds.size < images.length && (
                <button
                  onClick={() => setSelectedIds(new Set(images.map((img) => img.id)))}
                  className="hidden text-xs text-neutral-400 underline-offset-2 hover:text-white hover:underline sm:block dark:text-neutral-600 dark:hover:text-neutral-900"
                >
                  Select all {images.length}
                </button>
              )}

              <div className="mx-1 h-5 w-px bg-white/20 dark:bg-black/20" />

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  title="Create vendor link"
                  onClick={() => setVendorShareOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white transition-colors hover:bg-white/10 dark:text-neutral-900 dark:hover:bg-black/10"
                >
                  <Share2Icon className="size-3.5" />
                  <span className="hidden sm:inline">Vendor link</span>
                </button>
                <button
                  title="Move to…"
                  onClick={() => setBulkMoveOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white transition-colors hover:bg-white/10 dark:text-neutral-900 dark:hover:bg-black/10"
                >
                  <FolderInputIcon className="size-3.5" />
                  <span className="hidden sm:inline">Move to…</span>
                </button>
                <DeleteGalleryDialog
                  triggerComponent={
                    <button
                      disabled={isBulkDeleting}
                      title="Delete selected"
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-red-400 transition-colors hover:bg-white/10 disabled:opacity-50 dark:text-red-500 dark:hover:bg-black/10"
                    >
                      <TrashIcon className="size-3.5" />
                      <span className="hidden sm:inline">
                        {isBulkDeleting ? 'Deleting…' : 'Delete'}
                      </span>
                    </button>
                  }
                  description={`${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''} will be permanently deleted.`}
                  onConfirm={handleBulkDelete}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Bulk move modal ── */}
        <MoveToCategoryModal
          open={bulkMoveOpen}
          onOpenChange={setBulkMoveOpen}
          galleryData={galleryData}
          collectionId={collectionId}
          count={selectedIds.size}
          onMove={handleBulkMove}
        />

        {/* ── Image grid ── */}
        <div className="grid">
          {images.length === 0 ? (
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
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className={`grid gap-4 ${
                gridSize === 'large'
                  ? 'grid-cols-2 md:grid-cols-[repeat(auto-fill,_minmax(260px,1fr))]'
                  : 'grid-cols-2 xs:grid-cols-[repeat(auto-fill,_minmax(75px,1fr))] md:grid-cols-[repeat(auto-fill,_minmax(150px,1fr))]'
              }`}>
                {images.map((item) => (
                  <DraggableImage
                    key={item.id}
                    item={item}
                    mutate={mutate}
                    galleryData={galleryData}
                    collectionId={collectionId}
                    isBeingDragged={
                      activeId === item.id ||
                      (isMultiDrag && selectedIds.has(item.id))
                    }
                    isGroupDrag={isMultiDrag}
                    isSelected={selectedIds.has(item.id)}
                    selectionActive={selectionActive}
                    onToggleSelect={toggleSelect}
                    gridSize={gridSize}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

      </div>

      {/* ── Vendor share modal ── */}
      <VendorShareModal
        open={vendorShareOpen}
        onClose={() => setVendorShareOpen(false)}
        galleryId={galleryData.id}
        allImages={(categoryData?.GalleryCategoryImage ?? []).map((img) => ({
          id: img.id,
          imageUrl: getStorageUrl(img.imageUrl),
        }))}
        preSelectedIds={Array.from(selectedIds)}
      />

      {/* ── Move-to panel: fixed right, desktop only ── */}
      {/* Always in DOM so useDroppable is registered before drag starts */}
      {otherCategories.length > 0 && (
        <div
          className="hidden md:block"
          style={{
            position: 'fixed',
            right: 16,
            top: '50%',
            transform: `translateY(-50%) translateX(${activeId ? 0 : 20}px)`,
            zIndex: 50,
            width: 192,
            opacity: activeId ? 1 : 0,
            pointerEvents: activeId ? 'auto' : 'none',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          <div className="rounded-2xl border bg-background/95 p-3 shadow-2xl backdrop-blur-md">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Move to
            </p>
            <div className="flex flex-col gap-1.5">
              {otherCategories.map((cat) => (
                <CategoryDropZone key={cat.id} category={cat} dragCount={dragCount} compact />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Drag overlay ── */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeId && activeImage?.imageUrl ? (
          <div className="relative">
            {/* Stack ghost cards (offset behind the main card) */}
            {isMultiDrag && dragCount >= 3 && (
              <div className="absolute left-3 top-3 size-[120px] rounded-lg border border-border bg-muted/70 shadow-md" />
            )}
            {isMultiDrag && dragCount >= 2 && (
              <div className="absolute left-1.5 top-1.5 size-[120px] rounded-lg border border-border bg-muted/80 shadow-md" />
            )}
            {/* Main card — the thumbnail of the image being dragged */}
            <div className="relative size-[120px] overflow-hidden rounded-lg shadow-2xl ring-2 ring-primary">
              <Image
                src={getStorageUrl(activeImage.imageUrl)}
                alt=""
                width={120}
                height={120}
                className="size-full object-cover"
                priority
              />
            </div>
            {/* Count badge */}
            {dragCount > 1 && (
              <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
                {dragCount}
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// ── Draggable image card ────────────────────────────────────────────────────

function DraggableImage({
  item,
  isBeingDragged,
  isGroupDrag,
  mutate,
  galleryData,
  collectionId,
  isSelected,
  selectionActive,
  onToggleSelect,
  gridSize,
}: {
  item: GalleryCategoryImage
  isBeingDragged: boolean
  isGroupDrag: boolean
  mutate: () => void
  galleryData: GalleryWithCategory
  collectionId: string
  isSelected: boolean
  selectionActive: boolean
  onToggleSelect: (id: string) => void
  gridSize: 'small' | 'large'
}) {
  const router = useRouter()
  const [moveOpen, setMoveOpen] = useState(false)
  const [isReplacing, setIsReplacing] = useState(false)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const didDragRef = useRef(false)

  async function handleReplaceFile(file: File) {
    setIsReplacing(true)
    try {
      const [newUrl] = await onImagesUpload([file], 'uploads')
      const result = await replaceGalleryCategoryImage(item.id, newUrl)
      if (!result.success) {
        toast({ title: result.error, variant: 'destructive' })
        return
      }
      await mutate()
      toast({ title: 'Image replaced.' })
    } catch {
      toast({ title: 'Failed to replace image', variant: 'destructive' })
    } finally {
      setIsReplacing(false)
    }
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

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
      {...(moveOpen ? {} : listeners)}
      onClick={handleClick}
      className={[
        `group relative cursor-pointer rounded-lg p-2 transition-all duration-150 ${gridSize === 'large' ? 'h-72' : 'h-52'}`,
        // Group drag: low opacity ghost at destination position (shows where images will land)
        // Single drag: ghost the active item only
        isBeingDragged && isGroupDrag ? 'opacity-30 pointer-events-none' : isBeingDragged ? 'opacity-20' : '',
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

      {/* Selection indicator */}
      <div
        className={[
          'absolute left-2 top-2 flex size-5 items-center justify-center rounded-full border-2 transition-all duration-150',
          isSelected
            ? 'border-primary bg-primary'
            : 'border-white/80 bg-black/25 opacity-0 group-hover:opacity-100',
        ].join(' ')}
      >
        {isSelected && <CheckIcon className="size-3 text-white" strokeWidth={3} />}
      </div>

      {/* Hidden replace file input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleReplaceFile(file)
          e.target.value = ''
        }}
      />

      {/* Three-dot context menu — hidden while selection is active */}
      <div
        className={`absolute right-1 top-1 z-10 rounded p-1 opacity-0 transition group-hover:opacity-100 ${selectionActive ? 'hidden' : ''}`}
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
              <Button
                variant="ghost"
                className="w-full justify-start py-6"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setMoveOpen(true)}
              >
                <ArrowRightFromLineIcon className="ml-2 mr-4 size-4" />
                Move
              </Button>
              <MoveToCategoryModal
                open={moveOpen}
                onOpenChange={setMoveOpen}
                galleryData={galleryData}
                collectionId={collectionId}
                count={1}
                onMove={async (targetCategoryId) => {
                  await bulkMoveGalleryCategoryImages([item.id], targetCategoryId)
                  await mutate()
                  router.refresh()
                  toast({ title: 'Photo moved.' })
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start py-6"
                onPointerDown={(e) => e.stopPropagation()}
                disabled={isReplacing}
                onClick={(e) => { e.stopPropagation(); replaceInputRef.current?.click() }}
              >
                <ArrowLeftRightIcon className="ml-6 mr-4 size-4" />
                {isReplacing ? 'Replacing…' : 'Replace'}
              </Button>
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
