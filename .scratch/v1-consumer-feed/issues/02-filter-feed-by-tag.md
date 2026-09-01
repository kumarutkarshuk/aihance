Status: ready-for-agent

# 02: Filter Feed by Tag

**What to build:** A Consumer taps a Tag and the Feed filters to Posts with that Tag. Clearing the filter returns to the full Feed. Tags are tappable from both the Feed screen and Post detail.

**Blocked by:** 01 (Browse Feed and Post detail)

## Acceptance criteria

- [ ] `GET /posts?tag=<slug>` returns only Posts tagged with that Tag
- [ ] Invalid or unknown tag slug returns an empty list (not an error)
- [ ] API tests cover Tag filtering (filtered results, empty results, unfiltered list unchanged)
- [ ] Feed screen shows the curated Tag list (from `GET /tags`)
- [ ] Tapping a Tag on the Feed filters the grid; tapping again or a "clear" control restores the full Feed
- [ ] Post detail displays Tags; tapping a Tag navigates back to the Feed filtered by that Tag
- [ ] Pull-to-refresh works when a Tag filter is active
- [ ] Loading and error states work when fetching a filtered Feed
