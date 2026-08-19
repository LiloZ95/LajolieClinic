import { useState, useEffect, useRef, useMemo, useCallback, type FormEvent } from 'react'

// ─── Config ──────────────────────────────────────────────────────────────────

// TODO: replace with the clinic's real inbox. The contact form builds a
// `mailto:` link — there is no server on GitHub Pages to POST to.
const CONTACT_EMAIL = 'info@lajolieclinic.se'
const PHONE = '0760-698131'
const PHONE_E164 = '+46760698131'
const INSTAGRAM = 'https://www.instagram.com/lajolieclinic/'
// Direct booking page for the clinic. The link as shared carried
// `utm_source=ig&utm_medium=social&utm_content=link_in_bio` plus an `fbclid`
// — those belong on the Instagram bio link. Left on the website they would
// report every booking made here as Instagram traffic, so they are stripped.
const BOKADIREKT = 'https://www.bokadirekt.se/places/la-jolie-clinic-37459'
const MAPS_URL = 'https://maps.google.com/?q=Derbyv%C3%A4gen+30,+212+35+Malm%C3%B6'

// Single source of truth for every navigation surface: the header, the mobile
// menu, the footer and the scroll-spy dots. Deriving ids from labels at each
// call site is what let `Om oss` (id `om-oss`) silently never highlight.
const SECTIONS = [
  { id: 'hem', label: 'Hem' },
  { id: 'om-oss', label: 'Om oss' },
  { id: 'behandlingar', label: 'Behandlingar' },
  { id: 'galleri', label: 'Galleri' },
  { id: 'omdomen', label: 'Omdömen' },
  { id: 'kontakt', label: 'Kontakt' },
] as const

// ─── Data ────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  '💛 Gratis digital konsultation',
  '⭐ 4.9 av 5 på Bokadirekt',
  '💬 Över 1 900 omdömen',
  '💉 Legitimerad sjuksköterska',
  '📍 Malmö, Derbyvägen 30',
  '✨ Skräddarsydda behandlingar',
]

const TREATMENTS = [
  { icon: '💉', name: 'Botox', sub: 'Naturliga resultat med botoxinjektioner för rynkor och spänningar.', count: 20 },
  { icon: '💋', name: 'Fillers', sub: 'Volym, konturer och läppar med marknadens bästa fillers.', count: 15 },
  { icon: '✨', name: 'Skinboosters', sub: 'Intensiv återfuktning och hudföryngring inifrån.', count: 18 },
  { icon: '🔬', name: 'Microneedling', sub: 'Stimulera hudens naturliga kollagenproduktion.', count: 8 },
  { icon: '🌿', name: 'Ansiktsbehandlingar & Hudvård', sub: 'Glödande hy med avancerade ansiktsbehandlingar.', count: 14 },
  { icon: '🩸', name: 'PRP & Sculptra', sub: 'Regenerativa behandlingar med kroppens egna resurser.', count: 8 },
  { icon: '🧵', name: 'Trådlyft', sub: 'Lyft och strama upp utan kirurgi med PDO-trådar.', count: 12 },
  { icon: '⚡', name: 'Plasma Pen', sub: 'Icke-kirurgisk hudåtstramning och lyft med plasma.', count: 7 },
  { icon: '🌟', name: 'Laser / Permanent hårborttagning', sub: 'Effektiv och skonsam permanent hårborttagning med laser.', count: 13 },
  { icon: '💪', name: 'Fettreducering & Kavitation', sub: 'Effektiv behandling mot fettansamlingar och celluliter.', count: 9 },
  { icon: '🍑', name: 'Kroppsfillers / Buttlift', sub: 'Naturliga kurvor och volym med säkra kroppsfillers.', count: 8 },
  { icon: '👁️', name: 'Fransar & Bryn', sub: 'Perfekta fransar och välformade ögonbryn.', count: 13 },
  { icon: '💊', name: 'Vitamindropp & Wellness', sub: 'Intravenösa vitamindroppar och välmående behandlingar.', count: 8 },
  { icon: '🌸', name: 'Intima behandlingar', sub: 'Diskreta och professionella intima behandlingar.', count: 5 },
]

const QUIZ_QUESTIONS = [
  {
    q: 'Vad är ditt huvudsakliga mål?',
    opts: ['Fräscha upp huden', 'Minska rynkor', 'Mer volym & konturer', 'Hårborttagning', 'Kroppsbehandling', 'Fransar & bryn'],
  },
  {
    q: 'Vilket område vill du behandla?',
    opts: ['Ansikte', 'Läppar', 'Kropp', 'Ögon & bryn', 'Hud & porer'],
  },
  {
    q: 'Hur viktigt är återhämtningstiden för dig?',
    opts: ['Minimal — tillbaka direkt', 'Några dagar är ok', 'Spelar ingen roll för rätt resultat'],
  },
  {
    q: 'Har du behandlat dig estetiskt tidigare?',
    opts: ['Nej, första gången', 'Ja, ett par gånger', 'Ja, regelbundet'],
  },
  {
    q: 'Vad passar din budget bäst?',
    opts: ['Under 2 000 kr', '2 000 – 5 000 kr', 'Över 5 000 kr', 'Flexibelt, beroende på behandling'],
  },
]

