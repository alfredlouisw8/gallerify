import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="font-sans text-sm uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        The gallery you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        Go home
      </Link>
    </div>
  )
}
