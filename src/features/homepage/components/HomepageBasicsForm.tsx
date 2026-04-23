'use client'

import { useState, useTransition } from 'react'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { updateProfileBasics } from '../actions/updateProfileBasics'

type Props = {
  defaultBusinessName: string | null
  defaultUsername: string | null
  defaultLocation: string | null
  isProd: boolean
  rootDomain?: string
}

export default function HomepageBasicsForm({
  defaultBusinessName,
  defaultUsername,
  defaultLocation,
  isProd,
  rootDomain,
}: Props) {
  const [businessName, setBusinessName] = useState(defaultBusinessName ?? '')
  const [username, setUsername] = useState(defaultUsername ?? '')
  const [location, setLocation] = useState(defaultLocation ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const domain = rootDomain ?? 'gallerify.app'
  const urlPreview = username ? `${username}.${domain}` : null

  function handleUsernameChange(value: string) {
    setUsername(value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  function handleSave() {
    setErrors({})
    startTransition(async () => {
      const result = await updateProfileBasics({
        businessName: businessName.trim() || null,
        username,
        location: location.trim() || null,
      })
      if (!result.success) {
        if (result.field) {
          setErrors({ [result.field]: result.error })
        } else {
          toast({ title: result.error, variant: 'destructive' })
        }
        return
      }
      toast({ title: 'Saved' })
    })
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-5">
      <div>
        <p className="text-sm font-medium">Your profile</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Basic info that appears on your public page.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="businessName" className="text-xs">Business name</Label>
        <Input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Studio Lumière"
          className="h-9 text-sm"
        />
        {errors.businessName && (
          <p className="text-xs text-destructive">{errors.businessName}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-xs">Site address</Label>
        <div className="flex items-center rounded-lg border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
          <Input
            id="username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="enteryourdomain"
            className="h-9 text-sm border-0 focus-visible:ring-0 rounded-none flex-1"
          />
          <span className="shrink-0 px-3 text-xs text-muted-foreground border-l bg-muted/40 h-9 flex items-center">
            .{rootDomain ?? 'gallerify.app'}
          </span>
        </div>
        {errors.username ? (
          <p className="text-xs text-destructive">{errors.username}</p>
        ) : urlPreview ? (
          <p className="text-xs text-muted-foreground">
            Your public URL:{' '}
            <span className="font-medium text-foreground font-mono">{urlPreview}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location" className="text-xs">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Paris, France"
          className="h-9 text-sm"
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location}</p>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="w-full rounded-xl"
        size="sm"
      >
        {isPending ? (
          <>
            <Loader2Icon className="mr-2 size-3.5 animate-spin" />
            Saving…
          </>
        ) : (
          'Save changes'
        )}
      </Button>
    </div>
  )
}
