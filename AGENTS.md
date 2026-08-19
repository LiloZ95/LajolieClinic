# La Jolie Clinic

Single-page marketing site for La Jolie Clinic (aesthetics clinic, Malmö, Sweden).
React 19 + Vite + Tailwind CSS v4. All copy is **Swedish** — keep it that way.

Originally exported from Figma Make; the Figma platform files (`.figma/`, the
Figma Vite plugins, the reference screenshots in `src/imports/`) have been
removed. Deployment is GitHub Pages via GitHub Actions.

## Commands

- `pnpm dev` — dev server (port 8443, override with `PORT`)
- `pnpm build` — typecheck (`tsc --noEmit`) then `vite build` into `dist/`
- `pnpm typecheck` — types only
- `pnpm preview` — serve the production build locally
- `pnpm format` — oxfmt

## Project Structure

- `index.html` — document shell: title, meta/OG tags, favicon, JSON-LD `BeautySalon` schema
- `src/main.tsx` — React entrypoint; imports `src/index.css`, mounts `src/App.tsx`
- `src/App.tsx` — the entire site: data constants, hooks, sections, icons
- `src/index.css` — Tailwind import, `@theme` tokens, marquee keyframes, reduced-motion rules
- `public/` — copied verbatim to `dist/`: `robots.txt`, `sitemap.xml`, `.nojekyll`
- `vite.config.ts` — React + Tailwind plugins, `@` alias, GitHub Pages `base`
- `.github/workflows/deploy.yml` — build and publish to GitHub Pages on push to `main`

## Deployment

`base` in `vite.config.ts` defaults to `/LajolieClinic/` because GitHub Pages
serves project sites from a sub-path. Set `BASE_PATH=/` when moving to a custom
domain or a `<user>.github.io` repo, and update the absolute URLs in
`index.html` (canonical, OG, JSON-LD) plus `public/sitemap.xml` and
`public/robots.txt` to match.

## Conventions

- `SECTIONS` in `src/App.tsx` is the single source of truth for nav ids and
  labels — the header, mobile menu, footer and scroll-spy dots all derive from
  it. Don't re-derive ids from labels at a call site.
- The site is static: there is no backend. The contact form opens a `mailto:`
  link; `CONTACT_EMAIL` at the top of `App.tsx` is a placeholder to replace.
- Marquees use the `Marquee` component: two identical groups, each carrying its
  own trailing gap, so `translateX(-50%)` is seam-free. Don't put the gap
  between the groups.
- Mobile-first: check every layout at 390px before shipping.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` — no config file, no PostCSS. Theme
tokens live in the `@theme` block in `src/index.css`. Fonts (Lora, DM Sans) are
imported at the top of that file; CSS `@import` statements must come first.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`),
  or escape them in single-quoted strings. An unescaped apostrophe in a
  single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
