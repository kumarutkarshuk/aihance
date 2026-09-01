Status: ready-for-agent

# 04: Admin manage Posts

**What to build:** An admin opens a password-protected web page, sees all Posts with Report counts, creates a new Post (image upload, optional Prompt, Tag selection from curated list), and deletes a Post. Changes appear in the mobile Feed immediately.

**Blocked by:** 01 (Browse Feed and Post detail)

## Acceptance criteria

- [ ] Admin authentication protects create and delete endpoints (shared secret via Bearer token or session from password login)
- [ ] Unauthenticated requests to `POST /posts` and `DELETE /posts/:id` are rejected
- [ ] `POST /posts` accepts image upload, optional Prompt, and one or more Tag slugs from the curated list; stores image in R2 and metadata in D1
- [ ] `DELETE /posts/:id` removes Post from D1 and deletes the image from R2
- [ ] Admin-facing `GET /posts` or list endpoint includes report count per Post
- [ ] API tests cover admin auth gating, create, and delete (including R2/D1 side effects)
- [ ] Password-protected web admin page lists all Posts with thumbnail, Prompt preview, Tags, and Report count
- [ ] Admin can delete a Post from the list; deleted Post disappears from the mobile Feed on next fetch
- [ ] Admin can create a new Post via a form (image file, optional Prompt, Tag multi-select); new Post appears in the mobile Feed
- [ ] Admin login persists the session token for subsequent requests
