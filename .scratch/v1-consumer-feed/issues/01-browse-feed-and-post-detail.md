Status: ready-for-agent

# 01: Browse Feed and Post detail (read path)

**What to build:** A Consumer opens the app, sees a grid Feed of Posts loaded from the cloud, taps one, and views the full image, optional Prompt, Tags, and published date — then navigates back. This is the first end-to-end read path through storage, API, and mobile UI.

**Blocked by:** None (can start immediately)

## Acceptance criteria

- [ ] Cloudflare Worker project is set up with D1 and R2 bindings per ADR-0001
- [ ] D1 schema exists for Posts, Tags, and post_tags (as defined in the spec)
- [ ] Curated Tags (~15) are seeded in D1
- [ ] A handful of sample Posts with images in R2 are seeded for development
- [ ] `GET /tags` returns the curated Tag list (slug + display name)
- [ ] `GET /posts` returns Post summaries (id, image URL, tag slugs, created date; no full Prompt in list)
- [ ] `GET /posts/:id` returns Post detail (id, image URL, prompt nullable, tag slugs, created date)
- [ ] Post images are served via public R2 URL or Worker proxy
- [ ] API tests cover all read endpoints (HTTP in/out, response shape, D1 side effects)
- [ ] Expo app fetches the Feed from the Worker API and renders a scrollable grid of Post thumbnails
- [ ] Feed shows loading, error, and retry states
- [ ] Feed supports pull-to-refresh
- [ ] Tapping a Post opens a detail screen with full image, Prompt (when present), Tags, and date — no author in v1
- [ ] Posts with no Prompt display gracefully on detail
- [ ] Consumer can navigate back from detail to the Feed
- [ ] Feed works on iOS and Android
