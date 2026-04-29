'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Images, MessageSquare, MonitorSmartphone } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

// Static (non-translatable) tab data
const TAB_STATIC = [
  {
    id: 'dashboard',
    icon: Images,
    type: 'browser' as const,
    src: '/gallery/gallery-dashboard.png',
    url: 'gallerify.com/gallery/vincent-wedding',
  },
  {
    id: 'live-preview',
    icon: Eye,
    type: 'browser' as const,
    src: '/gallery/gallery-live-preview.png',
    url: 'gallerify.com/gallery/vincent-wedding/edit',
  },
  {
    id: 'client-view',
    icon: MonitorSmartphone,
    type: 'split' as const,
    src: '/gallery/gallery-user-preview.png',
    mobileSrc: '/gallery/gallery-user-preview-mobile.png',
    url: 'gallerify.com/g/vincent-wedding',
  },
  {
    id: 'feedback',
    icon: MessageSquare,
    type: 'browser' as const,
    src: '/gallery/gallery-client-feedback.png',
    url: 'gallerify.com/g/vincent-wedding',
  },
] as const

type TabStatic = (typeof TAB_STATIC)[number]

type Tab = TabStatic & {
  label: string
  title: string
  description: string
  bullets: string[]
  alt: string
  mobileAlt?: string
}

// ─── Browser chrome frame ─────────────────────────────────────────────────────

function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl"
      style={{
        boxShadow:
          '0 24px 56px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.07)',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 100vw, 65vw"
        priority
      />
    </div>
  )
}

// ─── Phone frame ──────────────────────────────────────────────────────────────

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: 112,
        aspectRatio: '9/19',
        borderRadius: '1rem',
        boxShadow: '0 20px 48px -8px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-top"
        sizes="112px"
      />
    </div>
  )
}

// ─── Split frame (desktop + mobile side by side) ──────────────────────────────

function SplitFrame({ tab }: { tab: Extract<Tab, { type: 'split' }> }) {
  return (
    <div className="flex items-end gap-3 md:gap-4">
      <div
        className="relative flex-1 overflow-hidden rounded-xl"
        style={{
          boxShadow:
            '0 24px 56px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.07)',
        }}
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={tab.src}
            alt={tab.alt}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 55vw"
            priority
          />
        </div>
      </div>

      <div className="mb-4 hidden sm:block">
        <PhoneFrame src={tab.mobileSrc} alt={tab.mobileAlt ?? tab.alt} />
      </div>
    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: Tab
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
    >
      {isActive && (
        <motion.span
          layoutId="tab-pill"
          className="absolute inset-0 rounded-full bg-foreground"
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        />
      )}
      <tab.icon
        className="relative size-3.5 shrink-0"
        style={{ color: isActive ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))' }}
      />
      <span
        className="relative"
        style={{ color: isActive ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))' }}
      >
        {tab.label}
      </span>
    </button>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function ProductPreview() {
  const t = useTranslations('ProductPreview')
  const [activeId, setActiveId] = useState<string>(TAB_STATIC[0].id)

  const TABS: Tab[] = [
    {
      ...TAB_STATIC[0],
      label: t('tab_dashboard_label'),
      title: t('tab_dashboard_title'),
      description: t('tab_dashboard_desc'),
      bullets: [t('tab_dashboard_bullet1'), t('tab_dashboard_bullet2'), t('tab_dashboard_bullet3')],
      alt: t('tab_dashboard_alt'),
    },
    {
      ...TAB_STATIC[1],
      label: t('tab_livePreview_label'),
      title: t('tab_livePreview_title'),
      description: t('tab_livePreview_desc'),
      bullets: [t('tab_livePreview_bullet1'), t('tab_livePreview_bullet2'), t('tab_livePreview_bullet3')],
      alt: t('tab_livePreview_alt'),
    },
    {
      ...TAB_STATIC[2],
      label: t('tab_clientView_label'),
      title: t('tab_clientView_title'),
      description: t('tab_clientView_desc'),
      bullets: [t('tab_clientView_bullet1'), t('tab_clientView_bullet2'), t('tab_clientView_bullet3')],
      alt: t('tab_clientView_alt'),
      mobileAlt: t('tab_clientView_mobileAlt'),
    },
    {
      ...TAB_STATIC[3],
      label: t('tab_feedback_label'),
      title: t('tab_feedback_title'),
      description: t('tab_feedback_desc'),
      bullets: [t('tab_feedback_bullet1'), t('tab_feedback_bullet2'), t('tab_feedback_bullet3')],
      alt: t('tab_feedback_alt'),
    },
  ]

  const activeTab = TABS.find((tab) => tab.id === activeId)!

  return (
    <section className="py-24 md:py-32">
      <div className="container px-4 md:px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('sectionLabel')}
          </p>
          <h2 className="font-display max-w-xl text-4xl font-semibold leading-[1.08] tracking-tighter md:text-5xl">
            {t('heading1')}
            <br />
            <span className="italic text-muted-foreground">{t('heading2')}</span>
          </h2>
        </motion.div>

        {/* Tab strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mb-10 flex gap-1 overflow-x-auto rounded-full border border-border bg-secondary/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-fit"
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeId}
              onClick={() => setActiveId(tab.id)}
            />
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">

              {/* Left: text */}
              <div className="order-2 flex flex-col gap-5 lg:order-1">
                <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
                  {activeTab.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {activeTab.description}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {activeTab.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm">
                      <div className="mt-[5px] size-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: screenshot */}
              <div className="order-1 lg:order-2">
                {activeTab.type === 'split' ? (
                  <SplitFrame tab={activeTab as Extract<Tab, { type: 'split' }>} />
                ) : (
                  <BrowserFrame src={activeTab.src} alt={activeTab.alt} />
                )}
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
