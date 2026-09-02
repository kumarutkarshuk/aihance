Status: ready-for-agent

# Imageory-inspired mobile restyle

## Problem Statement

AIhance v1 works functionally — Consumers can browse the Feed, filter by Tag, open Post detail, Handoff, and Report — but the mobile UI is a plain light-theme scaffold. It does not reflect the polished, gallery-first aesthetic the team wants. Consumers should feel they are browsing a curated style library, not a default Expo starter app.

## Solution

Restyle the entire Consumer mobile app (Feed and Post detail) with a dark, Imageory-inspired visual language while keeping AIhance branding, domain vocabulary, and all existing v1 behavior. The Feed becomes a masonry gallery with glass-framed thumbnails and shimmer loading. Post detail becomes a full-screen hero image with a half-expanded bottom sheet for Prompt and Handoff actions. Custom navigation chrome replaces default stack headers throughout.

## User Stories

### Brand and scope

1. As a Consumer, I want the app to look and feel like a premium dark gallery, so that browsing styles feels intentional and polished.
2. As a Consumer, I want the app to remain branded as AIhance, so that I know which product I am using.
3. As a Consumer, I want UI copy to use AIhance domain terms (Post, Prompt, Handoff, Report, Tag, Feed), so that language stays consistent with the product model.

### Theme and typography

4. As a Consumer, I want the app to always use a dark theme, so that images are the visual focus.
5. As a Consumer, I want the Feed and Post detail backgrounds to be true black with off-white text, so that contrast matches the Imageory reference palette.
6. As a Consumer, I want accent colors (teal, amber, red gradients) on primary interactive elements, so that buttons and selected Tags feel cohesive with the reference design.
7. As a Consumer, I want the "AIhance" wordmark rendered in a script display font, so that the header has a distinctive gallery identity.
8. As a Consumer, I want all other UI text in a clean sans-serif font, so that prompts, tags, and buttons remain readable.

### App launch

9. As a Consumer, I want a brief branded splash on cold start (logo on black, then fade into the Feed), so that opening the app feels polished.
10. As a Consumer, I want the splash to be short (~800ms) with no fake progress bar, so that I am not kept waiting artificially.

### Feed screen — header and navigation

11. As a Consumer, I want a custom Feed header with the AIhance wordmark only (no search, favorites, or sign-in), so that the top bar stays clean and v1 scope is respected.
12. As a Consumer, I want the default stack navigation header hidden on the Feed, so that custom chrome is uninterrupted.
13. As a Consumer, I want the status bar styled for dark content (light icons), so that system UI matches the app theme.

### Feed screen — tag filtering

14. As a Consumer, I want a horizontal scrollable Tag bar below the header, so that I can filter the Feed by style or theme.
15. As a Consumer, I want a permanent "All" chip that is selected when no Tag filter is active, so that returning to the full Feed is obvious.
16. As a Consumer, I want the selected Tag chip (including "All") to use a gradient-fill style, so that the active filter is visually clear.
17. As a Consumer, I want unselected Tag chips to use a plain-border pill style, so that inactive filters recede visually.
18. As a Consumer, I want tapping a selected Tag (other than "All") to deselect it and show the full Feed, so that clearing a filter is one tap.
19. As a Consumer, I want Tag filtering behavior unchanged from v1 (same API, same router params), so that only presentation changes.

### Feed screen — masonry grid

20. As a Consumer, I want the Feed grid to use a masonry layout with two columns and natural image aspect ratios, so that browsing feels like a gallery rather than uniform squares.
21. As a Consumer, I want each Post thumbnail in a glass frame (rounded corners, subtle light border, soft shadow), so that tiles read clearly on a black background.
22. As a Consumer, I want to tap a thumbnail to open Post detail, so that discovery flow is unchanged.
23. As a Consumer, I want pull-to-refresh on the Feed, so that I can fetch newly added Posts.
24. As a Consumer, I want a subtle bottom fade gradient on the Feed scroll area, so that the grid blends into the background at the bottom edge.

### Feed screen — loading and empty states

25. As a Consumer, I want shimmer skeleton placeholders in masonry layout while the Feed initially loads, so that the screen feels responsive instead of blank.
26. As a Consumer, I want Post thumbnails to fade in as each image resolves, so that loading feels smooth.
27. As a Consumer, I want loading, error, empty, and retry states restyled for the dark theme, so that edge cases match the new visual language.
28. As a Consumer, I want an empty Feed message when no Posts match the selected Tag, with a way to clear the filter, so that filtered-empty behavior is unchanged.

### Post detail — layout

