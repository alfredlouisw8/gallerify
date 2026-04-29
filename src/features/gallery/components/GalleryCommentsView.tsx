'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, useTransition } from 'react'
import {
  CheckCircle2Icon,
  CheckIcon,
  ImageIcon,
  Loader2Icon,
  MessageSquareIcon,
  MessageSquareTextIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}
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

const TYPE_BADGE_CLASS: Record<ImageCommentType, string> = {
  comment:  'bg-blue-500/10 text-blue-500',
  feedback: 'bg-amber-500/10 text-amber-600',
  request:  'bg-purple-500/10 text-purple-500',
}

export default function GalleryCommentsView({ galleryId, initialComments }: Props) {
  const t = useTranslations('GalleryComments')
  const [comments, setComments] = useState(initialComments)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = comments.filter((c) => {
    if (filter === 'unanswered') return !c.ownerReply
    if (filter === 'replied') return !!c.ownerReply
    return true
  })

  const unansweredCount = comments.filter((c) => !c.ownerReply).length

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

  function handleGroupImageReplaced(imageId: string, newImageUrl: string) {
    setComments((prev) =>
      prev.map((c) => (c.imageId === imageId ? { ...c, imageUrl: newImageUrl } : c))
    )
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
          <MessageSquareIcon className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">{t('noFeedback')}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('noFeedbackDesc')}
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
            {f === 'all' ? t('filterAll') : f === 'unanswered' ? t('filterUnanswered') : t('filterReplied')}
            {f === 'unanswered' && unansweredCount > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] text-white">
                {unansweredCount}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {t('commentCount', { count: filtered.length })}
        </span>
      </div>

      {/* Image groups masonry */}
      <div className="columns-1 md:columns-2 gap-5">
      {Object.entries(grouped).map(([imageId, imageComments]) => (
        <ImageGroup
          key={imageId}
          imageId={imageId}
          imageUrl={imageComments[0]?.imageUrl}
          comments={imageComments}
          galleryId={galleryId}
          onReplied={handleReplied}
          onDone={handleDone}
          onImageReplaced={(newUrl) => handleGroupImageReplaced(imageId, newUrl)}
        />
      ))}
      </div>
    </div>
  )
}

// ── Image group card ──────────────────────────────────────────────────────────

