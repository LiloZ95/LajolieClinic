# La Jolie Clinic

Single-page marketing site for La Jolie Clinic (aesthetics clinic, Malmö, Sweden).
React 19 + Vite + Tailwind CSS v4. All copy is **Swedish** — keep it that way.

Deployment is GitHub Pages via GitHub Actions.

## Commands

- `pnpm dev` — dev server (port 8443, override with `PORT`)
- `pnpm build` — typecheck (`tsc --noEmit`) then `vite build` into `dist/`
- `pnpm typecheck` — types only
- `pnpm preview` — serve the production build locally
- `pnpm format` — oxfmt

## Project Structure

- `index.html` — document shell: title, meta/OG tags, favicon, JSON-LD `BeautySalon` schema
- `src/main.tsx` — React entrypoint; imports `src/index.css`, mounts `src/App.tsx`
- `src/App.tsx` — the entire site: data constants, `Masthead` menu state, sections
- `src/icons.tsx` — the 8 Lucide icons used, inlined
- `src/index.css` — font imports, Tailwind preflight, then the whole hand-written design
- `src/assets/` — photography and the logo cuts (wordmark, banner, seal),
  imported as ES modules from `App.tsx`
- `brand/` — hand-supplied logo masters; every icon and the social card derives
  from these
- `public/` — copied verbatim to `dist/`: `robots.txt`, `sitemap.xml`,
  `.nojekyll`, and the brand icons (`favicon-32.png`, `apple-touch-icon.png`,
  `og-image.jpg`)
- `vite.config.ts` — React + Tailwind plugins, `@` alias, GitHub Pages `base`
- `.github/workflows/deploy.yml` — build and publish to GitHub Pages on push to `main`

## Deployment

The site is served from the custom domain **https://lajolieclinic.se/**
(registered at GoDaddy; apex A records point at GitHub Pages, `www` is a CNAME
to `liloz95.github.io`). The domain is set in the repo's Settings → Pages, not
by a `CNAME` file — the Actions deploy ignores one.

`base` in `vite.config.ts` therefore defaults to `/`. If the domain is ever
dropped, set `BASE_PATH=/LajolieClinic/` (GitHub Pages serves project sites from
a sub-path) and update the absolute URLs in `index.html` (canonical, OG,
JSON-LD) plus `public/sitemap.xml` and `public/robots.txt` to match.

`og:image`, `twitter:image` and the JSON-LD `logo`/`image` must stay **absolute**
URLs — crawlers do not resolve relative paths. Vite rewrites the `base` prefix
into `<link href>` but never into `<meta content>`, so those four are hand-written
and need updating alongside the canonical URL.

## Brand assets

Masters live in `brand/` and are the only hand-supplied art; everything else is
derived from them with `sips`. Regenerate the whole set if a master changes.

- `brand/logo-medallion.jpg` — 1254x1254, round gold-rimmed medallion on beige.
  The circle sits at centre (621, 635) with a diameter of ~1107, so the crop
  below trims the beige surround and the result is masked `border-radius:50%`.
- `brand/logo-banner.jpg` — 1280x140, gold wordmark and swash on `#5a3e29`.

      # medallion -> hero seal (124px, round) and icons
      sips -c 1100 1100 --cropOffset 86 70 brand/logo-medallion.jpg --out /tmp/m.png
      sips -Z 260 /tmp/m.png --out /tmp/seal.png
      sips -s format jpeg -s formatOptions 88 /tmp/seal.png --out src/assets/logo-seal.jpg
      sips -Z 32  /tmp/m.png --out public/favicon-32.png
      sips -Z 180 /tmp/m.png --out public/apple-touch-icon.png

      # banner -> header wordmark (centre crop) and the full footer banner
      sips -c 140 380 --cropOffset 0 450 brand/logo-banner.jpg --out /tmp/wm.png
      sips -s format jpeg -s formatOptions 92 /tmp/wm.png --out src/assets/logo-wordmark.jpg
      cp brand/logo-banner.jpg src/assets/logo-banner.jpg

      # banner -> 1200x630 social card, padded in its own brown so it is seamless
      sips -Z 1000 brand/logo-banner.jpg --out /tmp/b.png
      sips --padToHeightWidth 630 1200 --padColor 5A3E29 /tmp/b.png --out /tmp/og.png
      sips -s format jpeg -s formatOptions 90 /tmp/og.png --out public/og-image.jpg

