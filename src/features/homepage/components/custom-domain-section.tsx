'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2Icon, Copy, GlobeIcon, Loader2Icon, LockIcon, XCircleIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateCustomDomain } from '../actions/updateCustomDomain'

type Props = {
  currentDomain: string | null
  allowed?: boolean
}

type DnsRecords = {
  cname: { name: string; value: string }
  aRecord: { name: string; value: string }
}

export default function CustomDomainSection({ currentDomain, allowed = true }: Props) {
  const [domain, setDomain] = useState(currentDomain ?? '')
  const [savedDomain, setSavedDomain] = useState(currentDomain)
  const [dnsRecords, setDnsRecords] = useState<DnsRecords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState<string | null>(null)

  const isDirty = domain !== (savedDomain ?? '')

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateCustomDomain(domain || null)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSavedDomain(result.domain)
      setDnsRecords(result.dnsRecords ?? null)
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await updateCustomDomain(null)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSavedDomain(null)
      setDomain('')
      setDnsRecords(null)
    })
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <GlobeIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Custom Domain</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <LockIcon className="size-2.5" />
            Pro
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Connect your own domain (e.g.{' '}
          <span className="font-mono">photos.yoursite.com</span>). Available on Pro and Pro Max.
        </p>
        <Button size="sm" className="w-full rounded-xl" asChild>
          <Link href="/billing">Upgrade to unlock</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <GlobeIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Custom Domain</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Connect your own domain (e.g. <span className="font-mono">photos.yoursite.com</span>).
        Buy a domain from any registrar, then configure DNS as shown below.
      </p>

      <div className="flex gap-2">
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="photos.yoursite.com"
          className="font-mono text-sm h-9"
        />
        {savedDomain && !isDirty ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-9 text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : 'Remove'}
          </Button>
        ) : (
          <Button
            size="sm"
            className="shrink-0 h-9"
            onClick={handleSave}
            disabled={isPending || !isDirty}
          >
            {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : 'Save'}
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <XCircleIcon className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {savedDomain && !isDirty && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2Icon className="size-3.5 shrink-0" />
          Domain saved — configure DNS below to activate.
        </div>
      )}

      {(dnsRecords ?? (savedDomain && !isDirty)) && (
        <div className="space-y-2.5 rounded-xl border bg-muted/40 p-3.5">
          <p className="text-xs font-medium">Required DNS records</p>
          <p className="text-xs text-muted-foreground">
            Add these records at your domain registrar. SSL is provisioned automatically once DNS propagates (up to 48h).
          </p>
          <div className="space-y-2">
            <DnsRow
              type="CNAME"
              name="www"
              value="cname.vercel-dns.com"
              onCopy={copyToClipboard}
              copied={copied}
            />
            <DnsRow
              type="A"
              name="@"
              value="76.76.21.21"
              onCopy={copyToClipboard}
              copied={copied}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function DnsRow({
  type,
  name,
  value,
  onCopy,
  copied,
}: {
  type: string
  name: string
  value: string
  onCopy: (v: string) => void
  copied: string | null
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-background border px-3 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          {type}
        </span>
        <span className="font-mono text-xs text-muted-foreground shrink-0">{name}</span>
        <span className="font-mono text-xs truncate">{value}</span>
      </div>
      <button
        onClick={() => onCopy(value)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        title="Copy value"
      >
        {copied === value ? (
          <CheckCircle2Icon className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  )
}
