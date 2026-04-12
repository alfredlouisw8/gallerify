# Gallerify

A SaaS platform that lets photographers create, manage, and publicly showcase their photo galleries. Built with Next.js 14, Supabase, and TypeScript.

---

## What It Does

Gallerify gives photographers a personal portfolio URL (`/your-username`) where they can:

- Upload photos into **galleries** (e.g. "Wedding - John & Jane 2024")
- Organize photos inside each gallery into **categories** (e.g. "Preparation", "Ceremony", "Reception")
- Toggle galleries between draft and published
- Share public gallery links with clients, complete with masonry grid, category filters, and a full-screen lightbox

---

## Tech Stack

| Layer         | Technology                                                 |
| ------------- | ---------------------------------------------------------- |
| Framework     | Next.js 14 (App Router, Server Components, Server Actions) |
| Language      | TypeScript 5                                               |
| Database      | Supabase (PostgreSQL)                                      |
| Auth          | Supabase Auth — Google OAuth                               |
| File Storage  | Supabase Storage                                           |
| UI            | Tailwind CSS + Radix UI + Shadcn/ui                        |
| Forms         | React Hook Form + Zod                                      |
| Drag & Drop   | @dnd-kit                                                   |
| Animations    | Motion (Framer Motion API)                                 |
| Data Fetching | SWR (client) + Next.js caching (server)                    |

---

## Project Structure

```
src/
├── app/
│   ├── (protected)/          # Auth-gated routes
│   │   ├── dashboard/        # Dashboard (placeholder)
│   │   ├── gallery/          # Gallery & category management
│   │   └── homepage/         # Profile editor
│   ├── [username]/           # Public portfolio
│   │   ├── page.tsx          # Photographer landing page
│   │   └── [slug]/page.tsx   # Public gallery viewer
│   ├── login/                # Google OAuth login
│   ├── api/auth/callback/    # OAuth redirect handler
│   └── page.tsx              # Marketing landing page
├── features/
│   ├── gallery/              # Gallery CRUD
│   ├── galleryCategory/      # Category management
│   ├── galleryCategoryImage/ # Image upload & ordering
│   ├── homepage/             # User profile
│   ├── public/               # Public portfolio views
│   ├── landing-page/         # Marketing page components
│   └── users/                # Auth UI
├── components/
│   ├── forms/                # Reusable form fields
│   ├── ui/                   # Shadcn/ui primitives
│   └── layout/               # Page layout wrappers
├── lib/
│   ├── supabase-server.ts    # Server-side Supabase client
│   ├── supabase-browser.ts   # Client-side Supabase client
│   └── create-safe-action.ts # Server action wrapper with Zod
├── utils/
│   ├── storage-actions.ts    # Supabase Storage upload/delete
│   └── functions.ts          # Image upload helper
└── types/index.ts            # Types + DB row → app type mappers
```

---

## Database Schema

```
user_metadata           — Public profile (username, banner, logo, bio, social links)
galleries               — Gallery (title, slug, banner, date, isPublished)
gallery_categories      — Category inside a gallery
gallery_category_images — Individual images inside a category
```

Relations: `auth.users` → `user_metadata`, `galleries` → `gallery_categories` → `gallery_category_images`. All cascade on delete.

Images are stored as JSON strings in the DB: `{"path": "uploads/123.jpg", "url": "https://..."}`.

---

## Key Flows

### Signup & Onboarding

1. User signs in with Google at `/login`
2. OAuth callback at `/api/auth/callback` sets session cookies
3. A PostgreSQL trigger auto-creates a `user_metadata` row
4. Username is derived from their Google email (e.g. `john.doe@gmail.com` → `john-doe`)

### Creating a Gallery

1. Go to `/gallery` → click **Create**
2. Fill in title, date, banner image(s), slug, and publish toggle
3. Server action `createGallery` inserts the gallery row + auto-creates a default category
4. Gallery appears in the list; navigate into it to manage categories and images

### Uploading Photos

1. Open `/gallery/[galleryId]/collection/[collectionId]`
2. Click **Add Image** → drop or select files
3. Files upload to Supabase Storage, JSON URLs are stored in DB
4. Images appear in the masonry grid; drag to reorder

### Publishing & Sharing

1. Toggle **isPublished** on a gallery (in the create/edit form)
2. Gallery is now live at `/{username}/{slug}`
3. Clients visit the URL to see the masonry grid, filter by category, and open the lightbox

---

## Public Portfolio

Each photographer gets two public URLs:

**`/{username}`** — Portfolio landing page

- Hero with parallax banner
- Grid of published galleries
- About section
- WhatsApp + Instagram contact links

**`/{username}/{slug}`** — Individual gallery

- Full-height hero banner
- Category filter pills (sticky)
- Masonry photo grid
- Full-screen lightbox with keyboard navigation (← →, Esc)
- Dark theme

Unpublished galleries are only accessible to the owner when logged in. A "Preview" banner is shown so the owner knows the gallery isn't live yet.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- Google OAuth credentials (configured in the Supabase Auth dashboard)

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your-secret-string
AUTH_TRUST_HOST=true
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Run the SQL migrations in `supabase/migrations/` against your Supabase project in order:

1. `001_initial_schema.sql` — creates all tables and triggers
2. `002_supabase_auth.sql` — wires up Supabase Auth integration

Make sure the `images` storage bucket in your Supabase project is set to **public**.

---

## Pages Reference

| Route                           | Auth      | Description                                  |
| ------------------------------- | --------- | -------------------------------------------- |
| `/`                             | Public    | Marketing landing page                       |
| `/login`                        | Public    | Google OAuth sign-in                         |
| `/[username]`                   | Public    | Photographer portfolio                       |
| `/[username]/[slug]`            | Public\*  | Gallery viewer (\*owner-only if unpublished) |
| `/dashboard`                    | Protected | Dashboard (placeholder)                      |
| `/gallery`                      | Protected | Gallery list                                 |
| `/gallery/create`               | Protected | New gallery form                             |
| `/gallery/[id]`                 | Protected | Gallery editor with categories               |
| `/gallery/[id]/collection/[id]` | Protected | Category detail with image grid              |
| `/homepage`                     | Protected | Profile / portfolio settings                 |
