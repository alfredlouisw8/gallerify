'use client'

import { useState, useTransition } from 'react'
import { DropletIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import type { Watermark } from '@/types'
import { deleteWatermark } from '../actions/watermarks'
import { WatermarkDialog } from './WatermarkDialog'
import { WatermarkPreview } from './WatermarkPreview'

type Props = {
  initialWatermarks: Watermark[]
}

export function WatermarkTab({ initialWatermarks }: Props) {
  const [watermarks, setWatermarks] = useState<Watermark[]>(initialWatermarks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Watermark | null>(null)
  const [deletingId, startDeleteTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(wm: Watermark) {
    setEditing(wm)
    setDialogOpen(true)
  }

  function handleSaved(wm: Watermark) {
    setWatermarks((prev) => {
      const idx = prev.findIndex((w) => w.id === wm.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = wm
        return next
      }
      return [...prev, wm]
    })
  }

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      const result = await deleteWatermark(id)
      if (!result.success) {
        toast({ title: result.error, variant: 'destructive' })
        return
      }
      setWatermarks((prev) => prev.filter((w) => w.id !== id))
      toast({ title: 'Watermark deleted' })
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Watermarks</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Create reusable watermarks to protect your photos. You can assign them per gallery.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="shrink-0 gap-1.5">
          <PlusIcon className="size-3.5" />
          Add watermark
        </Button>
      </div>

      {/* Empty state */}
      {watermarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/20 py-16 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted mb-3">
            <DropletIcon className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No watermarks yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Create a watermark to protect your photos from being used without permission.
          </p>
          <Button size="sm" variant="outline" onClick={openCreate} className="mt-4 gap-1.5">
            <PlusIcon className="size-3.5" />
            Create your first watermark
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {watermarks.map((wm) => (
            <WatermarkCard
              key={wm.id}
              watermark={wm}
              onEdit={() => openEdit(wm)}
              onDelete={() => handleDelete(wm.id)}
            />
          ))}
        </div>
      )}

      <WatermarkDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
        initial={editing}
      />
    </div>
  )
}

function WatermarkCard({
  watermark,
  onEdit,
  onDelete,
}: {
  watermark: Watermark
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden group">
      {/* Preview */}
      <div className="p-2 pb-0">
        <WatermarkPreview
          type={watermark.type}
          text={watermark.text ?? ''}
          textColor={watermark.textColor}
          imageUrl={watermark.imageUrl}
          scale={watermark.scale}
          opacity={watermark.opacity}
          position={watermark.position}
        />
      </div>

      {/* Info + actions */}
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium">{watermark.name}</p>
          <p className="text-[9px] text-muted-foreground capitalize">{watermark.type}</p>
        </div>
        <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            className="flex size-6 items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <PencilIcon className="size-2.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex size-6 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2Icon className="size-2.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
