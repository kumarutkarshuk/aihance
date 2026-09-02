Status: ready-for-agent

# 01: Theme, fonts, and app shell

**What to build:** A Consumer opens the app and sees a brief branded splash (Pacifico "AIhance" on black), then lands in a dark app shell with fonts loaded, a light status bar, and no default stack headers. Shared theme tokens and reusable UI primitives (gradient pill, plain-border pill, glass frame wrapper) are in place for later tickets. Feed and Post detail remain fully functional end-to-end; they may still look plain until tickets 02 and 03 land, but nothing breaks (no white flashes, no unstyled text).

**Blocked by:** None (can start immediately)

## Acceptance criteria

- [ ] Imageory palette tokens are centralized in a shared theme module (background, foreground, muted, accent gradients, selected pill gradient, glass border)
- [ ] Pacifico and Inter (or Public Sans) load via Expo font loading; app blocks on splash until fonts are ready
- [ ] Branded splash shows on cold start (~800ms fade) with no fake progress bar, then dismisses into the app
- [ ] Status bar uses light content on dark background
- [ ] Default Expo Router stack headers are hidden on Feed and Post detail screens
- [ ] Reusable presentation primitives exist: gradient-fill pill/button, plain-border pill/button, glass frame wrapper
- [ ] Required font packages (and bottom sheet dependency if chosen upfront) are installed with Expo SDK 54–compatible versions
- [ ] Feed and Post detail screens render on dark background without broken layout or white flash
- [ ] `expo lint` and `tsc --noEmit` pass
