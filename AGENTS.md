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
- `src/App.tsx` — the entire site: data constants, `Header` state, sections
- `src/icons.tsx` — the 20 Lucide icons used, inlined
- `src/index.css` — font imports, Tailwind preflight, then the whole hand-written design
- `src/assets/` — photography and the footer logo, imported as ES modules from
  `App.tsx`
- `public/` — copied verbatim to `dist/`: `robots.txt`, `sitemap.xml`,
  `.nojekyll`, and the brand icons (`favicon-32.png`, `apple-touch-icon.png`,
  `og-image.jpg`)
- `vite.config.ts` — React + Tailwind plugins, `@` alias, GitHub Pages `base`
- `.github/workflows/deploy.yml` — build and publish to GitHub Pages on push to `main`

## Deployment

`base` in `vite.config.ts` defaults to `/LajolieClinic/` because GitHub Pages
serves project sites from a sub-path. Set `BASE_PATH=/` when moving to a custom
domain or a `<user>.github.io` repo, and update the absolute URLs in
`index.html` (canonical, OG, JSON-LD) plus `public/sitemap.xml` and
`public/robots.txt` to match.

`og:image`, `twitter:image` and the JSON-LD `logo`/`image` must stay **absolute**
URLs — crawlers do not resolve relative paths. Vite rewrites the `base` prefix
into `<link href>` but never into `<meta content>`, so those four are hand-written
and need updating alongside the canonical URL.

## Brand assets

The master logo is 808x808 (black wordmark over gold glitter). Every icon in
`public/` is derived from it with `sips`; regenerate them all if the logo
changes, and keep the footer copy small — it renders at 48px:

    sips -Z 32  master.png --out public/favicon-32.png
    sips -Z 180 master.png --out public/apple-touch-icon.png
    sips -s format jpeg -s formatOptions 90 master.png --out public/og-image.jpg
    sips -Z 144 master.png --out src/assets/logo-avatar.png

`og-image.jpg` doubles as the full-resolution master. The card is `summary`
(square) rather than `summary_large_image`, which would need a 1200x630 crop.

## Conventions

- **The design lives in `src/index.css`, not in JSX.** Every element carries a
  semantic class (`.hero-frame`, `.treatment-card--ink`, `.booking-steps`) and
  the stylesheet does the rest. Do not add Tailwind utility classes to
  components — Tailwind is here for its preflight reset only.
- Colours, rules and shadows come from the custom properties on `:root` at the
  top of `src/index.css` (`--gold`, `--ivory`, `--paper`, `--line`, …). Add a
  token there rather than hard-coding a new hex in a rule.
- `NAV_LINKS` in `src/App.tsx` is the single source of truth for nav labels and
  their anchors — the desktop header and the mobile menu both map over it.
  Don't re-derive ids from labels at a call site.
- `TREATMENT_ICONS` is positional: index N decorates `TREATMENTS[N]`. Adding a
  treatment means adding its icon at the matching index.
- Images are imported as ES modules (`import hero from './assets/…'`) so Vite
  rewrites the URL for the GitHub Pages sub-path. Never hard-code `/Images/…`;
  an absolute path silently 404s once `base` is not `/`.
- Icons take `size` and `strokeWidth` props and render `currentColor`; `fill` is
  spread last so `<Star fill="currentColor" />` works.
- The site is static: there is no backend and no form. Every call to action
  leaves for Bokadirekt (`BOKADIREKT_URL`), Instagram, `tel:` or `mailto:`.
- Layout breakpoints, in the order they appear in the stylesheet: 1120, 1060
  (nav collapses to the mobile menu), 1180/961, 960, 700.
- Mobile-first: check every layout at 390px before shipping.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` — no config file, no PostCSS. The only
theme token is `--font-sans` in the `@theme` block. Fonts (Cormorant Garamond
for display, Manrope for text) are imported from Google Fonts at the top of
`src/index.css`; CSS `@import` statements must come first.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`),
  or escape them in single-quoted strings. An unescaped apostrophe in a
  single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
