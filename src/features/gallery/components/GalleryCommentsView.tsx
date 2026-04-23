'use client'

import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import { CheckCircle2Icon, CheckIcon, ImageIcon, Loader2Icon, MessageSquareIcon, RotateCcwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import type { ImageCommentType } from '@/types'
import { replaceGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/replaceGalleryCategoryImage'
import { onImagesUpload } from '@/utils/functions'
import { markCommentDone } from '../actions/markCommentDone'
import { replyToComment } from '../actions/replyToComment'
import type { CommentWithImage } from '../actions/getGalleryComments'

type Props = {
  galleryId: string
  initialComments: CommentWithImage[]
}

type Filter = 'all' | 'unanswered' | 'replied'

const TYPE_BADGE: Record<ImageCommentType, { label: string; className: string }> = {
  comment:  { label: 'Comment',  className: 'bg-blue-500/10 text-blue-500' },
  feedback: { label: 'Feedback', className: 'bg-amber-500/10 text-amber-600' },
  request:  { label: 'Request',  className: 'bg-purple-500/10 text-purple-500' },
}

export default function GalleryCommentsView({ galleryId, initialComments }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = comments.filter((c) => {
    if (filter === 'unanswered') return !c.ownerReply
    if (filter === 'replied') return !!c.ownerReply
    return true
  })

  const unansweredCount = comments.filter((c) => !c.ownerReply).length

  // Group by imageId
  const grouped = filtered.reduce<Record<string, CommentWithImage[]>>((acc, c) => {
    if (!acc[c.imageId]) acc[c.imageId] = []
    acc[c.imageId].push(c)
    return acc
  }, {})

  function handleReplied(commentId: string, reply: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, ownerReply: reply, ownerRepliedAt: new Date().toISOString() }
          : c
      )
    )
  }

  function handleDone(commentId: string, done: boolean) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, isDone: done, doneAt: done ? new Date().toISOString() : null }
          : c
      )
    )
  }

  function handleImageReplaced(commentId: string, newImageUrl: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, imageUrl: newImageUrl, isDone: true, doneAt: new Date().toISOString() }
          : c
      )
    )
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
          <MessageSquareIcon className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No client feedback yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Client comments and requests will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {(['all', 'unanswered', 'replied'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {f}
            {f === 'unanswered' && unansweredCount > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] text-white">
                {unansweredCount}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Groups */}
      {Object.entries(grouped).map(([imageId, imageComments]) => {
        const imageUrl = imageComments[0]?.imageUrl
        return (
          <div key={imageId} className="rounded-2xl border bg-card overflow-hidden">
            {/* Image header */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
              {imageUrl ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
                  <Image src={imageUrl} alt="" fill className="object-cover" sizes="48px" />
                </div>
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                  <MessageSquareIcon className="size-4 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-xs font-medium">
                  {imageComments.length} {imageComments.length === 1 ? 'comment' : 'comments'}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
                  {imageId.slice(0, 8)}…
                </p>
              </div>
            </div>

            {/* Comments */}
            <div className="divide-y">
              {imageComments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  galleryId={galleryId}
                  onReplied={(reply) => handleReplied(comment.id, reply)}
                  onDone={(done) => handleDone(comment.id, done)}
                  onImageReplaced={(url) => handleImageReplaced(comment.id, url)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CommentRow({
  comment,
  galleryId,
  onReplied,
  onDone,
  onImageReplaced,
}: {
  comment: CommentWithImage
  galleryId: string
  onReplied: (reply: string) => void
  onDone: (done: boolean) => void
  onImageReplaced: (newUrl: string) => void
}) {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState(comment.ownerReply ?? '')
  const [isReplying, startReplyTransition] = useTransition()
  const [isDoneLoading, startDoneTransition] = useTransition()
  const [isReplacing, setIsReplacing] = useState(false)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const badge = TYPE_BADGE[comment.type]

  function handleReply() {
    if (!replyText.trim()) return
    startReplyTransition(async () => {
      const result = await replyToComment({ commentId: comment.id, galleryId, reply: replyText.trim() })
      if (!result.success) { toast({ title: result.error, variant: 'destructive' }); return }
      onReplied(replyText.trim())
      setReplying(false)
    })
  }

  function handleToggleDone() {
    startDoneTransition(async () => {
      const result = await markCommentDone(comment.id, galleryId, !comment.isDone)
      if (!result.success) { toast({ title: result.error, variant: 'destructive' }); return }
      onDone(!comment.isDone)
    })
  }

  async function handleReplaceFile(file: File) {
    setIsReplacing(true)
    try {
      const [newUrl] = await onImagesUpload([file], 'uploads')
      const replaceResult = await replaceGalleryCategoryImage(comment.imageId, newUrl)
      if (!replaceResult.success) { toast({ title: replaceResult.error, variant: 'destructive' }); return }
      const doneResult = await markCommentDone(comment.id, galleryId, true)
      if (!doneResult.success) { toast({ title: doneResult.error, variant: 'destructive' }); return }
      onImageReplaced(newUrl)
      toast({ title: 'Image replaced and marked as done.' })
    } catch {
      toast({ title: 'Failed to replace image', variant: 'destructive' })
    } finally {
      setIsReplacing(false)
    }
  }

  return (
    <div className={`px-4 py-4 space-y-3 transition-colors ${comment.isDone ? 'bg-green-500/5' : ''}`}>
      {/* Comment header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
            {badge.label}
          </span>
          {comment.clientName && (
            <span className="text-xs font-medium">{comment.clientName}</span>
          )}
          {comment.isDone && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-600">
              <CheckCircle2Icon className="size-3" />
              Done
            </span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{comment.comment}</p>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Replace image */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs"
          disabled={isReplacing}
          onClick={() => replaceInputRef.current?.click()}
        >
          {isReplacing
            ? <Loader2Icon className="size-3 animate-spin" />
            : <ImageIcon className="size-3" />}
          Replace image
        </Button>
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleReplaceFile(file)
            e.target.value = ''
          }}
        />

        {/* Mark done / undo */}
        <Button
          variant={comment.isDone ? 'outline' : 'outline'}
          size="sm"
          className={`h-7 gap-1.5 px-2.5 text-xs ${comment.isDone ? 'border-green-500/40 text-green-600 hover:bg-green-500/10' : ''}`}
          disabled={isDoneLoading}
          onClick={handleToggleDone}
        >
          {isDoneLoading
            ? <Loader2Icon className="size-3 animate-spin" />
            : comment.isDone
              ? <RotateCcwIcon className="size-3" />
              : <CheckCircle2Icon className="size-3" />}
          {comment.isDone ? 'Undo done' : 'Mark done'}
        </Button>
      </div>

      {/* Reply section */}
      {comment.ownerReply && !replying ? (
        <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground">
            <CheckIcon className="size-2.5 text-background" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">Your reply</p>
            <p className="text-xs leading-relaxed">{comment.ownerReply}</p>
          </div>
          <button
            onClick={() => setReplying(true)}
            className="shrink-0 text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Edit
          </button>
        </div>
      ) : replying || !comment.ownerReply ? (
        <div className="space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply()
              if (e.key === 'Escape') setReplying(false)
            }}
            placeholder="Write a reply…"
            rows={2}
            autoFocus={replying}
            className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">⌘↵ to send</p>
            <div className="flex gap-2">
              {replying && (
                <Button variant="ghost" size="sm" className="h-7 px-3 text-xs"
                  onClick={() => { setReplying(false); setReplyText(comment.ownerReply ?? '') }}>
                  Cancel
                </Button>
              )}
              <Button size="sm" className="h-7 px-3 text-xs"
                onClick={handleReply}
                disabled={!replyText.trim() || isReplying}>
                {isReplying ? 'Sending…' : comment.ownerReply ? 'Update reply' : 'Reply'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