// One weighted map per question. The guide used to key off answer 1 alone,
// which made questions 2–5 decorative — the same three cards came back no
// matter what you picked. Weight descends with question order so the stated
// goal still dominates.
const QUIZ_WEIGHTS: Array<{ weight: number; map: Record<string, string[]> }> = [
  {
    weight: 6,
    map: {
      'Fräscha upp huden': ['Skinboosters', 'Microneedling', 'Ansiktsbehandlingar & Hudvård'],
      'Minska rynkor': ['Botox', 'Trådlyft', 'PRP & Sculptra'],
      'Mer volym & konturer': ['Fillers', 'Kroppsfillers / Buttlift', 'PRP & Sculptra'],
      'Hårborttagning': ['Laser / Permanent hårborttagning'],
      'Kroppsbehandling': ['Fettreducering & Kavitation', 'Kroppsfillers / Buttlift', 'Intima behandlingar'],
      'Fransar & bryn': ['Fransar & Bryn'],
    },
  },
  {
    weight: 4,
    map: {
      'Ansikte': ['Botox', 'Fillers', 'Skinboosters', 'Trådlyft', 'Plasma Pen', 'Ansiktsbehandlingar & Hudvård'],
      'Läppar': ['Fillers', 'Skinboosters'],
      'Kropp': ['Fettreducering & Kavitation', 'Kroppsfillers / Buttlift', 'Laser / Permanent hårborttagning', 'Intima behandlingar'],
      'Ögon & bryn': ['Fransar & Bryn', 'Plasma Pen', 'Botox'],
      'Hud & porer': ['Microneedling', 'Skinboosters', 'Ansiktsbehandlingar & Hudvård', 'PRP & Sculptra'],
    },
  },
  {
    weight: 2,
    map: {
      'Minimal — tillbaka direkt': ['Botox', 'Skinboosters', 'Ansiktsbehandlingar & Hudvård', 'Fransar & Bryn', 'Laser / Permanent hårborttagning', 'Vitamindropp & Wellness'],
      'Några dagar är ok': ['Fillers', 'Microneedling', 'PRP & Sculptra', 'Kroppsfillers / Buttlift'],
      'Spelar ingen roll för rätt resultat': ['Trådlyft', 'Plasma Pen', 'Fettreducering & Kavitation', 'Intima behandlingar'],
    },
  },
  {
    weight: 2,
    map: {
      'Nej, första gången': ['Ansiktsbehandlingar & Hudvård', 'Skinboosters', 'Microneedling', 'Fransar & Bryn'],
      'Ja, ett par gånger': ['Botox', 'Fillers', 'Laser / Permanent hårborttagning'],
      'Ja, regelbundet': ['Trådlyft', 'PRP & Sculptra', 'Plasma Pen', 'Kroppsfillers / Buttlift'],
    },
  },
  {
    weight: 1,
    map: {
      'Under 2 000 kr': ['Ansiktsbehandlingar & Hudvård', 'Fransar & Bryn', 'Microneedling', 'Vitamindropp & Wellness'],
      '2 000 – 5 000 kr': ['Botox', 'Fillers', 'Skinboosters', 'Laser / Permanent hårborttagning'],
      'Över 5 000 kr': ['Trådlyft', 'PRP & Sculptra', 'Kroppsfillers / Buttlift', 'Fettreducering & Kavitation'],
      'Flexibelt, beroende på behandling': [],
    },
  },
]

function recommendTreatments(answers: string[]): string[] {
  const scores = new Map<string, number>()

  answers.forEach((answer, i) => {
    const question = QUIZ_WEIGHTS[i]
    if (!question) return
    for (const name of question.map[answer] ?? []) {
      scores.set(name, (scores.get(name) ?? 0) + question.weight)
    }
  })

  const ranked = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)

  return ranked.length > 0 ? ranked : ['Fillers', 'Botox', 'Skinboosters']
}

// ── Före/Efter ───────────────────────────────────────────────────────────────
// `placeholder: true` renders a visible "Exempelbild" chip and is the switch
// that keeps stock photography from being presented as a real patient result —
// which for an aesthetics clinic is misleading marketing, not just a to-do.
// Swap in real, consented photographs and delete the flag.
type BeforeAfterCase = {
  treatment: string
  caption: string
  before: string
  after: string
  placeholder?: boolean
}

