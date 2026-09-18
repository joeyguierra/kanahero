# kanahero — distribution: store listing, not native

**Decided 2026-09-18 (creator).** Kana Hero ships to the App Store and Google Play as a
**wrapped webview** (Capacitor or equivalent), not as a React Native rewrite.

**The reason is distribution, not capability.** The installed PWA already works. What a store
listing buys is the known convention — people look an app up in the store and press Get. That is
a discovery decision, and it does not require rebuilding anything.

---

## 1. Why not native

Both routes produce a real `.ipa`/`.aab`, a store listing, reviews and auto-updates. The user
cannot tell them apart. The only difference is who draws the pixels: native uses the platform view
system, a wrapper uses the system webview full-screen with a JS bridge to native APIs.

Native is worth it for 3D at framerate, heavy background work, or inheriting platform UI
conventions. None applies here. And the cost is specific and severe: `app/globals.css` is 2,651
lines and 296 custom-property references — roughly 35% of the codebase, and the "AI made THAT?"
moat. `WritingCanvas.tsx` (Canvas 2D + `getCoalescedEvents()` + pointer capture) and
`lib/strokeAnimator.ts` (SVG dash-offset reveal, clipped) are the two most delicate things in the
app. A native port rewrites exactly the parts worth porting.

**The `lib/` layer, by contrast, ports nearly free** and should stay that way — see §5.

## 2. The one real gate: App Store Guideline 4.2 (Minimum Functionality)

Apple rejects apps that are a repackaged website. This is the most common rejection for wrapped
web apps and it is the only material risk in this plan.

**What already argues for us, from the tree:**
- **Fully offline.** `scripts/gen-sw.mjs` precaches the whole export on install. The stock 4.2
  rejection is "this is just a website"; an app that runs with no network is the strongest
  available answer.
- **No browser-like UI.** There is no routing — `app/page.tsx` is a phase switch. No URL bar, no
  back-button navigation, no page reloads, no non-persistent login.
- `display: "standalone"`, portrait-locked, maskable icons already in `app/manifest.ts`.
- The ink canvas is not something a website does.

**Three additions to be safe — all three are wanted independently:**
1. **Native camera**, replacing `<input type="file" accept="image/*">` in `Bank.tsx`. Better
   capture UX on a trip, and a direct 4.2 argument.
2. **Haptics**, at the five `// sfx:` call sites.
3. **Native share** for the export, replacing the `navigator.share` path.

**Push notifications are the usual 4.2 tiebreaker. Deliberately rejected.** A drill app that nags
is the gamified treadmill the channel's positioning exists to delete. Pass review on offline +
camera + haptics instead.

## 3. Sequencing consequence: sound before wrapper

Haptics attach at the same five call sites as the sfx (`SPEC-v5d-sound.md` §1). Building the sound
module first means the markers become `// sfx + haptic:` for free. Building the wrapper first means
touching those call sites twice.

## 4. The copy guard extends to the store listing

`paid-tier-prep.md` §5 bans "upgrade", "pro", "premium", lock icons and teased features **in the
UI**. A store listing is a second surface that can break the guard without anyone editing the app:

- the listing **description** and promotional text,
- Apple's automatic **"Offers In-App Purchases"** badge, which appears as soon as a product is
  configured in App Store Connect — before any paywall ships.

**Rule: the listing says what the app does today. No tier language, no roadmap, no IAP products
configured until the paid-tier launch conditions are met** (all three still unmet — trigger count
is 0 in the channel's `results.md`).

## 5. Standing rule, so the option stays open

**`lib/` stays DOM-free.** It nearly is already: `reveal.ts`, `joker.ts`, `joker-lines.ts`,
`kana.ts`, `session.ts` and `sets.ts` have no DOM at all, and `progress.ts` / `bank.ts` touch
storage only behind a `subscribe/get/getServer` store. That separation is what makes every future
target cheap. Do not erode it.

**One refactor worth doing early: `lib/platform.ts`** — share, save-file, pick-image/camera. The
export flow (`lib/zip.ts` + `navigator.share` + `URL.createObjectURL` + the file input) is the most
browser-specific path in the app, and it is exactly the seam a wrapper plugs into. Small now,
annoying later.

**Do NOT pre-abstract the CSS or the canvas.** That is the tempting one, and it would cost the
thing that makes the app worth shipping.

## 6. Truth-law notes for any video that covers this

- **Apple Developer Program is $99/yr; Google Play is $25 once.** Runtime stays honestly $0 — the
  app is static files with no calls — but a spoken line is *"costs nothing to run"*, never *"costs
  nothing"*.
- **Store commission is unsettled and must not be stated as a number.** The Epic injunction
  originally barred Apple from any commission on external-link purchases; in **December 2025** the
  Ninth Circuit modified it so Apple may charge a "reasonable fee", remanding to district court to
  set it. **No percentage is established.** Apple may also limit how prominently external links
  appear beside in-app purchase. Plan around standard IAP under the Small Business Program tier and
  confirm the live rate at the time; treat external-link routing as a later optimization, never a
  foundation.
- Privacy labels will be required for camera use and the photo bank. The bank is local-only
  (IndexedDB, never uploaded) — say exactly that, since it is both true and unusual.

---

## Open, not decided
- Wrapper choice: **Capacitor** (mature plugin ecosystem, the default) vs **Tauri v2 mobile**
  (smaller, newer, fewer plugins). Not urgent — nothing in §5 depends on which.
- Whether the wrapper build is its own video. It is a genuine tricky-but-trivial gap ("I'm a dev
  and I didn't know the difference between native and a wrapper"), which is the channel's stated
  subject. Route to `backlog.md` rather than deciding here.
