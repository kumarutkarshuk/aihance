# Cloudflare R2 + D1 for feed storage

AIhance stores Post images in Cloudflare R2 and Post metadata (prompt, tags, dates, report counts) in Cloudflare D1. We chose this split over a single JSON manifest in R2 because the feed needs queryable metadata — tag filtering, report counts, and admin moderation — from day one, and Producer uploads in v1.1 will make a flat manifest unwieldy. Keeping blobs and metadata on Cloudflare avoids a second vendor while the app is small.

**Considered options:** Static JSON bundled in the app (too rigid for remote updates); JSON manifest in R2 (works for ~50 Posts but no queries for tags/reports); Supabase/Firebase alongside R2 (extra vendor, unnecessary for v1 scope).

**Consequences:** Admin tooling and the mobile app both talk to Cloudflare APIs. Migrating off Cloudflare later means moving both blobs and metadata together.
