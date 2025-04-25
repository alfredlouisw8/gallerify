import { format } from 'date-fns'
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
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
    return <div>Gallery not found</div>
  }

  return (
    <div className="grid">
      <div
        className="xs:grid-cols-[repeat(auto-fill,_minmax(75px,1fr))] grid grid-cols-2
gap-4
gap-6 md:grid-cols-[repeat(auto-fill,_minmax(300px,1fr))]"
      >
        {galleries.map((item) => (
          <div
            className="group relative h-52 w-full cursor-pointer"
            key={item.id}
          >
            <Link
              href={`/gallery/${item.id}/collection/${item.GalleryCategory[0].id}`}
            >
              <Image
                src={JSON.parse(item.bannerImage[0]).url}
                alt="Next.js logo"
                width={300}
                height={150}
                className="size-full object-cover transition-transform duration-300 ease-in-out group-hover:brightness-75"
                priority
              />
            </Link>
            {/*image*/}
            <div className="absolute right-1 top-1 rounded p-2 opacity-0 transition group-hover:opacity-100">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <EllipsisVerticalIcon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-0" align={'start'}>
                  <div className="grid">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full justify-start"
                    >
                      <Link
                        href={`/gallery/${item.id}/update`}
                        className="inline-flex items-center"
                      >
                        <PencilIcon className="ml-6 mr-4 size-4 " />
                        Quick Edit
                      </Link>
                    </Button>
                    <DeleteGalleryDialog
                      triggerComponent={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-full justify-start"
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
            {/*text*/}
            <div className="mt-3 flex items-start justify-between">
              <div className="mt-auto flex flex-col">
                <span className="text-m font-bold">{item.title}</span>
                <span className="text-xs text-gray-500">
                  {format(item.date, 'PP')}
                </span>
              </div>

              {item.isPublished ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="destructive">Draft</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
