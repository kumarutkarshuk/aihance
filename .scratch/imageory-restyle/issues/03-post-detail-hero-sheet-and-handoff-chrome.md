Status: ready-for-agent

# 03: Post detail hero, sheet, and Handoff chrome

**What to build:** A Consumer opens a Post and sees an opacity-fade transition to a full-screen hero image with a half-expanded bottom sheet showing the published date, Tags, Prompt (or "No prompt for this Post." empty state), and Handoff actions. A floating circular back button sits over the hero at the top-left (safe-area aware). Copy Prompt and Save image use gradient primary styling; Report uses plain-border secondary styling. All Handoff and Report behavior is unchanged from v1.

**Blocked by:** 01 (Theme, fonts, and app shell)

## Acceptance criteria

- [ ] Navigation from Feed to Post detail uses a simple opacity fade (no shared-element hero animation)
- [ ] Post detail hides the default stack header
- [ ] Reference image displays full-screen as the hero behind the sheet (prefer showing the full image without critical cropping)
- [ ] Bottom sheet is half-expanded by default (~50% screen height) with a drag handle; user can drag to expand or collapse
- [ ] Sheet shows published date, Tags (tappable to filter Feed), Prompt text when present, or explicit empty prompt message when absent
- [ ] Posts without a Prompt still show Save image and Report in the sheet
- [ ] Floating circular back button (plain-border style) returns to Feed; respects safe area insets
- [ ] Copy Prompt and Save image buttons use gradient-fill primary styling
- [ ] Report button uses plain-border secondary styling with destructive label color; reported/disabled states preserved
- [ ] Copy Prompt, Save image, and Report behaviors unchanged (clipboard, photo library, API report, confirmations)
- [ ] Handoff buttons remain hidden or disabled when there is no Prompt and no image URL
- [ ] Post detail works on iOS and Android
- [ ] If bottom sheet library requires a dev build, note is added in ticket comments or spec Further Notes
- [ ] `expo lint` and `tsc --noEmit` pass

## Implementation notes

- `@gorhom/bottom-sheet` v5 added for the draggable sheet. It uses `react-native-gesture-handler` and `react-native-reanimated`, both already bundled with Expo SDK 54 — **no new dev build required** beyond the existing Expo Go / dev-client setup.
