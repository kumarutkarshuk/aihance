# better-auth with Apple and Google sign-in

From v1+ onward, Consumers and Producers sign in before using the app (v1.1 adds Producer posting; v1 stays anonymous for browse, Handoff, and Report). Auth uses better-auth with Sign in with Apple and Sign in with Google only — no email/password. Mobile-first apps lose users at password flows; social login is fast to ship with Expo and matches how people expect to sign in on iOS and Android.

**Considered options:** Email + password (higher friction, password reset overhead); magic link ( awkward on mobile); defer auth decision (blocks v1.1 Producer flow design); keep Consumers anonymous after v1 (weakens Report and other per-user actions).

**Consequences:** Users without Apple or Google accounts cannot use the app after v1. Per-user actions (e.g. Report) move from client-supplied ids to authenticated users. Web is deferred for v1, so browser-based auth flows are not a priority yet.