The card is `summary_large_image`; keep `og:image:width/height` at 1200x630 if
you re-cut it. `sips --cropOffset` is top-left based, unlike its docs.

The banner's ground is exactly `#5a3e29`, so the wordmark and banner cuts only
sit on `--mocha` (masthead, footer); anywhere else they show a visible box.
Their clipped swash ends are faded with a CSS `mask-image`, not in the file.

## Colour

Brown, beige and gold sampled from the two masters — **there is no black in the
palette and none should be added**. Tokens live on `:root` in `src/index.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--espresso` | `#2e1d12` | body text, deepest surfaces |
| `--cocoa` | `#4a2e1c` | hero, booking block, dark buttons |
| `--medallion` | `#52331e` | rating band |
| `--mocha` | `#5a3e29` | masthead and footer — the banner logo's own ground |
| `--sand` | `#f3e7d5` | page background, about and results sections |
| `--paper` | `#fffaf2` | treatments and contact sections, framed panels — surfaces only, never text |
| `--beige` | `#e7d0b0` | all light text on brown (6.5:1 on mocha) |
| `--taupe` | `#7d6a58` | muted text on paper (4.96:1); too light for sand |
| `--bark` | `#66523f` | muted text on sand (6:1) |
| `--beige-muted` | `#e7d0b0d9` | secondary text on any brown (5.2:1 on mocha) |
| `--gold` | `#b8863f` | decorative only — 2.6:1 on sand, never body text |
| `--gold-deep` | `#8a5a2e` | gold that must carry text on light |
| `--gold-light` | `#f0cc8a` | gold on brown |

`--gold` is deliberately reserved for rules, diamonds and slashes. Text that
needs to read gold on a light surface uses `--gold-deep`. `.btn--cocoa` uses
`--cocoa`, not `--espresso`: at button size the deepest brown reads as black.
`.btn--gold` (gold-light fill) only goes on brown — on sand it has no edge.

## Design language

Square corners, hairline gold rules and arches — no pill shapes, no rounded
cards, no glass blur, no drop shadows. The recurring motifs are the gold
diamond on `.kicker`, the double gold rule (`.principles`, `.booking`), the
arched hero photo with an offset gold arch, and the medallion used as a seal.
Display type is Marcellus; text is Jost in small caps for labels.

## Conventions

- **The design lives in `src/index.css`, not in JSX.** Every element carries a
  semantic class (`.opening-arch`, `.service-items`, `.booking-flow`) and
  the stylesheet does the rest. Do not add Tailwind utility classes to
  components — Tailwind is here for its preflight reset only.
- Colours, rules and shadows come from the custom properties on `:root` at the
  top of `src/index.css` (see **Colour** above). Add a token there rather than
  hard-coding a new hex in a rule.
- `NAV_LINKS` in `src/App.tsx` is the single source of truth for nav labels and
  their anchors — the masthead, mobile menu and footer all map over it. Keep
  its order in step with the section order. Don't re-derive ids from labels.
- `TREATMENTS` drives the numbered list in `#behandlingar`; the numbers come
  from the array index, so reordering renumbers automatically.
- Images are imported as ES modules (`import hero from './assets/…'`) so Vite
  rewrites the URL for the GitHub Pages sub-path. Never hard-code `/Images/…`;
  an absolute path silently 404s once `base` is not `/`.
- Icons take `size` and `strokeWidth` props and render `currentColor`; `fill` is
  spread last so `<Star fill="currentColor" />` works.
- The site is static: there is no backend and no form. Every call to action
  leaves for Bokadirekt (`BOKADIREKT_URL`), Instagram, `tel:` or `mailto:`.
- Layout breakpoints, in the order they appear in the stylesheet: 1060 (nav
  collapses to the mobile menu, treatments stack), 960 (hero and about stack),
  700 (phone). The menu's resize handler in `Masthead` must match 1060.
- Mobile-first: check every layout at 390px before shipping.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` — no config file, no PostCSS. The only
theme token is `--font-sans` in the `@theme` block. Fonts (Marcellus for
display, Jost for text; `--font-display` / `--font-text` on `:root`) are
imported from Google Fonts at the top of `src/index.css`; CSS `@import`
statements must come first.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`),
  or escape them in single-quoted strings. An unescaped apostrophe in a
  single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
