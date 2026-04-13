import { format } from 'date-fns'
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import DeleteGalleryDialog from './delete-dialog-modal'
import getGalleries from '../actions/getGalleries'

export default async function GalleryList() {
  const galleries = await getGalleries()

  if (!galleries) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-secondary/30 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary">
          <PlusIcon className="size-5 text-muted-foreground" />
        </div>
        <p className="font-medium">No galleries yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first gallery to get started.
        </p>
        <Button asChild size="sm" className="mt-5 rounded-full">
          <Link href="/gallery/create">Create gallery</Link>
        </Button>
      </div>
    )
  }

  if (galleries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-secondary/30 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary">
          <PlusIcon className="size-5 text-muted-foreground" />
        </div>
        <p className="font-medium">No galleries yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first gallery to get started.
        </p>
        <Button asChild size="sm" className="mt-5 rounded-full">
          <Link href="/gallery/create">Create gallery</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
      {galleries.map((item) => (
        <div key={item.id} className="group relative">
          {/* Image */}
          <Link
            href={`/gallery/${item.id}/collection/${item.GalleryCategory[0]?.id}`}
            className="block"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={JSON.parse(item.bannerImage[0]).url}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 300px"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </Link>

          {/* Context menu */}
          <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-lg bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
                >
                  <EllipsisVerticalIcon className="size-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1" align="end">
                <Link
                  href={`/gallery/${item.id}/update`}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <PencilIcon className="size-3.5 text-muted-foreground" />
                  Quick Edit
                </Link>
                <DeleteGalleryDialog
                  triggerComponent={
                    <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5">
                      <TrashIcon className="size-3.5" />
                      Delete
                    </button>
                  }
                  galleryId={item.id}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Info */}
          <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(item.date, 'PP')}
              </p>
            </div>
            <Badge
              variant={item.isPublished ? 'default' : 'secondary'}
              className="shrink-0 rounded-full text-xs"
            >
              {item.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
