Status: ready-for-agent

# v1 Consumer Feed

## Problem Statement

People who want to create cool AI-generated images struggle to discover styles worth trying. Prompts and reference images are scattered across social media, chat apps, and bookmarks. There is no dedicated place to browse AI image styles, grab the prompt and reference image, and apply that style to their own photo.

## Solution

AIhance v1 is a mobile app (iOS and Android) where Consumers browse a curated Feed of Posts — each Post is an image with an optional Prompt and Tags. When a Consumer finds a style they like, they Handoff to ChatGPT by copying the Prompt, saving the reference image, or opening ChatGPT directly. Consumers can Report Posts that are not usable AI style references. The Feed is seeded and maintained by the team via a password-protected web admin. No account is required to browse.

## User Stories

### Feed browsing

1. As a Consumer, I want to open the app and see a grid Feed of Posts, so that I can discover AI image styles at a glance.
2. As a Consumer, I want the Feed to load Posts from a remote source, so that new styles can be added without an app update.
3. As a Consumer, I want each Post in the grid to show its image as a thumbnail, so that I can quickly scan visual styles.
4. As a Consumer, I want the Feed grid to scroll smoothly with many Posts, so that browsing feels natural on a phone.
5. As a Consumer, I want to pull-to-refresh the Feed, so that I can see newly added Posts.
6. As a Consumer, I want to see a loading state while the Feed fetches, so that I know the app is working.
7. As a Consumer, I want to see an error state if the Feed fails to load, so that I know something went wrong and can retry.
8. As a Consumer, I want to retry loading the Feed after an error, so that a transient network failure does not block me permanently.
9. As a Consumer, I want the Feed to work on iOS, so that I can browse on my iPhone.
10. As a Consumer, I want the Feed to work on Android, so that I can browse on my Android phone.
11. As a Consumer, I want the Feed to display at least 50 Posts at launch, so that browsing does not feel empty.

### Tag filtering

12. As a Consumer, I want to see a list of curated Tags, so that I can filter the Feed by style or theme.
13. As a Consumer, I want to tap a Tag to filter the Feed to Posts with that Tag, so that I can find styles in a category I care about (e.g. "anime", "watercolor").
14. As a Consumer, I want to clear the Tag filter and return to the full Feed, so that I can browse everything again.
15. As a Consumer, I want a Post to display its Tags on the detail screen, so that I know how it is categorized.
16. As a Consumer, I want to tap a Tag on a Post detail screen to filter the Feed by that Tag, so that I can find similar styles quickly.

### Post detail

17. As a Consumer, I want to tap a Post in the Feed grid to open its detail screen, so that I can see the full image and Prompt.
18. As a Consumer, I want to see the full-size reference image on the detail screen, so that I can evaluate the style clearly.
19. As a Consumer, I want to see the Prompt on the detail screen when one exists, so that I can read how the image was generated.
20. As a Consumer, I want to see when the Post was published, so that I can gauge how recent the style is.
21. As a Consumer, I want the detail screen to not show an author name in v1, so that the interface stays simple while the Feed is team-curated.
22. As a Consumer, I want to navigate back from the detail screen to the Feed, so that I can continue browsing.
23. As a Consumer, I want the detail screen to handle Posts with no Prompt gracefully, so that inspiration-only Posts still work.

### Handoff

24. As a Consumer, I want to copy the Prompt to my clipboard from the detail screen, so that I can paste it into ChatGPT.
25. As a Consumer, I want confirmation when the Prompt is copied, so that I know the action succeeded.
26. As a Consumer, I want to save the reference image to my camera roll from the detail screen, so that I can upload it to ChatGPT alongside the Prompt.
27. As a Consumer, I want confirmation when the image is saved, so that I know the action succeeded.
28. As a Consumer, I want an "Open in ChatGPT" button on the detail screen, so that I can jump to ChatGPT quickly.
29. As a Consumer, I want the Handoff buttons to be disabled or hidden when there is no Prompt and no image URL, so that I am not offered broken actions.
30. As a Consumer, I want to Handoff without creating an account, so that there is no friction between discovery and trying a style.

### Reporting

