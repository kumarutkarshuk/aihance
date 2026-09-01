Status: claimed

# 03: Handoff and Report on Post detail

**What to build:** From Post detail, a Consumer can Handoff to ChatGPT (copy Prompt, save reference image, open ChatGPT) and Report a Post that is not a usable AI style reference — each action with confirmation. No account required. The Post remains visible in the Feed after Reporting (v1 behavior).

**Blocked by:** 01 (Browse Feed and Post detail)

## Acceptance criteria

- [x] `POST /posts/:id/report` increments the Post's report count in D1
- [x] Reporting a non-existent Post returns 404
- [x] API tests cover Report submission (count increments, Post still returned by `GET /posts` until deleted)
- [x] "Copy Prompt" button copies Prompt text to the system clipboard and shows confirmation; hidden or disabled when no Prompt exists
- [x] "Save image" button saves the reference image to the device photo library and shows confirmation; handles permission denial gracefully
- [x] "Open in ChatGPT" button opens ChatGPT via URL scheme or universal link (best-effort pre-fill; clipboard remains the reliable fallback)
- [x] Handoff actions require no sign-in
- [x] "Report" button on Post detail submits a Report and shows confirmation
- [x] Reported Post remains visible in the Consumer's Feed (no client-side hide in v1)
- [x] Handoff and Report work on iOS and Android

## Comments

Implemented on the Feed API seam (`POST /posts/:id/report`) plus Post detail Handoff/Report actions. Confirmation is inline on the detail screen (no extra toast library). ChatGPT opens via `https://chatgpt.com/?q=` universal link with best-effort prefill. Device QA on a real iPhone and Android phone is still worth a pass for clipboard, photo save, and ChatGPT open.