const BA = (id: string, before: boolean) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=1100&fit=crop&auto=format${before ? '&sat=-45&bri=-10' : ''}`

const BEFORE_AFTER_CASES: BeforeAfterCase[] = [
  {
    treatment: 'Läppfillers',
    caption: 'PLATSHÅLLARE — beskriv behandlingen, mängd och tid till resultat.',
    before: BA('1785861084191-3600dfc2a6d6', true),
    after: BA('1785861084191-3600dfc2a6d6', false),
    placeholder: true,
  },
  {
    treatment: 'Trådlyft',
    caption: 'PLATSHÅLLARE — beskriv behandlingen, mängd och tid till resultat.',
    before: BA('1761819922656-d1b77eef49c0', true),
    after: BA('1761819922656-d1b77eef49c0', false),
    placeholder: true,
  },
  {
    treatment: 'Skinboosters',
    caption: 'PLATSHÅLLARE — beskriv behandlingen, mängd och tid till resultat.',
    before: BA('1782159981479-0fafb56d3cd6', true),
    after: BA('1782159981479-0fafb56d3cd6', false),
    placeholder: true,
  },
  {
    treatment: 'Fransar & Bryn',
    caption: 'PLATSHÅLLARE — beskriv behandlingen, mängd och tid till resultat.',
    before: BA('1785860945533-918a531bcdeb', true),
    after: BA('1785860945533-918a531bcdeb', false),
    placeholder: true,
  },
]

// ── Omdömen ──────────────────────────────────────────────────────────────────
// Deliberately NOT plausible-looking invented testimonials: text that reads as
// a real review would ship as a fake one the moment someone forgets to swap it.
// Copy real omdömen from the Bokadirekt page (check their terms on reposting
// first) and keep the aggregate below in sync with what Bokadirekt shows.
const REVIEWS = [
  { name: 'Förnamn E.', treatment: 'Läppfillers', rating: 5, date: '2026-07-12' },
  { name: 'Förnamn E.', treatment: 'Botox', rating: 5, date: '2026-06-28' },
  { name: 'Förnamn E.', treatment: 'Skinboosters', rating: 5, date: '2026-06-14' },
  { name: 'Förnamn E.', treatment: 'Trådlyft', rating: 5, date: '2026-05-30' },
  { name: 'Förnamn E.', treatment: 'Laser', rating: 4, date: '2026-05-19' },
  { name: 'Förnamn E.', treatment: 'Fransar & Bryn', rating: 5, date: '2026-05-02' },
].map((r) => ({
  ...r,
  text: 'PLATSHÅLLARE — klistra in ett riktigt omdöme från Bokadirekt här. Den här texten har ungefär samma längd som ett typiskt omdöme så att layouten stämmer.',
  placeholder: true,
}))

const RATING_AVG = 4.9
const RATING_COUNT = 1918

const GALLERY_ROW1 = [
  { url: 'https://images.unsplash.com/photo-1785861084191-3600dfc2a6d6?w=480&h=480&fit=crop&auto=format', alt: 'Estetisk injektionsbehandling' },
  { url: 'https://images.unsplash.com/photo-1785861001619-b263ebd4e615?w=480&h=480&fit=crop&auto=format', alt: 'Konsultation på kliniken' },
  { url: 'https://images.unsplash.com/photo-1761819922656-d1b77eef49c0?w=480&h=480&fit=crop&auto=format', alt: 'Trådlyft behandling' },
  { url: 'https://images.unsplash.com/photo-1785860945533-918a531bcdeb?w=480&h=480&fit=crop&auto=format', alt: 'Ögonbrynsbehandling' },
  { url: 'https://images.unsplash.com/photo-1782159981479-0fafb56d3cd6?w=480&h=480&fit=crop&auto=format', alt: 'Ansiktsbehandling' },
]

const GALLERY_ROW2 = [
  { url: 'https://images.unsplash.com/photo-1782159981435-78545e10428a?w=480&h=480&fit=crop&auto=format', alt: 'Hudvårdsbehandling' },
  { url: 'https://images.unsplash.com/photo-1785861485926-93a13556d656?w=480&h=480&fit=crop&auto=format', alt: 'Injektionsbehandling' },
  { url: 'https://images.unsplash.com/photo-1785860855601-58107d722164?w=480&h=480&fit=crop&auto=format', alt: 'Resultat efter behandling' },
  { url: 'https://images.unsplash.com/photo-1782159981439-b99dfb84f4b8?w=480&h=480&fit=crop&auto=format', alt: 'Ansiktsmask' },
  { url: 'https://images.unsplash.com/photo-1785861084191-3600dfc2a6d6?w=480&h=480&fit=crop&auto=format&sat=-20', alt: 'Klinikbehandling' },
]

// ─── Hooks ───────────────────────────────────────────────────────────────────

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/** Highlights whichever section sits closest to the middle of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id)
    let frame = 0

    const measure = () => {
      frame = 0
      const midY = window.innerHeight / 2
      let closest = ids[0]
      let closestDist = Infinity
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const dist = Math.abs(rect.top + rect.height / 2 - midY)
        if (dist < closestDist) {
          closestDist = dist
          closest = id
        }
      }
      setActive(closest)
    }

    // Reading layout on every scroll event forces a synchronous reflow per
    // frame; coalescing into one rAF keeps scrolling smooth on mobile.
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    measure()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return active
}

/**
 * True once the element has scrolled into view — used to stagger reveals.
 *
 * Fails open. These sections start at `opacity: 0`, so anything that stops the
 * observer from reporting leaves a permanently blank section rather than an
 * un-animated one. Content already on screen reveals synchronously, and a
 * scroll listener backs the observer up, so the worst case is a missing
 * animation instead of missing content.
 */
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const inViewport = () => {
      const r = el.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    }

    if (typeof IntersectionObserver === 'undefined' || inViewport()) {
      setVisible(true)
      return
    }

    let obs: IntersectionObserver | null = null

    const reveal = () => {
      setVisible(true)
      obs?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    const onScroll = () => {
      if (inViewport()) reveal()
    }

    obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal()
      },
      { threshold }
    )
    obs.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      obs?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [threshold])

  return [ref, visible] as const
}

// ─── Components ──────────────────────────────────────────────────────────────

function StarRating({ count = 5, size = 'sm' }: { count?: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'text-lg' : 'text-sm'
  return (
    <span className={`text-[#c49068] ${sz}`} aria-hidden="true">
      {'★'.repeat(count)}
    </span>
  )
}

/**
 * Two identical groups, each carrying its own trailing gap, so translating
 * -50% lands exactly one group over and the seam is invisible.
 */
