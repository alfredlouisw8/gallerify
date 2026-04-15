'use client'

import React from 'react'

import { SingleFileFormField } from '@/components/forms/single-file-form-field'
import { TextAreaFormField } from '@/components/forms/text-area-form-field'
import { TextFormField } from '@/components/forms/text-form-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import UseHomepageForm from '@/features/homepage/hooks/use-homepage-form'

import { ProfileData } from '../types'

type ProfileFormProps = {
  profileData: ProfileData
}

export default function HomepageForm({ profileData }: ProfileFormProps) {
  const { form, handleSubmit } = UseHomepageForm({ profileData })

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-4"
        >
          {/* Identity */}
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <p className="text-sm font-medium">Identity</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your public profile details.
              </p>
            </div>
            <TextFormField name="name" label="Display Name" />
            <div className="space-y-1">
              <TextFormField name="username" label="Username" required />
              <p className="text-xs text-muted-foreground">
                Your gallery URL:{' '}
                <span className="font-medium text-foreground">
                  username.gallerify.app
                </span>
                . Lowercase letters, numbers, and hyphens only.
              </p>
            </div>
            <SingleFileFormField
              name="logo"
              label="Logo"
              accept="image/*"
              previewImage
            />
          </div>

          {/* Banner */}
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <p className="text-sm font-medium">Banner</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The hero image on your public page.
              </p>
            </div>
            <SingleFileFormField
              name="bannerImage"
              label="Banner Image"
              accept="image/*"
              previewImage
            />
          </div>

          {/* About */}
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <p className="text-sm font-medium">About</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tell visitors a bit about yourself.
              </p>
            </div>
            <TextAreaFormField name="aboutText" label="About Text" />
            <SingleFileFormField
              name="aboutImage"
              label="About Image"
              accept="image/*"
              previewImage
            />
          </div>

          {/* Social */}
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <p className="text-sm font-medium">Social links</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Let clients reach you.
              </p>
            </div>
            <TextFormField name="whatsapp" label="WhatsApp" />
            <TextFormField name="instagram" label="Instagram" />
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