29. As a Consumer, I want Post detail to show the reference image full-screen as the hero, so that I can evaluate the style clearly.
30. As a Consumer, I want Prompt text and Handoff actions in a bottom sheet over the image, so that actions are reachable without leaving the hero view.
31. As a Consumer, I want the bottom sheet half-expanded by default, so that I can read the Prompt and reach Handoff buttons without dragging first.
32. As a Consumer, I want the bottom sheet draggable to expand or collapse further, so that I can focus on the image when I want more space.
33. As a Consumer, I want Posts with no Prompt to show "No prompt for this Post." in the sheet with Save image and Report still available, so that inspiration-only Posts work gracefully.
34. As a Consumer, I want the published date and Tags visible in the bottom sheet, so that Post metadata remains available.
35. As a Consumer, I want tapping a Tag on Post detail to filter the Feed by that Tag, so that navigation behavior is unchanged.

### Post detail — navigation and transitions

36. As a Consumer, I want a floating circular back button (plain-border style) over the hero image at the top-left, so that I can return to the Feed without a default stack header.
37. As a Consumer, I want the back button to respect the safe area, so that it is not obscured by the notch or status bar.
38. As a Consumer, I want navigation from Feed to Post detail to use a simple opacity fade, so that the transition feels soft without requiring shared-element animation.
39. As a Consumer, I want the default stack header hidden on Post detail, so that custom chrome is uninterrupted.

### Post detail — Handoff and Report actions

40. As a Consumer, I want Copy Prompt and Save image styled as gradient-fill primary buttons, so that Handoff actions are visually prominent.
41. As a Consumer, I want Report styled as a plain-border secondary button with destructive text, so that reporting is available but visually quieter than Handoff.
42. As a Consumer, I want Copy Prompt, Save image, and Report behavior unchanged (clipboard, photo library, API report, confirmations), so that only presentation changes.
43. As a Consumer, I want Handoff buttons disabled or hidden when there is no Prompt and no image URL, so that broken actions are not offered.

### Cross-platform

44. As a Consumer, I want the restyled Feed and Post detail to work on iOS, so that iPhone users get the new experience.
45. As a Consumer, I want the restyled Feed and Post detail to work on Android, so that Android users get the new experience.

## Implementation Decisions

### Scope boundary

- **In scope:** Expo mobile Consumer UI only — Feed screen, Post detail screen, and shared presentation components (grid, tag bar, actions, loading/error/empty states, root layout, splash).
- **Out of scope for this work:** Worker API, admin web page, search, favorites, sign-in, web app, film grain overlay, shared-element hero transitions.

### Visual reference

