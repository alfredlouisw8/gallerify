'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { addImageComment } from '../actions/addImageComment'
import { getImageComments } from '../actions/getImageComments'
import type { ImageComment, ImageCommentType } from '@/types'

type ThemeColors = {
  bg: string
  text: string
  textMuted: string
  textDim: string
  border: string
  surface: string
  pillBg: string
}

type Props = {
  galleryId: string
  imageId: string
  isClient: boolean
  theme: ThemeColors
}

const TYPE_OPTIONS: { value: ImageCommentType; label: string }[] = [
  { value: 'comment', label: 'Comment' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'request', label: 'Request' },
]

const TYPE_BADGE: Record<ImageCommentType, { bg: string; text: string }> = {
  comment:  { bg: 'rgba(59,130,246,0.18)',  text: '#93c5fd' },
  feedback: { bg: 'rgba(245,158,11,0.18)',  text: '#fcd34d' },
  request:  { bg: 'rgba(168,85,247,0.18)',  text: '#d8b4fe' },
}

export function ImageCommentPanel({ galleryId, imageId, isClient, theme }: Props) {
  const [comments, setComments] = useState<ImageComment[]>([])
  const [loading, setLoading] = useState(true)
  const [clientName, setClientName] = useState('')
  const [type, setType] = useState<ImageCommentType>('comment')
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    setComments([])
    getImageComments(galleryId, imageId).then((data) => {
      setComments(data)
      setLoading(false)
    })
  }, [galleryId, imageId])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments])

  function handleSubmit() {
    if (!text.trim() || isPending) return
    startTransition(async () => {
      const result = await addImageComment({
        galleryId,
        imageId,
        clientName: clientName.trim() || null,
        type,
        comment: text.trim(),
      })
      if (result.success) {
        setComments((prev) => [...prev, result.data])
        setText('')
      }
    })
  }

  return (
    <div className="flex h-full flex-col" style={{ color: theme.text }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <p className="text-sm font-medium">Comments</p>
        {comments.length > 0 && (
          <span className="text-xs tabular-nums" style={{ color: theme.textDim }}>
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment list */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-xs" style={{ color: theme.textDim }}>Loading…</p>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center space-y-1">
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>No comments yet</p>
            {isClient && (
              <p className="text-xs" style={{ color: theme.textDim }}>
                Leave a comment, feedback, or request below.
              </p>
            )}
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="space-y-2">
              {/* Client comment */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: TYPE_BADGE[c.type].bg, color: TYPE_BADGE[c.type].text }}
                  >
                    {c.type}
                  </span>
                  {c.clientName && (
                    <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
                      {c.clientName}
                    </span>
                  )}
                  <span className="ml-auto text-[10px]" style={{ color: theme.textDim }}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
                  {c.comment}
                </p>
              </div>

              {/* Photographer reply */}
              {c.ownerReply && (
                <div
                  className="ml-3 rounded-lg px-3 py-2.5 space-y-0.5"
                  style={{
                    backgroundColor: `${theme.text}12`,
                    borderLeft: `2px solid ${theme.text}30`,
                  }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                    Photographer
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: theme.text }}>
                    {c.ownerReply}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form — client only */}
      {isClient && (
        <div
          className="shrink-0 space-y-3 p-4"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          {/* Type selector */}
          <div className="flex gap-1">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className="flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: type === t.value ? theme.text : theme.pillBg,
                  color: type === t.value ? theme.bg : theme.textDim,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Name */}
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
          />

          {/* Comment textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
            placeholder="Write your comment…"
            rows={3}
            className="w-full resize-none rounded-lg border px-3 py-2 text-xs outline-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || isPending}
            className="w-full rounded-lg py-2 text-xs font-semibold transition-opacity disabled:opacity-40"
            style={{ backgroundColor: theme.text, color: theme.bg }}
          >
            {isPending ? 'Sending…' : 'Send'}
          </button>

          <p className="text-center text-[10px]" style={{ color: theme.textDim }}>
            ⌘↵ to send
          </p>
        </div>
      )}
    </div>
  )
}
