Status: ready-for-agent

# 05: Launch seed dataset

**What to build:** The Feed is populated with 50–100 Posts distributed across the curated Tags, ready for first real-user launch. Every Tag filter returns meaningful results.

**Blocked by:** 04 (Admin manage Posts)

## Acceptance criteria

- [ ] At least 50 Posts exist in D1 with images in R2
- [ ] Posts are distributed across all curated Tags so no Tag filter returns an empty grid
- [ ] Each Post has an image; Prompt is present on most Posts but some inspiration-only Posts have no Prompt
- [ ] Seeding is repeatable (bulk script or documented admin workflow using the create Post flow)
- [ ] Seeding instructions are documented so the team can add or replace Posts before launch
- [ ] Mobile Feed loads and scrolls smoothly with the full dataset
- [ ] Tag filters each return a meaningful subset of Posts