- Primary inspiration: [imageory.in](https://imageory.in) — dark gallery, script wordmark, gradient tag pills, glass image frames, masonry grid, bottom fade on Feed.
- AIhance retains its own name and glossary; the restyle borrows Imageory's *feel*, not its feature set or branding.

### Theme tokens

- Centralize color and gradient tokens in a shared theme module used by all restyled components.
- Adopt Imageory palette values:
  - Background `#000`, foreground `#f2f2f0`, muted text ~`#ffffff8c`
  - Surface/pill backgrounds for plain-border elements
  - Accent gradient (teal → amber → red) for borders and decorative use
  - Selected pill gradient (deep indigo → orange) for primary fills
  - Glass frame border ~`rgba(255,255,255,0.14)`, corner radius 12–16px
- No light mode; no film grain overlay in v1 of this restyle.

### Typography

- Load **Pacifico** for the "AIhance" wordmark (splash and Feed header) via Expo font loading.
- Load **Inter** or **Public Sans** for all other UI text via Expo font loading.
- Block rendering until fonts load (or show splash until ready) to avoid flash of unstyled text.

### Root layout

- Hide default Expo Router stack headers on Feed and Post detail screens.
- Configure status bar for light content on dark background.
- Integrate splash: show branded splash on launch, dismiss after fonts load and a brief fade (~800ms total), then reveal Feed.
- Screen transition from Feed to Post detail: opacity fade (stack animation config or screen option), not shared-element.

### Feed screen composition

- **Custom header component:** Pacifico "AIhance" wordmark only; no subtitle or placeholder action icons.
- **Tag filter bar:** Restyle existing tag bar; add permanent "All" chip; map selected state to gradient-fill, unselected to plain-border; preserve existing slug selection and router param behavior.
- **Masonry grid:** Replace uniform square 2-column grid with 2-column masonry distributing Posts by column height. Use natural aspect ratios from image dimensions when available; fall back to a reasonable default ratio when unknown until image loads.
- **Glass frame wrapper:** Shared visual wrapper applied to each masonry cell.
- **Bottom fade:** Absolute gradient overlay at the bottom of the Feed scroll container (~150px, transparent to background).
- Preserve pull-to-refresh, error banner, and existing Feed data fetching logic.

### Loading UX

- **Initial Feed load:** Render shimmer skeleton cells in masonry layout instead of a centered spinner.
- **Per-image load:** Fade in thumbnail opacity when `expo-image` finishes loading (transition already partially supported).
- Restyle `FeedLoadingState`, `FeedErrorState`, and `FeedEmptyState` for dark theme; initial load may delegate to skeleton grid rather than standalone loading screen when tags are available.

### Post detail composition

- **Hero image:** Full-width, full-bleed behind sheet; `contain` or `cover` chosen to maximize visible art without cropping critical content (prefer showing full reference image).
- **Bottom sheet:** Use a well-supported React Native bottom sheet library compatible with Expo SDK 54 and Reanimated (e.g. `@gorhom/bottom-sheet`), or an equivalent gesture-driven sheet. Default snap point: ~50% screen height (half-expanded). Include drag handle. Sheet content: date, Tags, Prompt (or empty state), Handoff actions.
- **Back button:** Floating pressable, circular, plain-border styling, positioned top-left with safe area inset; calls router back.

### Handoff actions presentation

- Restyle existing Post actions component; do not change Handoff or Report logic.
- Primary gradient-fill buttons: Copy Prompt (when prompt exists), Save image (when image URL exists).
- Secondary plain-border button: Report (destructive label color; disabled/reported states preserved).

### Dependencies

- Add Expo-compatible font packages for Pacifico and Inter/Public Sans.
- Add bottom sheet library if not already present (requires native module compatible with existing dev build; verify against Expo SDK 54 docs before installing).
- No new Worker or storage dependencies.

### Architecture

- Presentation-only change: no D1/R2 schema changes, no Feed API contract changes, no new endpoints.
- Prefer extending existing components over parallel duplicates; introduce shared primitives (theme, glass frame, gradient button, pill chip) where multiple screens reuse the same styles.
- ADR-0001 (R2 + D1) and ADR-0002 (future auth) are unaffected.

## Testing Decisions

### Proposed test seam

**Manual Consumer UI QA on iOS and Android simulators** is the single highest seam for this feature. The restyle is presentation-only; the Feed API and Handoff/Report behavior are already covered by Worker API tests. No new HTTP contracts are introduced.

Automated gates before merge:

- `expo lint`
- `tsc --noEmit`

### What makes a good test (for this feature)

- Verify **observable Consumer behavior** and visual acceptance criteria, not internal style object shapes or component hierarchy.
- Manual QA checklist is the authoritative test for layout, dark theme, masonry, sheet behavior, and transitions.
- Do not add snapshot tests or unit tests that assert on StyleSheet values — they are implementation-coupled and brittle.

### Manual QA checklist (minimum)

- Cold start shows splash, then Feed skeleton, then masonry Feed with glass frames.
- "All" chip selected by default; selecting a Tag applies gradient; tapping "All" clears filter.
- Thumbnails fade in; pull-to-refresh works; error and empty states readable on black.
- Tapping a Post fades to detail; hero image visible; sheet half-expanded with Prompt and actions.
- Post without Prompt shows empty prompt message; Save and Report still work.
- Back button returns to Feed; Copy Prompt, Save image, Report behaviors unchanged.
- Status bar and safe areas correct on iOS and Android.

### Modules tested

- **Automated:** none beyond lint and typecheck (no mobile test runner exists yet).
- **Manual:** Feed screen, Post detail screen, splash, tag filter, masonry grid, bottom sheet, Handoff actions.

### Prior art

- v1 Consumer Feed spec deferred Expo UI/integration tests (Maestro or Detox) to a later pass. Same deferral applies here unless a mobile test runner is added separately.

## Out of Scope

- Admin web page restyle
- Search, favorites, sign-in, or any Imageory features not in AIhance v1
- Film grain / noise overlay on background
- Shared-element hero animation between grid thumbnail and detail image
- Light theme or system theme toggle
- Web app styling
- New Feed API endpoints or schema changes
- Automated visual regression or component snapshot tests
- Restyle of "Open in ChatGPT" if not already present (only restyle existing Handoff buttons)

## Further Notes

- Domain vocabulary in `CONTEXT.md` applies throughout UI copy. Do not introduce Imageory terms like "gallery entry" or "caption" in place of Post or Prompt.
- Imageory reference tokens were confirmed in a grilling session; palette values should match the reference unless a future ADR revisits brand differentiation.
- If bottom sheet library installation requires a new development build, document that in the implementation issue — Expo Go may not suffice if the chosen library has native code not in Expo Go.
- After implementation, run lint and typecheck per project AGENTS.md before declaring done.
