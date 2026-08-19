import { useState, useEffect, useRef, type FormEvent } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = ['Hem', 'Om oss', 'Behandlingar', 'Galleri', 'Kontakt']

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

const QUIZ_RESULT: Record<string, string[]> = {
  'Fräscha upp huden': ['Skinboosters', 'Microneedling', 'Ansiktsbehandlingar & Hudvård'],
  'Minska rynkor': ['Botox', 'Trådlyft', 'PRP & Sculptra'],
  'Mer volym & konturer': ['Fillers', 'Kroppsfillers / Buttlift'],
  'Hårborttagning': ['Laser / Permanent hårborttagning'],
  'Kroppsbehandling': ['Fettreducering & Kavitation', 'Kroppsfillers / Buttlift'],
  'Fransar & bryn': ['Fransar & Bryn'],
}


// ─── Components ──────────────────────────────────────────────────────────────

function StarRating({ count = 5, size = 'sm' }: { count?: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'text-lg' : 'text-sm'
  return (
    <span className={`text-[#c49068] ${sz}`}>
      {'★'.repeat(count)}
    </span>
  )
}

function Ticker() {
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="bg-[#c49068] overflow-hidden py-2.5">
      <div className="ticker-track inline-flex gap-12">
        {repeated.map((item, i) => (
          <span key={i} className="text-white text-sm font-medium tracking-wide inline-flex items-center gap-2">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function Nav({ activeSection }: { activeSection: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id.toLowerCase().replace(' ', '-').replace('ö', 'o').replace('ä', 'a'))
    el?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#faf0e8]/95 backdrop-blur-sm border-b border-[rgba(196,144,104,0.15)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="#hem"
          onClick={(e) => { e.preventDefault(); scrollTo('hem') }}
          className="flex flex-col leading-tight"
        >
          <span className="font-serif text-xl font-semibold text-[#1c1710] tracking-wide" style={{ fontFamily: 'Lora, serif' }}>
            La Jolie
          </span>
          <span className="text-[0.6rem] tracking-[0.2em] text-[#9c8878] uppercase font-medium">Clinic</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link === 'Om oss' ? 'om-oss' : link.toLowerCase())}
              className={`text-sm font-medium transition-colors ${
                activeSection === link.toLowerCase()
                  ? 'text-[#c49068]'
                  : 'text-[#6b5c4e] hover:text-[#1c1710]'
              }`}
            >
              {link}
            </button>
          ))}
          <a
            href="https://www.instagram.com/lajolieclinic/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6b5c4e] hover:text-[#c49068] transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
        </div>

        <button
          className="md:hidden text-[#1c1710] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Meny"
        >
          <div className="flex flex-col gap-1.5 w-5">
            <span className={`block h-px bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-px bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#faf0e8] border-t border-[rgba(196,144,104,0.15)] px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link === 'Om oss' ? 'om-oss' : link.toLowerCase())}
              className="text-left text-sm font-medium text-[#6b5c4e] hover:text-[#c49068] py-1"
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

function HeroSection() {
  return (
    <section id="hem" className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #e8c9a8 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm border border-[rgba(196,144,104,0.2)] mb-10">
          <StarRating />
          <span className="text-sm font-medium text-[#1c1710]">4.9</span>
          <span className="text-sm text-[#9c8878]">/ 1 918 omdömen</span>
          <span className="w-px h-4 bg-[rgba(196,144,104,0.3)]" />
          <span className="text-sm text-[#c49068] font-medium">Bokadirekt</span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-semibold text-[#1c1710] leading-tight mb-6" style={{ fontFamily: 'Lora, serif' }}>
          Din skönhet,{' '}
          <span className="italic text-[#c49068]">vår</span>
          <br />
          <span className="italic text-[#c49068]">passion</span>
        </h1>

        <p className="text-[#6b5c4e] text-lg leading-relaxed mb-10 max-w-md">
          Legitimerad sjuksköterska & utbildad undersköterska.<br />
          Estetiska behandlingar skräddarsydda efter ditt önskemål.
        </p>

        <button
          onClick={() => document.getElementById('behandlingar')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#c49068] hover:bg-[#a87650] text-white font-medium px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm tracking-wide"
        >
          Utforska behandlingar
        </button>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 text-sm text-[#9c8878]">
          <span>● Legitimerad sjuksköterska</span>
          <span>● Malmö, Derbyvägen 30</span>
          <span>● Gratis digital konsultation</span>
        </div>

        <div className="mt-16 w-full max-w-sm">
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
  return (
    <section id="om-oss" className="py-24 px-6">
      <Ticker />
      <div className="max-w-6xl mx-auto mt-20">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Om Kliniken</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-16" style={{ fontFamily: 'Lora, serif' }}>
          Vi är La Jolie Clinic
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            {[
              { url: 'https://images.unsplash.com/photo-1785861084191-3600dfc2a6d6?w=400&h=400&fit=crop&auto=format', alt: 'Läppbehandling resultat' },
              { url: 'https://images.unsplash.com/photo-1785861001619-b263ebd4e615?w=400&h=400&fit=crop&auto=format', alt: 'Konsultation' },
              { url: 'https://images.unsplash.com/photo-1782159981479-0fafb56d3cd6?w=400&h=400&fit=crop&auto=format', alt: 'Ansiktsbehandling' },
              { url: 'https://images.unsplash.com/photo-1761819922656-d1b77eef49c0?w=400&h=400&fit=crop&auto=format', alt: 'Trådlyft' },
            ].map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-[#e8d5c4]">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
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
                  <p className="font-serif text-2xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>{stat.val}</p>
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
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-12" style={{ fontFamily: 'Lora, serif' }}>
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
              <h3 className="font-serif text-xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>{member.name}</h3>
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

  const filtered = TREATMENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.sub.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="behandlingar" className="py-24 px-6 bg-[#faf0e8]">
      <div className="max-w-5xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Våra tjänster</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-4" style={{ fontFamily: 'Lora, serif' }}>
          Behandlingar
        </h2>
        <p className="text-[#6b5c4e] text-center text-base mb-10">
          Välj en eller flera behandlingar. Priset uppdateras automatiskt.
        </p>

        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8878]">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Sök behandling..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[rgba(196,144,104,0.2)] rounded-full px-4 py-3 pl-11 text-sm text-[#1c1710] placeholder:text-[#9c8878] focus:outline-none focus:ring-2 focus:ring-[#c49068]/30"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-[rgba(196,144,104,0.15)] rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#faf0e8]/50 transition-colors"
                onClick={() => setOpen(open === t.name ? null : t.name)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <p className="font-medium text-[#1c1710] text-sm">{t.name}</p>
                    <p className="text-xs text-[#c49068] mt-0.5">{t.count} behandlingar</p>
                  </div>
                </div>
                <ChevronIcon open={open === t.name} />
              </button>
              {open === t.name && (
                <div className="px-5 pb-4 border-t border-[rgba(196,144,104,0.1)]">
                  <p className="text-sm text-[#6b5c4e] leading-relaxed pt-3">{t.sub}</p>
                  <button className="mt-3 text-xs font-medium text-[#c49068] hover:text-[#a87650] transition-colors">
                    Boka nu →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[#9c8878] py-12">Inga behandlingar matchade din sökning.</p>
        )}
      </div>
    </section>
  )
}

function TreatmentGuide() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const pick = (opt: string) => {
    const next = [...answers, opt]
    setAnswers(next)
    if (step + 1 >= QUIZ_QUESTIONS.length) {
      setDone(true)
    } else {
      setStep(step + 1)
    }
  }

  const restart = () => {
    setStep(0)
    setAnswers([])
    setDone(false)
  }

  const recommendations = done ? QUIZ_RESULT[answers[0]] || ['Fillers', 'Botox', 'Skinboosters'] : []

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Hitta rätt behandling</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-4" style={{ fontFamily: 'Lora, serif' }}>
          Behandlingsguide
        </h2>
        <p className="text-[#6b5c4e] text-center mb-12">
          Svara på {QUIZ_QUESTIONS.length} snabba frågor så hittar vi rätt behandling för dig.
        </p>

        <div className="bg-[#faf0e8] border border-[rgba(196,144,104,0.15)] rounded-2xl p-8">
          {!done ? (
            <>
              <p className="text-xs text-[#9c8878] mb-3">Fråga {step + 1} av {QUIZ_QUESTIONS.length}</p>
              <div className="w-full bg-[rgba(196,144,104,0.15)] rounded-full h-1 mb-6">
                <div
                  className="bg-[#c49068] h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#1c1710] mb-6" style={{ fontFamily: 'Lora, serif' }}>
                {QUIZ_QUESTIONS[step].q}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {QUIZ_QUESTIONS[step].opts.map((opt) => (
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
              <h3 className="font-serif text-2xl font-semibold text-[#1c1710] mb-6" style={{ fontFamily: 'Lora, serif' }}>
                Dina bästa alternativ
              </h3>
              <div className="flex flex-col gap-3 mb-8">
                {recommendations.map((r) => {
                  const t = TREATMENTS.find((x) => x.name === r)
                  return (
                    <div key={r} className="bg-white border border-[rgba(196,144,104,0.2)] rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-xl">{t?.icon}</span>
                      <span className="font-medium text-[#1c1710]">{r}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' })}
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

function GallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const row1 = [...GALLERY_ROW1, ...GALLERY_ROW1]
  const row2 = [...GALLERY_ROW2, ...GALLERY_ROW2]

  return (
    <section id="galleri" className="py-24 bg-[#faf0e8] overflow-hidden" ref={sectionRef}>
      <div
        className="max-w-2xl mx-auto px-6 text-center mb-14 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium mb-3">Vårt arbete</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1c1710] mb-4" style={{ fontFamily: 'Lora, serif' }}>
          Galleri
        </h2>
        <p className="text-[#6b5c4e]">Se exempel på våra behandlingar och resultat.</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Row 1 — left */}
        <div className="overflow-hidden">
          <div className="gallery-row-left flex gap-3" style={{ width: 'max-content' }}>
            {row1.map((img, i) => (
              <GalleryCard key={i} img={img} index={i} visible={visible} delay={i * 60} />
            ))}
          </div>
        </div>

        {/* Row 2 — right */}
        <div className="overflow-hidden">
          <div className="gallery-row-right flex gap-3" style={{ width: 'max-content' }}>
            {row2.map((img, i) => (
              <GalleryCard key={i} img={img} index={i} visible={visible} delay={i * 60 + 200} />
            ))}
          </div>
        </div>
      </div>

      <div
        className="text-center mt-12 px-6 transition-all duration-700 delay-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <a
          href="https://www.instagram.com/lajolieclinic/"
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

function GalleryCard({ img, visible, delay }: { img: { url: string; alt: string }; index: number; visible: boolean; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative flex-none w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-[#e8d5c4] cursor-pointer"
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
        className="w-full h-full object-cover"
        style={{
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#1c1710]/50 via-transparent to-transparent flex items-end p-4"
        style={{
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <p className="text-white text-xs font-medium leading-tight">{img.alt}</p>
      </div>
    </div>
  )
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  const infoCards = [
    { label: 'Adress', icon: <PinIcon />, main: 'Derbyvägen 30', sub: '212 35 Malmö' },
    { label: 'Telefon', icon: <PhoneIcon />, main: '0760-698131', sub: 'Mån–Fre 9–18' },
    { label: 'Instagram', icon: <InstagramIcon />, main: '@lajolieclinic', sub: '' },
    { label: 'Bokning', icon: <CalendarIcon />, main: 'Bokadirekt', sub: '' },
  ]

  return (
    <section id="kontakt" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-[#c49068] text-xs tracking-[0.25em] uppercase font-medium text-center mb-3">Kom i kontakt</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1c1710] text-center mb-4" style={{ fontFamily: 'Lora, serif' }}>
          Kontakt & Hitta hit
        </h2>
        <p className="text-[#6b5c4e] text-center mb-14">
          Vi finns alltid tillgängliga för frågor. Boka enkelt online eller hör av dig till oss direkt.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {infoCards.map((card) => (
                <div key={card.label} className="border border-[rgba(196,144,104,0.2)] rounded-xl p-4">
                  <p className="text-[#c49068] text-xs tracking-widest uppercase font-medium mb-2 flex items-center gap-1.5">
                    {card.icon}
                    {card.label}
                  </p>
                  <p className="font-medium text-[#1c1710] text-sm">{card.main}</p>
                  {card.sub && <p className="text-xs text-[#9c8878] mt-0.5">{card.sub}</p>}
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden border border-[rgba(196,144,104,0.2)] h-56 bg-[#f2e6d8] flex items-center justify-center relative">
              <div className="text-center">
                <PinIcon />
                <p className="text-sm text-[#6b5c4e] mt-2">Derbyvägen 30, Malmö</p>
                <a
                  href="https://maps.google.com/?q=Derbyvägen+30,+212+35+Malmö"
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
                <span className="text-4xl">💛</span>
                <h3 className="font-serif text-2xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>Tack för ditt meddelande!</h3>
                <p className="text-[#6b5c4e] text-sm">Vi återkommer till dig så snart som möjligt.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', message: '' }) }}
                  className="text-sm text-[#c49068] hover:underline"
                >
                  Skicka ett nytt meddelande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-[rgba(196,144,104,0.2)] rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="font-serif text-xl font-semibold text-[#1c1710]" style={{ fontFamily: 'Lora, serif' }}>
                  Skicka ett meddelande
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9c8878] tracking-widest uppercase mb-1.5 block">Namn *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ditt namn"
                      className="w-full bg-[#faf0e8] border border-[rgba(196,144,104,0.2)] rounded-lg px-3 py-2.5 text-sm text-[#1c1710] placeholder:text-[#9c8878] focus:outline-none focus:ring-2 focus:ring-[#c49068]/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9c8878] tracking-widest uppercase mb-1.5 block">Telefon</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0700-000000"
                      className="w-full bg-[#faf0e8] border border-[rgba(196,144,104,0.2)] rounded-lg px-3 py-2.5 text-sm text-[#1c1710] placeholder:text-[#9c8878] focus:outline-none focus:ring-2 focus:ring-[#c49068]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#9c8878] tracking-widest uppercase mb-1.5 block">E-post *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="din@email.se"
                    className="w-full bg-[#faf0e8] border border-[rgba(196,144,104,0.2)] rounded-lg px-3 py-2.5 text-sm text-[#1c1710] placeholder:text-[#9c8878] focus:outline-none focus:ring-2 focus:ring-[#c49068]/30"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#9c8878] tracking-widest uppercase mb-1.5 block">Meddelande *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Berätta vad du är intresserad av..."
                    className="w-full bg-[#faf0e8] border border-[rgba(196,144,104,0.2)] rounded-lg px-3 py-2.5 text-sm text-[#1c1710] placeholder:text-[#9c8878] focus:outline-none focus:ring-2 focus:ring-[#c49068]/30 resize-none"
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
                  <a href="https://www.bokadirekt.se" target="_blank" rel="noopener noreferrer" className="text-[#c49068] hover:underline">
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
    <footer className="bg-[#1c1710] text-white/70 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-serif text-white text-xl font-semibold" style={{ fontFamily: 'Lora, serif' }}>La Jolie Clinic</p>
          <p className="text-xs mt-1">Derbyvägen 30, 212 35 Malmö</p>
        </div>
        <div className="flex gap-6 text-sm">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => {
                const id = link === 'Om oss' ? 'om-oss' : link.toLowerCase()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hover:text-white transition-colors"
            >
              {link}
            </button>
          ))}
        </div>
        <p className="text-xs">© 2026 La Jolie Clinic</p>
      </div>
    </footer>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      className={`transition-transform text-[#9c8878] ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

const SECTIONS = [
  { id: 'hem', label: 'Hem' },
  { id: 'om-oss', label: 'Om oss' },
  { id: 'behandlingar', label: 'Behandlingar' },
  { id: 'galleri', label: 'Galleri' },
  { id: 'kontakt', label: 'Kontakt' },
]

function SectionDots({ active }: { active: string }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-center">
      {SECTIONS.map((s) => {
        const isActive = active === s.id
        const isHovered = hovered === s.id
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={s.label}
            className="relative flex items-center justify-end group"
          >
            {/* Label pill */}
            <span
              className="absolute right-6 text-xs font-medium text-[#1c1710] bg-white border border-[rgba(196,144,104,0.25)] rounded-full px-3 py-1 shadow-sm whitespace-nowrap pointer-events-none"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateX(0)' : 'translateX(6px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
            >
              {s.label}
            </span>

            {/* Dot */}
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState('hem')

  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id)

    const onScroll = () => {
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
      setActiveSection(closest)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#faf0e8]">
      <Nav activeSection={activeSection} />
      <SectionDots active={activeSection} />
      <HeroSection />
      <AboutSection />
      <TeamSection />
      <TreatmentsSection />
      <TreatmentGuide />
      <GallerySection />
      <ContactSection />
      <Footer />
    </div>
  )
}
