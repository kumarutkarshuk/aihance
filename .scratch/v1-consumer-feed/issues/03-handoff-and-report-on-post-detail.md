Status: ready-for-agent

# 03: Handoff and Report on Post detail

**What to build:** From Post detail, a Consumer can Handoff to ChatGPT (copy Prompt, save reference image, open ChatGPT) and Report a Post that is not a usable AI style reference — each action with confirmation. No account required. The Post remains visible in the Feed after Reporting (v1 behavior).

**Blocked by:** 01 (Browse Feed and Post detail)

## Acceptance criteria

- [ ] `POST /posts/:id/report` increments the Post's report count in D1
- [ ] Reporting a non-existent Post returns 404
- [ ] API tests cover Report submission (count increments, Post still returned by `GET /posts` until deleted)
- [ ] "Copy Prompt" button copies Prompt text to the system clipboard and shows confirmation; hidden or disabled when no Prompt exists
- [ ] "Save image" button saves the reference image to the device photo library and shows confirmation; handles permission denial gracefully
- [ ] "Open in ChatGPT" button opens ChatGPT via URL scheme or universal link (best-effort pre-fill; clipboard remains the reliable fallback)
- [ ] Handoff actions require no sign-in
- [ ] "Report" button on Post detail submits a Report and shows confirmation
- [ ] Reported Post remains visible in the Consumer's Feed (no client-side hide in v1)
- [ ] Handoff and Report work on iOS and Android
