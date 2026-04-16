function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-3.5 w-20 animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-muted" style={{ animationDelay: '60ms' }} />
    </div>
  )
}

export default function GalleryUpdateLoading() {
  return (
    <div className="overflow-auto p-6 lg:p-8">
      <div className="max-w-lg">
        {/* Heading */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-3.5 w-52 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-6">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />

          {/* Banner image */}
          <div className="flex flex-col gap-2">
            <div className="h-3.5 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-20 w-full animate-pulse rounded-lg bg-muted" style={{ animationDelay: '80ms' }} />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-3">
            <div className="size-4 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-20 animate-pulse rounded-md bg-muted" />
          </div>

          {/* Submit button */}
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted" style={{ animationDelay: '100ms' }} />
        </div>
      </div>
    </div>
  )
}