function ImageGroup({
  imageId,
  imageUrl: initialImageUrl,
  comments,
  galleryId,
  onReplied,
  onDone,
  onImageReplaced,
}: {
  imageId: string
  imageUrl: string | null | undefined
  comments: CommentWithImage[]
  galleryId: string
  onReplied: (commentId: string, reply: string) => void
  onDone: (commentId: string, done: boolean) => void
  onImageReplaced: (newUrl: string) => void
}) {
  const t = useTranslations('GalleryComments')
  const [isReplacing, setIsReplacing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [displayUrl, setDisplayUrl] = useState(initialImageUrl)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const doneCount = comments.filter((c) => c.isDone).length
  const donePercent = Math.round((doneCount / comments.length) * 100)

  async function handleReplaceFile(file: File) {
    setIsReplacing(true)
    try {
      const [newUrl] = await onImagesUpload([file], 'uploads')
      const result = await replaceGalleryCategoryImage(imageId, newUrl)
      if (!result.success) {
        toast({ title: result.error, variant: 'destructive' })
        return
      }
      try {
        const parsed = JSON.parse(newUrl) as { url?: string }
        if (parsed.url) setDisplayUrl(parsed.url)
      } catch {
        setDisplayUrl(newUrl)
      }
      onImageReplaced(newUrl)
      toast({ title: t('imageReplaced') })
    } catch {
      toast({ title: t('imageReplaceFail'), variant: 'destructive' })
    } finally {
      setIsReplacing(false)
    }
  }

  return (
    <>
      <div className="break-inside-avoid mb-5 rounded-2xl border bg-card overflow-hidden">
        {/* Clickable header */}
        <div
          className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/40"
          onClick={() => setModalOpen(true)}
        >
          {displayUrl ? (
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
              <Image src={displayUrl} alt="" fill className="object-cover" sizes="56px" />
            </div>
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
              <ImageIcon className="size-4 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium">
                {t('commentCount', { count: comments.length })}
              </p>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {doneCount}/{comments.length} done
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${donePercent}%` }}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-7 gap-1.5 px-2.5 text-xs"
            disabled={isReplacing}
            onClick={(e) => { e.stopPropagation(); replaceInputRef.current?.click() }}
          >
            {isReplacing
              ? <Loader2Icon className="size-3 animate-spin" />
              : <ImageIcon className="size-3" />}
            {isReplacing ? t('replacing') : t('replaceImage')}
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
        </div>

        {/* Comment rows */}
        <div className="divide-y">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              galleryId={galleryId}
              onReplied={(reply) => onReplied(comment.id, reply)}
              onDone={(done) => onDone(comment.id, done)}
            />
          ))}
        </div>
      </div>

      {/* Desktop: side-by-side dialog */}
      {!isMobile && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
            <div className="flex h-[80vh]">
              <div className="flex w-2/5 shrink-0 items-center justify-center bg-neutral-950 p-4">
                {displayUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayUrl} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImageIcon className="size-12 text-neutral-600" />
                )}
              </div>
              <div className="flex flex-1 flex-col overflow-hidden border-l">
                <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{t('feedbackLabel')}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{imageId.slice(0, 8)}…</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${donePercent}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{doneCount}/{comments.length}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y">
                  {comments.map((comment) => (
                    <CommentRow
                      key={comment.id}
                      comment={comment}
                      galleryId={galleryId}
                      onReplied={(reply) => onReplied(comment.id, reply)}
                      onDone={(done) => onDone(comment.id, done)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile: bottom drawer with image on top */}
      <AnimatePresence>
        {isMobile && modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setModalOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 flex h-[65dvh] flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Drag handle + close */}
              <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
                <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/25" />
              </div>

              {/* Image */}
              <div className="relative shrink-0 w-full bg-neutral-950" style={{ height: '45vw', maxHeight: 240 }}>
                {displayUrl ? (
                  <Image src={displayUrl} alt="" fill className="object-contain" sizes="100vw" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageIcon className="size-10 text-neutral-600" />
                  </div>
                )}
                {/* Close button */}
                <button
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                  onClick={() => setModalOpen(false)}
                >
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Header bar */}
              <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                <p className="text-sm font-semibold">
                  {t('commentCount', { count: comments.length })}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${donePercent}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{doneCount}/{comments.length}</span>
                </div>
              </div>

              {/* Scrollable comments */}
              <div className="flex-1 overflow-y-auto divide-y">
                {comments.map((comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                    galleryId={galleryId}
                    onReplied={(reply) => onReplied(comment.id, reply)}
                    onDone={(done) => onDone(comment.id, done)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Comment row ───────────────────────────────────────────────────────────────

function CommentRow({
  comment,
  galleryId,
  onReplied,
  onDone,
}: {
  comment: CommentWithImage
  galleryId: string
  onReplied: (reply: string) => void
  onDone: (done: boolean) => void
}) {
  const t = useTranslations('GalleryComments')
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState(comment.ownerReply ?? '')
  const [isReplying, startReplyTransition] = useTransition()
  const [isDoneLoading, startDoneTransition] = useTransition()
  const badgeClass = TYPE_BADGE_CLASS[comment.type]
  const badgeLabel = {
    comment: t('typeBadge_comment'),
    feedback: t('typeBadge_feedback'),
    request: t('typeBadge_request'),
  }[comment.type]

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

  function handleCancelReply() {
    setReplying(false)
    setReplyText(comment.ownerReply ?? '')
  }

  return (
    <div className={`px-4 py-4 space-y-3 transition-colors ${comment.isDone ? 'bg-green-500/5' : ''}`}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
            {badgeLabel}
          </span>
          {comment.clientName && (
            <span className="text-xs font-medium">{comment.clientName}</span>
          )}
          {comment.isDone && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-600">
              <CheckCircle2Icon className="size-3" />
              {t('done')}
            </span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{comment.comment}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!replying && (
          <Button
            variant="ghost" size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setReplying(true)}
          >
            <MessageSquareTextIcon className="size-3" />
            {comment.ownerReply ? t('editReply') : t('reply')}
          </Button>
        )}
        <Button
          variant="ghost" size="sm"
          className={`h-7 gap-1.5 px-2.5 text-xs ${comment.isDone ? 'text-green-600 hover:text-green-700 hover:bg-green-500/10' : 'text-muted-foreground hover:text-foreground'}`}
          disabled={isDoneLoading}
          onClick={handleToggleDone}
        >
          {isDoneLoading
            ? <Loader2Icon className="size-3 animate-spin" />
            : comment.isDone
              ? <RotateCcwIcon className="size-3" />
              : <CheckCircle2Icon className="size-3" />}
          {comment.isDone ? t('undoDone') : t('markDone')}
        </Button>
      </div>

      {comment.ownerReply && !replying && (
        <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground">
            <CheckIcon className="size-2.5 text-background" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{t('yourReply')}</p>
            <p className="text-xs leading-relaxed">{comment.ownerReply}</p>
          </div>
        </div>
      )}

      {replying && (
        <div className="space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply()
              if (e.key === 'Escape') handleCancelReply()
            }}
            placeholder={t('replyPlaceholder')}
            rows={2}
            autoFocus
            className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">{t('replyHint')}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-7 px-3 text-xs" onClick={handleCancelReply}>
                {t('cancel')}
              </Button>
              <Button size="sm" className="h-7 px-3 text-xs" onClick={handleReply} disabled={!replyText.trim() || isReplying}>
                {isReplying ? t('sending') : comment.ownerReply ? t('updateReply') : t('sendReply')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
