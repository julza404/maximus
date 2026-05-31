# Maximus — Task List

## Phase 1 — Foundation
- [x] Scaffold Next.js + Tailwind + TypeScript project
- [x] Write SQL migrations for all 5 tables + RLS policies (`supabase/migrations/001_initial.sql`)
- [x] Implement `proxy.ts` to protect `/admin/*`
- [x] Build global Header + Footer with prism logo + "Maximus" wordmark
- [x] Build `/login` page with magic link form
- [ ] **YOU ARE HERE:** Create Supabase project + add env vars to `.env.local`

## Phase 2 — Topics
- [x] Build admin topics page (list + create + delete)
- [x] Build public `/topics` grid page
- [x] Build public `/topics/[slug]` page

## Phase 3 — Entries
- [x] Integrate Tiptap editor (`Editor.tsx`, `EntryForm.tsx`)
- [x] Build `/admin/entries/new` and `[id]/edit` pages
- [x] Slug auto-generation from title
- [x] Build `EditorRenderer.tsx` for read-only public rendering
- [x] Build public `/entries/[slug]` page
- [x] Build public home page (`/`) with recent entries
- [x] Topic pages list real entries

## Phase 4 — Cross-referencing
- [x] Secondary topics multi-select in entry form
- [x] `entry_topics` rows written on save
- [x] "Also in" topic badges on entry detail page
- [x] Topic pages include cross-referenced entries

## Phase 5 — Reminders
- [x] Build `/admin/reminders` (list + create + complete + delete)
- [x] Service worker + push permission on admin layout mount
- [x] `/api/push/subscribe` route
- [x] `/api/reminders/send` cron route
- [x] `vercel.json` cron job (every 1 min)
- [x] `public/sw.js` push handler

## Remaining before first use
- [ ] Create Supabase project at https://supabase.com
- [ ] Run `supabase/migrations/001_initial.sql` in Supabase SQL editor
- [ ] Copy `.env.local.example` → `.env.local` and fill in values
- [ ] Run `npx web-push generate-vapid-keys` and add to `.env.local`
- [ ] Add `NEXT_PUBLIC_SITE_URL` and `CRON_SECRET` to `.env.local`
- [ ] Deploy to Vercel (connect GitHub repo, add env vars in Vercel dashboard)

## Phase 6 — Polish (post-launch)
- [ ] Add `generateMetadata` OG images
- [ ] QA at 390×844 viewport
- [ ] 404 page styling
- [ ] Lighthouse score check
