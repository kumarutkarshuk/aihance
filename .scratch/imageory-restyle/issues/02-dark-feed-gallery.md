Status: ready-for-agent

# 02: Dark Feed gallery

**What to build:** A Consumer browses a fully restyled Feed — AIhance wordmark header, permanent "All" chip plus gradient Tag pills, a two-column masonry grid with glass-framed thumbnails, shimmer skeleton placeholders on initial load, fade-in thumbnails as images resolve, a bottom scroll fade, pull-to-refresh, and dark-themed error and empty states. Tag filtering behavior is unchanged from v1. Tapping a Post still opens Post detail.

**Blocked by:** 01 (Theme, fonts, and app shell)

## Acceptance criteria

- [ ] Feed shows a custom header with Pacifico "AIhance" wordmark only (no search, favorites, or sign-in)
- [ ] Tag bar includes a permanent "All" chip selected when no Tag filter is active
- [ ] Selected Tag chips (including "All") use gradient-fill styling; unselected chips use plain-border styling
- [ ] Tapping a selected Tag (other than "All") deselects it; tapping "All" clears the filter — same router param behavior as v1
- [ ] Feed grid uses two-column masonry with natural image aspect ratios (reasonable fallback until dimensions are known)
- [ ] Each masonry cell uses a glass frame (rounded corners, subtle border, soft shadow)
- [ ] Initial Feed load shows shimmer skeleton placeholders in masonry layout instead of a centered spinner
- [ ] Post thumbnails fade in as each image finishes loading
- [ ] Subtle bottom fade gradient overlays the Feed scroll area (~150px)
- [ ] Pull-to-refresh, error banner, retry, and filtered-empty states work and are styled for dark theme
- [ ] Tapping a Post navigates to Post detail
- [ ] Feed works on iOS and Android
- [ ] `expo lint` and `tsc --noEmit` pass