31. As a Consumer, I want to Report a Post from the detail screen, so that I can flag content that is not a usable AI style reference.
32. As a Consumer, I want confirmation when my Report is submitted, so that I know it was received.
33. As a Consumer, I want to Report without creating an account, so that moderation does not require sign-in.
34. As a Consumer, I want to Report spam, NSFW content, memes, ads, and other off-topic Posts, so that the Feed stays focused on AI style references.
35. As a Consumer, I want the Reported Post to remain visible in my Feed after I Report it (v1), so that I am not confused by sudden disappearance before admin review.

### Admin (team-operated)

36. As an admin, I want a password-protected web page listing all Posts, so that I can manage the Feed remotely.
37. As an admin, I want to see the Report count for each Post, so that I can prioritize reviewing flagged content.
38. As an admin, I want to delete a Post from the admin page, so that it disappears from all Consumers' Feeds.
39. As an admin, I want to add new Posts via the admin tooling or seeding process, so that I can grow the Feed beyond the initial 50–100 Posts.
40. As an admin, I want to assign Tags from the curated list when creating a Post, so that Consumers can filter by them.
41. As an admin, I want to attach an optional Prompt when creating a Post, so that Consumers can copy it during Handoff.
42. As an admin, I want to upload an image that is stored in blob storage, so that Post images are served reliably.

### Seeding and launch

43. As an admin, I want to seed 50–100 Posts before launch, so that the Feed feels rich on day one.
44. As an admin, I want Posts distributed across the curated Tags, so that every filter returns meaningful results.
45. As an admin, I want to define a curated Tag list of roughly 15 Tags upfront, so that filtering stays consistent.

## Implementation Decisions

### Architecture

- **Three components:** Expo mobile app (Consumer UI), Cloudflare Worker API (Feed backend), password-protected web admin page (moderation and seeding).
- **Storage split (ADR-0001):** Post images in Cloudflare R2; Post metadata in Cloudflare D1. Both accessed via the Worker API.
- **No auth for Consumers in v1.** Browse, Handoff, and Report are anonymous.
- **Platforms:** iOS and Android via Expo. Web app deferred.

### Feed API (Worker)

Single HTTP API surface that both the mobile app and admin page call. Proposed endpoints:

- `GET /posts` — list Posts for the Feed. Optional query param `tag` to filter by Tag slug. Returns id, image URL, tag slugs, created date. Does not return full Prompt in list view (keep payload small).
- `GET /posts/:id` — single Post detail. Returns id, image URL, prompt (nullable), tag slugs, created date, report count (admin only or omitted for Consumer).
- `POST /posts/:id/report` — increment report count for a Post. No auth in v1. Idempotent enough that repeat Reports from same device are acceptable at low volume.
- `DELETE /posts/:id` — admin only. Removes Post from D1 and optionally the image from R2.
- `POST /posts` — admin only. Accepts image upload, optional prompt, tag slugs. Stores image in R2, metadata in D1.
- `GET /tags` — returns the curated Tag list (slug + display name).

Admin endpoints protected by a shared secret (Bearer token or session cookie set via password login on the admin page).

### D1 schema

```
posts
  id          TEXT PRIMARY KEY
  image_key   TEXT NOT NULL        -- R2 object key
  prompt      TEXT                 -- nullable
  created_at  TEXT NOT NULL        -- ISO 8601
  report_count INTEGER DEFAULT 0

tags
  slug        TEXT PRIMARY KEY
  display_name TEXT NOT NULL

post_tags
  post_id     TEXT REFERENCES posts(id)
  tag_slug    TEXT REFERENCES tags(slug)
  PRIMARY KEY (post_id, tag_slug)
```

Tag slugs are lowercase, hyphenated (e.g. `anime`, `watercolor`). The curated list is seeded via migration or admin setup script before Posts are added.

### R2

- One bucket for Post images.
- Images served via public R2 URL or Worker proxy (`GET /images/:key`).
- Uploaded images keyed by Post id or UUID.

### Mobile app modules

- **Feed screen** — fetches `GET /posts`, renders grid, supports Tag filter bar and pull-to-refresh.
- **Post detail screen** — fetches `GET /posts/:id`, renders image, prompt, tags, date, Handoff buttons, Report button.
- **Handoff actions** — clipboard copy (Prompt), save to camera roll (reference image via expo-media-library or equivalent), deep link to ChatGPT app/website.
- **Report action** — calls `POST /posts/:id/report`, shows toast confirmation.
- **API client module** — thin wrapper around Feed API base URL. Single place to configure the Worker URL.

