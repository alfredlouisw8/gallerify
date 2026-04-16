export default function GalleryDesignLoading() {
  return (
    <div
      className="flex h-full flex-col"
      style={{ background: '#f0f0f0', padding: '10px 24px' }}
    >
      {/* Device toggle skeleton */}
      <div className="mb-2 flex shrink-0 justify-center">
        <div
          className="flex rounded-lg p-0.5"
          style={{ background: '#e0e0e0' }}
        >
          {['Desktop', 'Mobile'].map((label) => (
            <div
              key={label}
              className="rounded-md px-3 py-1.5 text-xs font-medium"
              style={{
                background: label === 'Desktop' ? '#fff' : 'transparent',
                color: label === 'Desktop' ? '#111' : '#aaa',
                boxShadow:
                  label === 'Desktop' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Preview frame */}
      <div className="flex flex-1 items-start justify-center overflow-hidden">
        <div
          className="flex w-full flex-col overflow-hidden"
          style={{
            maxWidth: 960,
            height: '100%',
            borderRadius: 10,
            border: '1px solid #d0d0d0',
            background: '#fff',
          }}
        >
          {/* Browser chrome */}
          <div
            className="flex shrink-0 items-center gap-2 px-4 py-2.5"
            style={{
              background: '#f3f3f3',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <div className="flex gap-1.5">
              <div
                className="size-2.5 rounded-full"
                style={{ background: '#ff5f57' }}
              />
              <div
                className="size-2.5 rounded-full"
                style={{ background: '#febc2e' }}
              />
              <div
                className="size-2.5 rounded-full"
                style={{ background: '#28c840' }}
              />
            </div>
            <div
              className="h-5 flex-1 animate-pulse rounded"
              style={{ background: '#e5e5e5' }}
            />
          </div>

          {/* Simulated gallery page skeleton */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{ background: '#111' }}
          >
            {/* Hero shimmer */}
            <div className="absolute inset-0 animate-pulse">
              <div
                className="h-[55%] w-full"
                style={{
                  background:
                    'linear-gradient(180deg, #1a1a1a 0%, #222 60%, #111 100%)',
                }}
              />
            </div>

            {/* Hero text placeholders */}
            <div className="absolute left-1/2 top-[18%] flex -translate-x-1/2 flex-col items-center gap-3">
              <div
                className="h-3 w-48 animate-pulse rounded-full"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />
              <div
                className="h-6 w-72 animate-pulse rounded-full"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              />
              <div
                className="h-2.5 w-32 animate-pulse rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Photo grid placeholders */}
            <div
              className="absolute bottom-0 left-0 right-0 grid grid-cols-4 gap-0.5 p-0.5"
              style={{ top: '52%' }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    aspectRatio: i % 5 === 0 ? '1 / 1.3' : '1 / 1',
                    background: `rgba(255,255,255,${0.04 + (i % 3) * 0.02})`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
