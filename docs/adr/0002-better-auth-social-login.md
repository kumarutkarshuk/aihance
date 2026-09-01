# better-auth with Apple and Google sign-in

Producers must sign in before posting (v1.1). Consumers browse anonymously. Auth uses better-auth with Sign in with Apple and Sign in with Google only — no email/password. Mobile-first apps lose users at password flows; social login is fast to ship with Expo and matches how people expect to sign in on iOS and Android.

**Considered options:** Email + password (higher friction, password reset overhead); magic link ( awkward on mobile); defer auth decision (blocks v1.1 Producer flow design).

**Consequences:** Producers without Apple or Google accounts cannot post. Web is deferred for v1, so browser-based auth flows are not a priority yet.