Navigation via Expo Router: Feed as index route, Post detail as dynamic route with Post id param.

### Admin web page

- Served by the same Worker or a separate static page calling the Worker API.
- Password gate stores admin token in session/localStorage.
- Table of Posts with image thumbnail, prompt preview, tags, report count, delete button.
- Form to create a new Post (image file, optional prompt, tag multi-select).

### Handoff behavior

- **Copy Prompt:** writes Prompt text to system clipboard.
- **Save image:** downloads image from R2 URL, saves to device photo library (requires platform permission prompt).
- **Open in ChatGPT:** opens ChatGPT via URL scheme or universal link. Pre-filling the Prompt is best-effort; clipboard copy is the reliable fallback.

### Content policy

- Feed purpose: AI style references. Reports target spam, NSFW, memes, ads, and non-style content.
- Any image allowed with optional Prompt. No author attribution in v1.

### Curated Tags (initial set — to be finalized at seed time)

Roughly 15 Tags covering major style categories, e.g.: anime, watercolor, cinematic, portrait, landscape, cyberpunk, vintage, minimalist, fantasy, sketch, 3d-render, neon, film-noir, pop-art, abstract. Exact list set during seeding.

## Testing Decisions

### Proposed test seam

**The Feed API (Cloudflare Worker HTTP interface)** is the single highest test seam. Both the mobile app and admin page are thin clients over this API. Testing the API contract validates Feed listing, Tag filtering, Post detail, Report submission, admin create/delete, and auth gating — without coupling tests to React Native rendering or admin HTML.

If this seam does not match your expectations, say so before implementation starts.

### What makes a good test

- Test **external behavior** only: HTTP request in, HTTP response out. Assert status codes, response body shape, and side effects on D1/R2.
- Do **not** test implementation details (internal helper functions, D1 query strings, component state).
- Use **Miniflare / wrangler dev** with an in-memory or local D1 instance and mock R2 for CI.
- Seed test fixtures (Tags, Posts) in setup; tear down after each test file.

### Modules tested

- Feed API Worker: all endpoints listed above.
- Tag filter logic (query param → filtered Post list).
- Admin auth middleware (reject unauthenticated delete/create).
- Report increment (count increases, Post still returned in Feed until deleted).

### Prior art

No existing tests in the codebase. This will be the first test suite. Prefer Vitest or Workers test runner (wrangler's built-in) consistent with Cloudflare Worker tooling.

### Mobile app testing (deferred)

UI/integration tests for the Expo app are out of scope for the initial test suite. Manual QA on iOS simulator and Android emulator for Handoff actions (clipboard, save image, ChatGPT link). Revisit with Maestro or Detox once the API layer is stable.

## Out of Scope

- **Producer upload flow** (v1.1) — Consumers only in v1; Feed is team-seeded.
- **User accounts and auth** (v1.1) — no sign-in for Consumers; better-auth with Apple/Google deferred (ADR-0002).
- **In-app Restyle** — Handoff to external AI app only. In-app Restyle gated on usage (500+ Handoffs/month or 100 WAU).
- **Full-text search** — Tag filter only in v1; search in v1.1.
- **Report rate limiting** — no device limits at launch; add when Report volume spikes.
- **Auto-hide Posts by report threshold** — admin manually deletes flagged Posts.
- **Review queue for new Posts** — no Producer uploads in v1; immediate publish applies to v1.1.
- **Author attribution** — no author shown on Post detail in v1.
- **Web app** — iOS and Android only.
- **Push notifications, social features, likes, comments, following.**
- **Monetization and in-app purchases.**
- **NSFW auto-detection** — manual admin review only.
- **Offline mode** — app requires network to load Feed.

## Further Notes

- ADR-0001 (R2 + D1) and ADR-0002 (better-auth) govern storage and future auth respectively. This spec implements ADR-0001 only.
- Domain vocabulary is defined in `CONTEXT.md`. Use Post, Consumer, Prompt, Handoff, Report, Tag, Feed consistently in code and UI copy.
- Launch target: 50–100 seeded Posts across curated Tags before first real-user release.
- ChatGPT deep linking may be limited on mobile; design Handoff UX so clipboard + save image work even when "Open in ChatGPT" cannot pre-fill the Prompt.
