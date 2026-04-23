'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CheckCircle, Paperclip, X, UploadCloud } from 'lucide-react'

import Navbar from '@/features/landing-page/components/navbar'
import Footer from '@/features/landing-page/components/footer'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  type: z.string().min(1, 'Please select a type'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

const TYPES = ['Bug Report', 'General Question', 'Feature Request', 'Other']
const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm'
const MAX_FILES = 5
const MAX_MB = 10

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', type: '', message: '' },
  })

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    setFileError('')

    const next = [...files]
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        setFileError(`Maximum ${MAX_FILES} files allowed.`)
        break
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setFileError(`${file.name} exceeds ${MAX_MB} MB.`)
        continue
      }
      if (!next.find((f) => f.name === file.name && f.size === file.size)) {
        next.push(file)
      }
    }
    setFiles(next)
  }, [files])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError('')
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const onSubmit = async (values: FormValues) => {
    setServerError('')

    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('email', values.email)
    formData.append('type', values.type)
    formData.append('message', values.message)
    files.forEach((f) => formData.append('attachments', f))

    const res = await fetch('/api/contact', { method: 'POST', body: formData })

    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json()
      setServerError(data.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          {submitted ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="size-12 text-green-500" />
              <h1 className="text-2xl font-semibold tracking-tight">Message sent!</h1>
              <p className="text-muted-foreground">
                Thanks for reaching out. We&apos;ll get back to you at your email soon.
              </p>
              <Button
                variant="outline"
                className="mt-2 rounded-full"
                onClick={() => {
                  setSubmitted(false)
                  setFiles([])
                  form.reset()
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
                <p className="mt-2 text-muted-foreground">
                  Have a question or found a bug? We&apos;d love to hear from you.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your issue or question..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Attachment zone */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Attachments (optional)</p>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                        dragging
                          ? 'border-foreground bg-secondary'
                          : 'border-border hover:border-foreground/40 hover:bg-secondary/50'
                      }`}
                    >
                      <UploadCloud className="size-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drop files here or <span className="text-foreground underline">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images & videos · Max {MAX_MB} MB each · Up to {MAX_FILES} files
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ACCEPTED}
                      className="hidden"
                      onChange={(e) => addFiles(e.target.files)}
                    />

                    {fileError && (
                      <p className="text-sm text-destructive">{fileError}</p>
                    )}

                    {files.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {files.map((file, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-md border bg-secondary/40 px-3 py-2 text-sm"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate">{file.name}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {formatBytes(file.size)}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="ml-2 shrink-0 rounded p-0.5 hover:bg-secondary"
                            >
                              <X className="size-3.5 text-muted-foreground" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-sm text-destructive">{serverError}</p>
                  )}

                  <Button
                    type="submit"
                    className="rounded-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Sending...' : 'Send message'}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