function Marquee({
  direction,
  duration,
  gapClass,
  children,
  className = '',
}: {
  direction: 'left' | 'right'
  duration: string
  gapClass: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`marquee-viewport overflow-hidden ${className}`}>
      <div
        className={`marquee-track ${direction === 'left' ? 'marquee-left' : 'marquee-right'}`}
        style={{ '--marquee-duration': duration } as React.CSSProperties}
      >
        <div className={`flex shrink-0 ${gapClass}`}>{children}</div>
        <div className={`flex shrink-0 ${gapClass}`} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

function Ticker() {
  return (
    <Marquee direction="left" duration="34s" gapClass="gap-12 pe-12" className="bg-[#c49068] py-2.5">
      {TICKER_ITEMS.map((item) => (
        <span
          key={item}
          className="text-white text-sm font-medium tracking-wide inline-flex items-center gap-2 whitespace-nowrap"
        >
          {item}
        </span>
      ))}
    </Marquee>
  )
}

function Nav({ activeSection }: { activeSection: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = useCallback((id: string) => {
    scrollToSection(id)
    setMenuOpen(false)
  }, [])

  // A menu left open while the viewport grows past `md` stays mounted but
  // hidden, so the next shrink reveals it unexpectedly. Close on both.
  useEffect(() => {
    if (!menuOpen) return
    const onResize = () => setMenuOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <nav className="sticky top-0 z-50 bg-[#faf0e8]/95 backdrop-blur-sm border-b border-[rgba(196,144,104,0.15)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <a
          href="#hem"
          onClick={(e) => {
            e.preventDefault()
            go('hem')
          }}
          className="flex flex-col leading-tight"
        >
          <span className="font-serif text-xl font-semibold text-[#1c1710] tracking-wide" style={{ fontFamily: 'Lora, serif' }}>
            La Jolie
          </span>
          <span className="text-[0.6rem] tracking-[0.2em] text-[#9c8878] uppercase font-medium">Clinic</span>
        </a>

        <div className="hidden md:flex items-center gap-5 lg:gap-8">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              aria-current={activeSection === s.id ? 'true' : undefined}
              className={`text-sm font-medium transition-colors ${
                activeSection === s.id ? 'text-[#c49068]' : 'text-[#6b5c4e] hover:text-[#1c1710]'
              }`}
            >
              {s.label}
            </button>
          ))}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6b5c4e] hover:text-[#c49068] transition-colors"
            aria-label="La Jolie Clinic på Instagram"
          >
            <InstagramIcon />
          </a>
        </div>

        {/* Booking is the whole point of the site, so the CTA stays in the
            header at every breakpoint — on mobile it sits beside the burger
            rather than hiding inside the menu. */}
        <div className="flex items-center gap-1">
          <a
            href={BOKADIREKT}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#c49068] hover:bg-[#a87650] text-white font-medium text-sm px-4 sm:px-5 py-2 rounded-full transition-colors shadow-sm whitespace-nowrap md:ms-2"
          >
            Boka tid
          </a>

          <button
            className="md:hidden text-[#1c1710] p-2 -me-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Stäng meny' : 'Öppna meny'}
            aria-expanded={menuOpen}
            aria-controls="mobil-meny"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className={`block h-px bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobil-meny"
          className="md:hidden bg-[#faf0e8] border-t border-[rgba(196,144,104,0.15)] px-5 py-4 flex flex-col gap-1"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              aria-current={activeSection === s.id ? 'true' : undefined}
              className={`text-left text-sm font-medium py-2.5 transition-colors ${
                activeSection === s.id ? 'text-[#c49068]' : 'text-[#6b5c4e] hover:text-[#c49068]'
              }`}
            >
              {s.label}
            </button>
          ))}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6b5c4e] py-2.5"
          >
            <InstagramIcon />
            @lajolieclinic
          </a>
        </div>
      )}
    </nav>
  )
}

function HeroSection() {
  return (
    <section
      id="hem"
      className="min-h-[85svh] flex flex-col items-center justify-center text-center px-5 sm:px-6 py-20 sm:py-24 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #e8c9a8 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto w-full">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-white rounded-full px-4 py-2 shadow-sm border border-[rgba(196,144,104,0.2)] mb-10">
          <StarRating />
          <span className="text-sm font-medium text-[#1c1710]">{RATING_AVG.toLocaleString('sv-SE')}</span>
          <span className="text-sm text-[#9c8878]">/ {RATING_COUNT.toLocaleString('sv-SE')} omdömen</span>
          <span className="hidden sm:block w-px h-4 bg-[rgba(196,144,104,0.3)]" />
          <span className="text-sm text-[#c49068] font-medium">Bokadirekt</span>
        </div>

        <h1
          className="font-serif text-[2.6rem] leading-[1.08] sm:text-6xl md:text-7xl font-semibold text-[#1c1710] mb-6 text-balance"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Din skönhet,{' '}
          <span className="italic text-[#c49068]">vår</span>
          <br />
          <span className="italic text-[#c49068]">passion</span>
        </h1>

        <p className="text-[#6b5c4e] text-base sm:text-lg leading-relaxed mb-10 max-w-md text-pretty">
          Legitimerad sjuksköterska & utbildad undersköterska. Estetiska behandlingar skräddarsydda efter ditt önskemål.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto max-w-xs sm:max-w-none">
          {/* Booking now leads: it is the conversion, and it is the one action
              that leaves the site. Browsing treatments is the secondary path. */}
          <a
            href={BOKADIREKT}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#c49068] hover:bg-[#a87650] text-white font-medium px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm tracking-wide text-center"
          >
            Boka tid på Bokadirekt
          </a>
          <button
            onClick={() => scrollToSection('behandlingar')}
            className="border border-[rgba(196,144,104,0.4)] text-[#6b5c4e] hover:text-[#c49068] hover:border-[#c49068] font-medium px-8 py-3.5 rounded-full transition-colors text-sm tracking-wide"
          >
            Utforska behandlingar
          </button>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 text-sm text-[#9c8878]">
          <li>● Legitimerad sjuksköterska</li>
          <li>● Malmö, Derbyvägen 30</li>
          <li>● Gratis digital konsultation</li>
        </ul>

        <div className="mt-14 sm:mt-16 w-full max-w-sm">
          <div className="bg-[#1c1710] rounded-2xl overflow-hidden shadow-xl aspect-[4/3] flex items-center justify-center">
            <span
              className="font-serif italic text-4xl text-white/90 select-none"
              style={{ fontFamily: 'Lora, serif', letterSpacing: '0.02em' }}
            >
              La Jolie
            </span>
          </div>
          <p className="text-xs text-[#c49068] tracking-widest uppercase mt-3 font-medium">Clinic</p>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  const images = [
    { url: 'https://images.unsplash.com/photo-1785861084191-3600dfc2a6d6?w=400&h=400&fit=crop&auto=format', alt: 'Läppbehandling resultat' },
    { url: 'https://images.unsplash.com/photo-1785861001619-b263ebd4e615?w=400&h=400&fit=crop&auto=format', alt: 'Konsultation' },
    { url: 'https://images.unsplash.com/photo-1782159981479-0fafb56d3cd6?w=400&h=400&fit=crop&auto=format', alt: 'Ansiktsbehandling' },
    { url: 'https://images.unsplash.com/photo-1761819922656-d1b77eef49c0?w=400&h=400&fit=crop&auto=format', alt: 'Trådlyft' },
  ]

  return (
    <section id="om-oss" className="py-20 sm:py-24 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Om Kliniken</p>
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-12 sm:mb-16"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Vi är La Jolie Clinic
        </h2>

        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            {images.map((img) => (
              <div key={img.url} className="aspect-square overflow-hidden bg-[#e8d5c4]">
                <img
                  src={img.url}
                  alt={img.alt}
                  width={400}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-[#6b5c4e] leading-relaxed text-base">
              Vi är två utbildade systrar —{' '}
              <strong className="text-[#1c1710] font-semibold">Bouchra</strong>, legitimerad sjuksköterska, och{' '}
              <strong className="text-[#1c1710] font-semibold">Raiana</strong>, undersköterska — som brinner för estetisk
              behandling med omtanke och precision.
            </p>
            <p className="text-[#6b5c4e] leading-relaxed text-base">
              Vår klinik erbjuder ett brett utbud av behandlingar, alltid skräddarsydda efter just ditt önskemål och behov.
              Välkommen till en plats där du sätts i centrum.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { val: '1 900+', label: 'Nöjda kunder' },
                { val: '4.9 ★', label: 'Snittbetyg' },
                { val: '13+', label: 'Behandlingskategorier' },
                { val: '100%', label: 'Skräddarsytt' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#faf0e8] border border-[rgba(196,144,104,0.15)] rounded-xl p-4">
                  <p className="font-serif text-2xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>
                    {stat.val}
                  </p>
                  <p className="text-xs text-[#9c8878] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-3 bg-white border border-[rgba(196,144,104,0.2)] rounded-xl px-4 py-3 mt-2 w-fit">
              <StarRating size="lg" />
              <div>
                <p className="font-semibold text-[#1c1710] text-sm">4.9 / 5</p>
                <p className="text-xs text-[#9c8878]">Över 1 900 omdömen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const team = [
    {
      name: 'Bouchra Itani',
      title: 'Leg. Sjuksköterska',
      rating: 4.9,
      reviews: 1362,
      bio: 'Bouchra är klinikens grundare och legitimerade sjuksköterska. Hon specialiserar sig på fillers, botox, trådlyft, skinboosters och avancerade injektionsbehandlingar. Med noggrannhet och ett estetiskt öga skapar hon naturliga resultat.',
      tags: ['Fillers', 'Botox', 'Trådlyft', 'Skinboosters', 'Injektioner'],
    },
    {
      name: 'Raiana Itani',
      title: 'Undersköterska',
      rating: 4.9,
      reviews: 556,
      bio: 'Raiana är utbildad undersköterska och specialiserar sig på hudvård, fransar, laser och ansiktsbehandlingar. Hon är känd för sin varma personlighet och sina noggranna behandlingar.',
      tags: ['Hudvård', 'Fransar', 'Laser', 'Ansiktsbehandlingar'],
    },
  ]

  return (
    <section className="py-16 px-5 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-12"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Möt teamet
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {team.map((member) => (
            <div key={member.name} className="border border-[rgba(196,144,104,0.2)] rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <StarRating />
                <span className="text-sm font-medium text-[#1c1710]">{member.rating}</span>
                <span className="text-xs text-[#9c8878]">({member.reviews.toLocaleString('sv-SE')} omdömen)</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>
                {member.name}
              </h3>
              <p className="text-[#c49068] text-xs tracking-widest uppercase font-medium mt-1 mb-3">{member.title}</p>
              <p className="text-[#6b5c4e] text-sm leading-relaxed mb-4">{member.bio}</p>
              <div className="flex flex-wrap gap-2">
                {member.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#faf0e8] border border-[rgba(196,144,104,0.2)] rounded-full px-3 py-1 text-[#6b5c4e]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TreatmentsSection() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TREATMENTS
    return TREATMENTS.filter((t) => t.name.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q))
  }, [search])

  return (
    <section id="behandlingar" className="py-20 sm:py-24 px-5 sm:px-6 bg-[#faf0e8]">
      <div className="max-w-5xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Våra tjänster</p>
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-4"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Behandlingar
        </h2>
        <p className="text-[#6b5c4e] text-center text-base mb-10">
          Utforska våra behandlingskategorier — tryck på en kategori för att läsa mer.
        </p>

        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8878] pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Sök behandling..."
              aria-label="Sök behandling"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[rgba(196,144,104,0.2)] rounded-full py-3 pe-4 ps-11 text-sm text-[#1c1710] placeholder:text-[#9c8878] focus:outline-none focus:ring-2 focus:ring-[#c49068]/40"
            />
          </div>
        </div>

        {/* `items-start` keeps the siblings of an expanded card at their own
            height instead of stretching the whole grid row. */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
          {filtered.map((t) => {
            const isOpen = open === t.name
            const panelId = `behandling-${t.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
            return (
              <div key={t.name} className="bg-white border border-[rgba(196,144,104,0.15)] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#faf0e8]/50 transition-colors"
                  onClick={() => setOpen(isOpen ? null : t.name)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0" aria-hidden="true">
                      {t.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-[#1c1710] text-sm">{t.name}</span>
                      <span className="block text-xs text-[#c49068] mt-0.5">{t.count} behandlingar</span>
                    </span>
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>
                {isOpen && (
                  <div id={panelId} className="px-5 pb-4 border-t border-[rgba(196,144,104,0.1)]">
                    <p className="text-sm text-[#6b5c4e] leading-relaxed pt-3">{t.sub}</p>
                    <a
                      href={BOKADIREKT}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs font-medium text-[#c49068] hover:text-[#a87650] transition-colors"
                    >
                      Boka nu →
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[#9c8878] py-12" role="status">
            Inga behandlingar matchade din sökning.
          </p>
        )}
      </div>
    </section>
  )
}

function TreatmentGuide() {
  const [answers, setAnswers] = useState<string[]>([])
  const step = answers.length
  const done = step >= QUIZ_QUESTIONS.length

  const pick = (opt: string) => setAnswers([...answers, opt])
  const back = () => setAnswers(answers.slice(0, -1))
  const restart = () => setAnswers([])

  const recommendations = done ? recommendTreatments(answers) : []
  const current = QUIZ_QUESTIONS[Math.min(step, QUIZ_QUESTIONS.length - 1)]

  return (
    <section className="py-20 sm:py-24 px-5 sm:px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Hitta rätt behandling</p>
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-4"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Behandlingsguide
        </h2>
        <p className="text-[#6b5c4e] text-center mb-12">
          Svara på {QUIZ_QUESTIONS.length} snabba frågor så hittar vi rätt behandling för dig.
        </p>

        <div className="bg-[#faf0e8] border border-[rgba(196,144,104,0.15)] rounded-2xl p-6 sm:p-8">
          {!done ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#9c8878]">
                  Fråga {step + 1} av {QUIZ_QUESTIONS.length}
                </p>
                {step > 0 && (
                  <button onClick={back} className="text-xs font-medium text-[#c49068] hover:text-[#a87650] transition-colors">
                    ← Tillbaka
                  </button>
                )}
              </div>
              <div
                className="w-full bg-[rgba(196,144,104,0.15)] rounded-full h-1 mb-6"
                role="progressbar"
                aria-valuenow={step + 1}
                aria-valuemin={1}
                aria-valuemax={QUIZ_QUESTIONS.length}
                aria-label="Framsteg i behandlingsguiden"
              >
                <div
                  className="bg-[#c49068] h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1c1710] mb-6" style={{ fontFamily: 'Lora, serif' }}>
                {current.q}
              </h3>
              {/* One column on phones: two 160px columns cut off answers like
                  "Spelar ingen roll för rätt resultat". */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pick(opt)}
                    className="bg-white border border-[rgba(196,144,104,0.2)] rounded-xl px-4 py-3 text-sm text-[#1c1710] hover:border-[#c49068] hover:bg-[#c49068]/5 transition-all text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-[#c49068] text-xs tracking-widest uppercase font-medium mb-3">Vi rekommenderar</p>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1c1710] mb-6" style={{ fontFamily: 'Lora, serif' }}>
                Dina bästa alternativ
              </h3>
              <div className="flex flex-col gap-3 mb-8">
                {recommendations.map((r) => {
                  const t = TREATMENTS.find((x) => x.name === r)
                  return (
                    <div key={r} className="bg-white border border-[rgba(196,144,104,0.2)] rounded-xl px-4 py-3 flex items-center gap-3 text-left">
                      <span className="text-xl shrink-0" aria-hidden="true">
                        {t?.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-[#1c1710]">{r}</span>
                        {t && <span className="block text-xs text-[#9c8878] mt-0.5">{t.sub}</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => scrollToSection('kontakt')}
                  className="bg-[#c49068] hover:bg-[#a87650] text-white font-medium px-6 py-2.5 rounded-full text-sm transition-colors"
                >
                  Boka konsultation
                </button>
                <button
                  onClick={restart}
                  className="border border-[rgba(196,144,104,0.3)] text-[#6b5c4e] px-6 py-2.5 rounded-full text-sm hover:border-[#c49068] transition-colors"
                >
                  Börja om
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Före/efter jämförelse. The drag surface is a full-bleed `input[type=range]`
 * at opacity 0: pointer drag, touch drag, click-to-jump and arrow keys all
 * come from the native control, and it is announced correctly to screen
 * readers. Hand-rolled pointermove handlers get none of that for free.
 */
function BeforeAfterSlider({ item }: { item: BeforeAfterCase }) {
  const [pos, setPos] = useState(50)

  return (
    <figure className="m-0">
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/2] rounded-2xl overflow-hidden bg-[#e8d5c4] select-none">
        <img
          src={item.after}
          alt={`Efter ${item.treatment}`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          loading="lazy"
          decoding="async"
        />

        {/* inset(top right bottom left) — clipping from the right reveals the
            "före" image across exactly `pos`% of the frame. */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img
            src={item.before}
            alt={`Före ${item.treatment}`}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        </div>

        <span
          className="absolute top-3 left-3 bg-[#1c1710]/70 text-white text-[0.65rem] tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 transition-opacity"
          style={{ opacity: pos > 12 ? 1 : 0 }}
        >
          Före
        </span>
        <span
          className="absolute top-3 right-3 bg-[#c49068]/90 text-white text-[0.65rem] tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 transition-opacity"
          style={{ opacity: pos < 88 ? 1 : 0 }}
        >
          Efter
        </span>

        {item.placeholder && (
          <span className="absolute bottom-3 left-3 bg-white/90 text-[#6b5c4e] text-[0.65rem] tracking-wide rounded-full px-3 py-1 font-medium">
            Exempelbild
          </span>
        )}

        <div className="absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.35)] pointer-events-none" style={{ left: `${pos}%` }} />
        <div
          className="absolute top-1/2 w-10 h-10 -mt-5 -ml-5 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c49068"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="10 7 5 12 10 17" />
            <polyline points="14 7 19 12 14 17" />
          </svg>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Jämför före och efter — ${item.treatment}`}
          aria-valuetext={`${pos}% av före-bilden visas`}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>

      <figcaption className="text-sm text-[#6b5c4e] mt-4 text-center px-2">
        <span className="font-medium text-[#1c1710]">{item.treatment}</span>
        <span className="mx-2 text-[#c49068]">·</span>
        {item.caption}
      </figcaption>
    </figure>
  )
}

function BeforeAfterBlock() {
  const [active, setActive] = useState(0)
  const item = BEFORE_AFTER_CASES[active]

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 mb-16">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {BEFORE_AFTER_CASES.map((c, i) => (
          <button
            key={c.treatment}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`text-xs font-medium rounded-full px-4 py-2 border transition-colors ${
              i === active
                ? 'bg-[#c49068] border-[#c49068] text-white'
                : 'bg-white border-[rgba(196,144,104,0.25)] text-[#6b5c4e] hover:border-[#c49068]'
            }`}
          >
            {c.treatment}
          </button>
        ))}
      </div>

      <BeforeAfterSlider key={item.treatment} item={item} />

      <p className="text-xs text-[#9c8878] text-center mt-4">
        Dra i reglaget för att jämföra. Resultat varierar från person till person.
      </p>
    </div>
  )
}

function ReviewsSection() {
  const [ref, visible] = useInView<HTMLElement>(0.1)

  return (
    <section id="omdomen" className="py-20 sm:py-24 px-5 sm:px-6 bg-white" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Vad kunderna säger</p>
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-10"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Omdömen
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 bg-[#faf0e8] border border-[rgba(196,144,104,0.15)] rounded-2xl px-6 py-6 mb-10">
          <div className="text-center">
            <p className="font-serif text-5xl font-semibold text-[#1c1710] leading-none" style={{ fontFamily: 'Lora, serif' }}>
              {RATING_AVG.toLocaleString('sv-SE')}
            </p>
            <StarRating size="lg" />
            <p className="text-xs text-[#9c8878] mt-1">av 5 i snitt</p>
          </div>
          <span className="hidden sm:block w-px h-16 bg-[rgba(196,144,104,0.25)]" />
          <div className="text-center sm:text-left">
            <p className="text-[#1c1710] font-medium">{RATING_COUNT.toLocaleString('sv-SE')} omdömen</p>
            <p className="text-sm text-[#6b5c4e] mt-1">Verifierade recensioner samlade via Bokadirekt.</p>
            <a
              href={BOKADIREKT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm font-medium text-[#c49068] hover:underline"
            >
              Läs alla omdömen på Bokadirekt →
            </a>
          </div>
        </div>

        {/* Snap rail on phones, grid from md — a 3-column grid at 390px would
            crush each card to ~110px. */}
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-2">
          {REVIEWS.map((r, i) => (
            <figure
              key={i}
              className="m-0 shrink-0 w-[85%] sm:w-[45%] md:w-auto snap-start bg-white border border-[rgba(196,144,104,0.2)] rounded-2xl p-5 flex flex-col gap-3 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transitionDelay: `${i * 70}ms`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <StarRating count={r.rating} />
                <span className="text-xs text-[#9c8878]">
                  {new Date(r.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })}
                </span>
              </div>
              <blockquote className="text-sm text-[#6b5c4e] leading-relaxed flex-1">{r.text}</blockquote>
              <figcaption className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(196,144,104,0.15)]">
                <span className="text-sm font-medium text-[#1c1710]">{r.name}</span>
                <span className="text-xs bg-[#faf0e8] border border-[rgba(196,144,104,0.2)] rounded-full px-2.5 py-0.5 text-[#6b5c4e]">
                  {r.treatment}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="text-xs text-[#9c8878] text-center mt-6 md:hidden">Svep för fler omdömen →</p>
      </div>
    </section>
  )
}

function GallerySection() {
  const [ref, visible] = useInView<HTMLElement>()

  return (
    <section id="galleri" className="py-20 sm:py-24 bg-[#faf0e8] overflow-hidden" ref={ref}>
      <div
        className="max-w-2xl mx-auto px-5 sm:px-6 text-center mb-12 sm:mb-14 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium mb-3">Vårt arbete</p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1710] mb-4" style={{ fontFamily: 'Lora, serif' }}>
          Galleri
        </h2>
        <p className="text-[#6b5c4e]">Se exempel på våra behandlingar och resultat.</p>
      </div>

      {/* Lives inside #galleri rather than as its own nav section: it is the
          same "vårt arbete" story, and a seventh nav item would not fit. */}
      <BeforeAfterBlock />

      <div className="flex flex-col gap-3">
        <Marquee direction="left" duration="38s" gapClass="gap-3 pe-3">
          {GALLERY_ROW1.map((img, i) => (
            <GalleryCard key={img.url} img={img} visible={visible} delay={i * 60} />
          ))}
        </Marquee>

        <Marquee direction="right" duration="34s" gapClass="gap-3 pe-3">
          {GALLERY_ROW2.map((img, i) => (
            <GalleryCard key={img.url} img={img} visible={visible} delay={i * 60 + 200} />
          ))}
        </Marquee>
      </div>

      <div
        className="text-center mt-12 px-5 sm:px-6 transition-all duration-700 delay-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-[rgba(196,144,104,0.3)] text-[#6b5c4e] hover:text-[#c49068] hover:border-[#c49068] transition-colors rounded-full px-6 py-2.5 text-sm font-medium"
        >
          <InstagramIcon />
          Följ oss på @lajolieclinic
        </a>
      </div>
    </section>
  )
}

function GalleryCard({ img, visible, delay }: { img: { url: string; alt: string }; visible: boolean; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="group relative flex-none w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-[#e8d5c4]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={img.url}
        alt={img.alt}
        width={480}
        height={480}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        style={{
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#1c1710]/60 via-transparent to-transparent flex items-end p-4"
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }}
      >
        <p className="text-white text-xs font-medium leading-tight">{img.alt}</p>
      </div>
    </div>
  )
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  // GitHub Pages is static — there is no endpoint to POST to. Handing the
  // message to the visitor's mail client is the honest option; showing a
  // "Tack för ditt meddelande!" screen without sending anything is not.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const subject = `Förfrågan från ${form.name}`
    const body = [
      `Namn: ${form.name}`,
      `Telefon: ${form.phone || '—'}`,
      `E-post: ${form.email}`,
      '',
      form.message,
    ].join('\n')
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const infoCards = [
    { label: 'Adress', icon: <PinIcon />, main: 'Derbyvägen 30', sub: '212 35 Malmö', href: MAPS_URL },
    { label: 'Telefon', icon: <PhoneIcon />, main: PHONE, sub: 'Mån–Fre 9–18', href: `tel:${PHONE_E164}` },
    { label: 'Instagram', icon: <InstagramIcon />, main: '@lajolieclinic', sub: '', href: INSTAGRAM },
    { label: 'Bokning', icon: <CalendarIcon />, main: 'Bokadirekt', sub: '', href: BOKADIREKT },
  ]

  const field =
    'w-full bg-[#faf0e8] border border-[rgba(196,144,104,0.2)] rounded-lg px-3 py-2.5 text-sm text-[#1c1710] placeholder:text-[#9c8878] focus:outline-none focus:ring-2 focus:ring-[#c49068]/40'
  const labelCls = 'text-xs text-[#9c8878] tracking-widest uppercase mb-1.5 block'

  return (
    <section id="kontakt" className="py-20 sm:py-24 px-5 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Kom i kontakt</p>
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-4"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Kontakt & Hitta hit
        </h2>
        <p className="text-[#6b5c4e] text-center mb-12 sm:mb-14">
          Vi finns alltid tillgängliga för frågor. Boka enkelt online eller hör av dig till oss direkt.
        </p>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {infoCards.map((card) => (
                <a
                  key={card.label}
                  href={card.href}
                  target={card.href.startsWith('http') ? '_blank' : undefined}
                  rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="border border-[rgba(196,144,104,0.2)] rounded-xl p-4 hover:border-[#c49068] hover:shadow-sm transition-all"
                >
                  <span className="text-[#c49068] text-xs tracking-widest uppercase font-medium mb-2 flex items-center gap-1.5">
                    {card.icon}
                    {card.label}
                  </span>
                  <span className="block font-medium text-[#1c1710] text-sm break-words">{card.main}</span>
                  {card.sub && <span className="block text-xs text-[#9c8878] mt-0.5">{card.sub}</span>}
                </a>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden border border-[rgba(196,144,104,0.2)] h-56 bg-[#f2e6d8] flex items-center justify-center">
              <div className="text-center px-4">
                <span className="inline-flex text-[#c49068]">
                  <PinIcon />
                </span>
                <p className="text-sm text-[#6b5c4e] mt-2">Derbyvägen 30, Malmö</p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-[#c49068] hover:underline"
                >
                  Öppna i Google Maps →
                </a>
              </div>
            </div>
          </div>

          <div>
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 border border-[rgba(196,144,104,0.2)] rounded-2xl p-8">
                <span className="text-4xl" aria-hidden="true">
                  💛
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>
                  Tack!
                </h3>
                <p className="text-[#6b5c4e] text-sm">
                  Ditt e-postprogram har öppnats med meddelandet ifyllt — tryck skicka där så återkommer vi så snart som
                  möjligt.
                </p>
                <p className="text-[#9c8878] text-xs">
                  Öppnades det inte? Ring oss på{' '}
                  <a href={`tel:${PHONE_E164}`} className="text-[#c49068] hover:underline">
                    {PHONE}
                  </a>
                  .
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setForm({ name: '', phone: '', email: '', message: '' })
                  }}
                  className="text-sm text-[#c49068] hover:underline"
                >
                  Skicka ett nytt meddelande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-[rgba(196,144,104,0.2)] rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                <h3 className="font-serif text-xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>
                  Skicka ett meddelande
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="kontakt-namn" className={labelCls}>
                      Namn *
                    </label>
                    <input
                      id="kontakt-namn"
                      name="name"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ditt namn"
                      className={field}
                    />
                  </div>
                  <div>
                    <label htmlFor="kontakt-telefon" className={labelCls}>
                      Telefon
                    </label>
                    <input
                      id="kontakt-telefon"
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0700-000000"
                      className={field}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="kontakt-epost" className={labelCls}>
                    E-post *
                  </label>
                  <input
                    id="kontakt-epost"
                    name="email"
                    required
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="din@email.se"
                    className={field}
                  />
                </div>

                <div>
                  <label htmlFor="kontakt-meddelande" className={labelCls}>
                    Meddelande *
                  </label>
                  <textarea
                    id="kontakt-meddelande"
                    name="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Berätta vad du är intresserad av..."
                    className={`${field} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#c49068] hover:bg-[#a87650] text-white font-medium py-3 rounded-full transition-all duration-200 text-sm tracking-wide"
                >
                  ✉ Skicka meddelande
                </button>

                <p className="text-center text-xs text-[#9c8878]">
                  Eller{' '}
                  <a href={BOKADIREKT} target="_blank" rel="noopener noreferrer" className="text-[#c49068] hover:underline">
                    boka direkt på Bokadirekt
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#1c1710] text-white/70 py-12 px-5 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-serif text-white text-xl font-semibold" style={{ fontFamily: 'Lora, serif' }}>
            La Jolie Clinic
          </p>
          <p className="text-xs mt-1">Derbyvägen 30, 212 35 Malmö</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => scrollToSection(s.id)} className="hover:text-white transition-colors">
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs">© {new Date().getFullYear()} La Jolie Clinic</p>
      </div>
    </footer>
  )
}

function SectionDots({ active }: { active: string }) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    // Hidden below `lg`: at `right-5` on a phone the dots sit on top of body
    // copy and steal taps meant for the content underneath.
    <div className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 items-center">
      {SECTIONS.map((s) => {
        const isActive = active === s.id
        const isHovered = hovered === s.id
        return (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(s.id)}
            onBlur={() => setHovered(null)}
            aria-label={`Gå till ${s.label}`}
            aria-current={isActive ? 'true' : undefined}
            className="relative flex items-center justify-end p-1"
          >
            <span
              className="absolute right-7 text-xs font-medium text-[#1c1710] bg-white border border-[rgba(196,144,104,0.25)] rounded-full px-3 py-1 shadow-sm whitespace-nowrap pointer-events-none"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateX(0)' : 'translateX(6px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
            >
              {s.label}
            </span>

            <span
              className="block rounded-full"
              style={{
                width: isActive ? 10 : 7,
                height: isActive ? 10 : 7,
                backgroundColor: isActive ? '#c49068' : isHovered ? '#a87650' : 'rgba(196,144,104,0.4)',
                boxShadow: isActive ? '0 0 0 3px rgba(196,144,104,0.2)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 transition-transform text-[#9c8878] ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const activeSection = useActiveSection()

  return (
    <div className="min-h-screen bg-[#faf0e8]">
      <Nav activeSection={activeSection} />
      <SectionDots active={activeSection} />
      <main>
        <HeroSection />
        {/* Full-bleed band: nesting the ticker inside the padded About section
            inset it by the section's own `px-6` and clipped it short. */}
        <Ticker />
        <AboutSection />
        <TeamSection />
        <TreatmentsSection />
        <TreatmentGuide />
        <GallerySection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
