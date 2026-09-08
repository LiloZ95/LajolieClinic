import { useEffect, useState } from "react"
import type { ComponentType, ReactNode } from "react"

import heroClinic from "./assets/lajolie-hero-clinic.png"
import lashBeforeAfter from "./assets/lash-before-after.png"
import logoAvatar from "./assets/logo-avatar.png"
import profileBeforeAfter from "./assets/profile-before-after.png"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Droplets,
  Eye,
  HeartPulse,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  ScanFace,
  Sparkles,
  Star,
  Syringe,
  Waves,
  X,
} from "./icons"

const BOKADIREKT_URL = "https://www.bokadirekt.se/places/la-jolie-clinic-37459"
const INSTAGRAM_URL = "https://www.instagram.com/lajolieclinic/"
const MAPS_URL = "https://maps.app.goo.gl/5qKQvd4gZvkFUo6L6"
const PHONE_RAW = "0760698131"
const PHONE_DISPLAY = "076-069 81 31"
const EMAIL = "lajolie.clinic@outlook.com"

const OPENING_HOURS = [
  { days: "Måndag", shortDays: "Mån", hours: "12:00–18:00" },
  { days: "Tisdag–Fredag", shortDays: "Tis–Fre", hours: "10:00–18:00" },
  { days: "Lördag–Söndag", shortDays: "Lör–Sön", hours: "12:00–18:00" },
]

/** Single source of truth for the header, mobile menu and their anchors. */
const NAV_LINKS = [
  { label: "Behandlingar", href: "#behandlingar" },
  { label: "Resultat", href: "#resultat" },
  { label: "Om oss", href: "#om-oss" },
  { label: "Kontakt", href: "#kontakt" },
]

type Tone = "paper" | "warm" | "ink"

const TREATMENTS: {
  focus: string
  title: string
  description: string
  services: string[]
  tone: Tone
}[] = [
  {
    focus: "Injektioner",
    title: "Injektion & form",
    description:
      "Individuellt planerade behandlingar där proportioner, uttryck och dina önskemål står i centrum.",
    services: [
      "Fillers",
      "Botox",
      "Microbotox",
      "Hyalase",
      "HarmonyCa",
      "Radiesse",
    ],
    tone: "paper",
  },
  {
    focus: "Hudkvalitet",
    title: "Biostimulering & skinboosters",
    description:
      "Ett brett urval för hudkvalitet och återfuktning, valt efter hudens förutsättningar.",
    services: [
      "Skinbooster",
      "Profhilo",
      "Sculptra",
      "Sunekos",
      "Mesoterapi",
      "Lax DNA (PDRN)",
    ],
    tone: "warm",
  },
  {
    focus: "Hudvård",
    title: "Glow, peeling & hudföryngring",
    description:
      "Kombinationsbehandlingar för rengöring, exfoliering, lyster och en jämnare hudkänsla.",
    services: [
      "Ansiktsbehandling",
      "Diamond Glow",
      "Hydrafacial",
      "Microneedling",
      "PRX-T33",
      "Kemisk peeling",
    ],
    tone: "paper",
  },
  {
    focus: "Hud & hår",
    title: "PRP, PRF & hårvård",
    description:
      "Behandlingar för hud och hårbotten som planeras utifrån område och individuella behov.",
    services: [
      "PRP hudbooster",
      "PRF",
      "PRP hårbooster",
      "Pink HL",
      "RRS XL Hair",
    ],
    tone: "ink",
  },
  {
    focus: "Struktur",
    title: "Lyft, hudstruktur & ärr",
    description:
      "Tekniker för utvalda områden som alltid föregås av en personlig konsultation och bedömning.",
    services: [
      "Trådlyft",
      "Kollagentrådar",
      "Plasma Pen",
      "Ögonlockslyft",
      "Cutting-teknik för ärr",
    ],
    tone: "warm",
  },
  {
    focus: "Kropp",
    title: "Kropp & kontur",
    description:
      "Områdesanpassade behandlingar för kropp, silhuett och hudens struktur.",
    services: [
      "Fettreducering",
      "Kavitation",
      "Kroppsfillers",
      "Buttlift",
      "Cellulitbehandling",
      "Sklerosering",
    ],
    tone: "paper",
  },
  {
    focus: "Fransar & bryn",
    title: "Inramning med precision",
    description:
      "Form, färg och förlängning anpassas för att framhäva ögon och ansiktsdrag på ett personligt sätt.",
    services: [
      "Fransförlängning",
      "Lashlift",
      "Browlift",
      "Brynformning",
      "Färgning",
      "Trådning",
    ],
    tone: "paper",
  },
  {
    focus: "Välmående",
    title: "Massage & specialbehandlingar",
    description:
      "Ett kompletterande utbud med avkopplande behandlingar och särskilda bokningsområden.",
    services: [
      "Ansiktsmassage",
      "Huvud- & nackmassage",
      "Vitamindropp",
      "Intima behandlingar",
      "BB Glow & Lips",
    ],
    tone: "warm",
  },
]

/** Positional: index N decorates TREATMENTS[N]. */
const TREATMENT_ICONS: ComponentType<{
  size?: number
  strokeWidth?: number
  "aria-hidden"?: "true"
}>[] = [Syringe, Droplets, Sparkles, Activity, ScanFace, Waves, Eye, HeartPulse]

const TEAM = [
  { name: "Bouchra Itani", role: "Legitimerad sjuksköterska" },
  { name: "Raiana Itani", role: "Undersköterska" },
]

const VALUES = [
  "Personligt anpassat",
  "Tryggt bemötande",
  "Brett behandlingsutbud",
]

const CREDENTIALS = [
  "Leg. sjuksköterska",
  "Läkare ansluten",
  "Försäkring via Folksam",
]

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`wordmark ${light ? "wordmark--light" : ""}`}
      href="#top"
      aria-label="La Jolie Clinic, startsida"
    >
      <span>La Jolie</span>
      <small>Clinic</small>
    </a>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = open ? "hidden" : previousOverflow

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("resize", onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("resize", onResize)
    }
  }, [open])

  return (
    <>
      <div className="utility-bar">
        <div className="shell utility-inner">
          <span>
            <MapPin size={13} strokeWidth={1.7} aria-hidden="true" /> Derbyvägen
            30, Malmö
          </span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Instagram size={13} strokeWidth={1.7} aria-hidden="true" /> Följ La
            Jolie
          </a>
        </div>
      </div>

      <header
        className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}
      >
        <div className="shell header-inner">
          <Wordmark />
          <nav className="desktop-nav" aria-label="Huvudnavigation">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a
            className="button button--dark header-book"
            href={BOKADIREKT_URL}
            target="_blank"
            rel="noreferrer"
          >
            <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" />
            Boka tid
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-label={open ? "Stäng meny" : "Öppna meny"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X size={23} strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <Menu size={23} strokeWidth={1.7} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {open ? (
        <div className="mobile-menu-layer">
          <button
            className="mobile-menu-backdrop"
            type="button"
            aria-label="Stäng meny"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobilnavigation"
          >
            <p>Meny</p>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              className="button button--gold"
              href={BOKADIREKT_URL}
              target="_blank"
              rel="noreferrer"
            >
              <CalendarDays size={17} strokeWidth={1.8} aria-hidden="true" />
              Boka tid
            </a>
            <div className="mobile-menu-meta">
              <span>Derbyvägen 30, Malmö</span>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <Instagram size={15} aria-hidden="true" /> Instagram
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  )
}

/** Decorative ribbon strokes behind the hero, treatments and trust sections. */
function FlowLines({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`flow-lines ${className}`.trim()}
      viewBox="0 0 1200 520"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M-84 414C132 390 184 82 454 116C704 147 721 438 972 374C1120 336 1194 222 1290 272" />
      <path d="M-96 448C142 421 204 120 470 151C707 179 732 446 982 390C1134 356 1207 251 1302 298" />
      <path d="M-112 483C154 452 226 160 488 186C711 208 747 453 994 406C1149 376 1220 280 1316 325" />
      <path d="M-132 520C167 484 250 202 508 222C718 238 763 461 1008 423C1167 398 1236 312 1332 352" />
    </svg>
  )
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="shell hero-frame">
        <FlowLines className="flow-lines--hero" />

        <div className="hero-copy">
          <p className="eyebrow">Estetiska behandlingar i Malmö</p>
          <h1 id="hero-title">
            <span>Skönhet med precision,</span>
            <span>
              <em>trygghet</em> och känsla
            </span>
          </h1>
          <p className="hero-lead">
            Personligt anpassade estetiska behandlingar med fokus på trygghet,
            kvalitet och ett resultat som känns rätt för dig.
          </p>
          <div className="button-row">
            <a
              className="button button--dark"
              href={BOKADIREKT_URL}
              target="_blank"
              rel="noreferrer"
            >
              <CalendarDays size={17} strokeWidth={1.8} aria-hidden="true" />
              Boka tid
            </a>
            <a className="text-link" href="#resultat">
              Se resultat{" "}
              <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <img
            className="hero-photo"
            src={heroClinic}
            alt="Ljust och rofyllt behandlingsrum i skandinavisk stil"
          />
          <div className="hero-location">
            La Jolie Clinic <span>Malmö</span>
          </div>
          <div className="hero-rating-card">
            <Star
              size={18}
              fill="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <strong>4,9 av 5</strong>
              <span>1 939 betyg på Bokadirekt</span>
            </div>
          </div>
        </div>

        <div className="hero-proof" aria-label="Trygghet och kompetens">
          {CREDENTIALS.map((credential) => (
            <span key={credential}>
              <Check size={14} strokeWidth={2} aria-hidden="true" />{" "}
              {credential}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  light = false,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
  light?: boolean
}) {
  return (
    <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {description ? (
        <p className="section-description">{description}</p>
      ) : null}
    </div>
  )
}

function Treatments() {
  return (
    <section
      className="treatments section-light"
      id="behandlingar"
      aria-labelledby="treatments-title"
    >
      <FlowLines className="flow-lines--treatments" />
      <div className="shell">
        <div className="section-intro">
          <SectionHeading
            id="treatments-title"
            eyebrow="Behandlingar"
            title="Ett brett utbud, samlat med omsorg"
          />
          <p>
            Utforska klinikens behandlingsområden. Exakt behandling väljs
            tillsammans med kliniken utifrån dina önskemål och förutsättningar.
          </p>
        </div>

        <div className="treatment-grid">
          {TREATMENTS.map((treatment, index) => {
            const Icon = TREATMENT_ICONS[index]
            return (
              <article
                key={treatment.title}
                className={`treatment-card treatment-card--${treatment.tone}`}
              >
                <div className="treatment-card-top">
                  <span className="treatment-icon">
                    <Icon size={19} strokeWidth={1.45} aria-hidden="true" />
                  </span>
                  <span className="treatment-focus">{treatment.focus}</span>
                </div>
                <h3>{treatment.title}</h3>
                <p>{treatment.description}</p>
                <ul
                  className="treatment-services"
                  aria-label={`${treatment.title}, exempel på behandlingar`}
                >
                  {treatment.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        <div className="section-action">
          <span>
            Aktuella varianter, konsultationer och priser uppdateras löpande på
            Bokadirekt.
          </span>
          <a
            className="section-text-link"
            href={BOKADIREKT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Se hela utbudet
            <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}

function Results() {
  return (
    <section
      className="results section-dark"
      id="resultat"
      aria-labelledby="results-title"
    >
      <div className="shell">
        <SectionHeading
          id="results-title"
          eyebrow="Före och efter"
          title="Resultat från La Jolie"
          description="Utforska ett urval av behandlingar från La Jolie Clinic. Resultat är individuella och kan variera från person till person."
          light
        />

        <div className="result-grid">
          <figure className="result-card result-card--lashes">
            <div className="comparison-frame comparison-frame--vertical">
              <img
                src={lashBeforeAfter}
                alt="Före och efter lashbehandling, visat överst och nederst"
                loading="lazy"
              />
              <span className="comparison-label comparison-label--top">
                Före
              </span>
              <span className="comparison-label comparison-label--bottom">
                Efter
              </span>
            </div>
            <figcaption>
              <strong>Lash result</strong>
            </figcaption>
          </figure>

          <figure className="result-card result-card--profile">
            <div className="comparison-frame comparison-frame--horizontal">
              <img
                src={profileBeforeAfter}
                alt="Före och efter profilbehandling, visat till vänster och höger"
                loading="lazy"
              />
              <span className="comparison-label comparison-label--left">
                Före
              </span>
              <span className="comparison-label comparison-label--right">
                Efter
              </span>
            </div>
            <figcaption>
              <strong>Profile result</strong>
            </figcaption>
          </figure>
        </div>

        <a
          className="results-link"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          <span>
            <Instagram size={20} strokeWidth={1.7} aria-hidden="true" /> Se fler
            resultat på Instagram
          </span>
          <ArrowUpRight size={21} strokeWidth={1.7} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="about" id="om-oss" aria-labelledby="about-title">
      <div className="shell about-grid">
        <div className="about-heading-wrap">
          <SectionHeading
            id="about-title"
            eyebrow="Om La Jolie"
            title="Två systrar med fokus på dig"
          />
          <aside
            className="about-details"
            aria-label="Kontakt och ordinarie öppettider"
          >
            <div className="about-contact-links">
              <a href={`tel:${PHONE_RAW}`}>
                <span className="about-detail-icon">
                  <Phone size={17} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span>
                  <small>Telefon</small>
                  <strong>{PHONE_DISPLAY}</strong>
                </span>
              </a>
              <a href={`mailto:${EMAIL}`}>
                <span className="about-detail-icon">
                  <Mail size={17} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span>
                  <small>E-post</small>
                  <strong>{EMAIL}</strong>
                </span>
              </a>
            </div>

            <div className="opening-hours">
              <div className="opening-hours-heading">
                <Clock3 size={16} strokeWidth={1.7} aria-hidden="true" />
                <span>Ordinarie öppettider</span>
              </div>
              <dl>
                {OPENING_HOURS.map((slot) => (
                  <div
                    key={slot.days}
                    aria-label={`${slot.days}: ${slot.hours}`}
                  >
                    <dt>
                      <span aria-hidden="true">{slot.shortDays}</span>
                      <span className="sr-only">{slot.days}</span>
                    </dt>
                    <dd>{slot.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        <div className="about-content">
          <p className="about-lead">
            På La Jolie Clinic möter du Bouchra Itani, legitimerad
            sjuksköterska, och Raiana Itani, undersköterska. Tillsammans
            erbjuder de estetiska behandlingar som anpassas efter varje kunds
            önskemål och behov.
          </p>
          <div className="team-list">
            {TEAM.map((member) => (
              <div key={member.name}>
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </div>
            ))}
          </div>
          <ul className="value-list" aria-label="Våra värden">
            {VALUES.map((value) => (
              <li key={value}>
                <div>
                  <Check size={17} strokeWidth={1.8} aria-hidden="true" />{" "}
                  {value}
                </div>
              </li>
            ))}
          </ul>
          <div className="credential-line" aria-label="Trygghet och kompetens">
            {CREDENTIALS.map((credential) => (
              <span key={credential}>{credential}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Trust() {
  return (
    <section className="trust-section" aria-label="Kundbetyg">
      <FlowLines className="flow-lines--trust" />
      <div className="shell trust-card">
        <div className="trust-rating">
          <span>4,9</span>
          <small>av 5</small>
        </div>
        <div className="trust-copy">
          <div className="stars" aria-label="5 av 5 stjärnor">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={17}
                fill="currentColor"
                strokeWidth={1.3}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="trust-kicker">Verifierat på Bokadirekt</p>
          <h2>1 939 kundbetyg</h2>
        </div>
        <p className="trust-note">
          Ett omtyckt bemötande, bedömt av klinikens kunder.
        </p>
        <a
          className="trust-link"
          href={BOKADIREKT_URL}
          target="_blank"
          rel="noreferrer"
        >
          Läs omdömen
          <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact" id="kontakt" aria-labelledby="contact-title">
      <div className="shell booking-panel">
        <div className="contact-copy">
          <p className="eyebrow">Boka din tid</p>
          <h2 id="contact-title">Din behandling börjar med ett tryggt val.</h2>
          <p>
            På Bokadirekt hittar du aktuella priser, hela behandlingsutbudet och
            tider som passar dig.
          </p>
          <a
            className="address-link"
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={18} strokeWidth={1.7} aria-hidden="true" />
            <span>
              Derbyvägen 30
              <br />
              <small>212 35 Malmö</small>
            </span>
            <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>

        <div className="booking-card">
          <div className="booking-card-heading">
            <span className="booking-icon">
              <CalendarDays size={22} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div>
              <small>Bokning via</small>
              <strong>Bokadirekt</strong>
            </div>
          </div>

          <ol className="booking-steps">
            <li>
              <span>01</span>
              <div>
                <strong>Välj behandling</strong>
                <small>Se hela utbudet och aktuella priser</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Hitta en tid</strong>
                <small>Välj en ledig tid som passar dig</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Bekräfta bokningen</strong>
                <small>Klart, vi ses på kliniken</small>
              </div>
            </li>
          </ol>

          <a
            className="button button--gold booking-button"
            href={BOKADIREKT_URL}
            target="_blank"
            rel="noreferrer"
          >
            <CalendarDays size={17} strokeWidth={1.8} aria-hidden="true" />
            Boka tid på Bokadirekt
            <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
          <p className="booking-note">
            Du lämnar demosidan och fortsätter till Bokadirekt.
          </p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <img
            src={logoAvatar}
            alt="La Jolie Clinic"
            width="48"
            height="48"
            loading="lazy"
          />
          <Wordmark />
        </div>

        <nav aria-label="Externa länkar">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Instagram size={16} strokeWidth={1.7} aria-hidden="true" />{" "}
            Instagram
          </a>
          <a href={BOKADIREKT_URL} target="_blank" rel="noreferrer">
            <CalendarDays size={16} strokeWidth={1.7} aria-hidden="true" />{" "}
            Bokadirekt
          </a>
        </nav>

        <div className="footer-meta">
          <address className="footer-contact" aria-label="Kontaktuppgifter">
            <a href={`tel:${PHONE_RAW}`}>
              <Phone size={16} strokeWidth={1.7} aria-hidden="true" />{" "}
              {PHONE_DISPLAY}
            </a>
            <a href={`mailto:${EMAIL}`}>
              <Mail size={16} strokeWidth={1.7} aria-hidden="true" /> {EMAIL}
            </a>
          </address>
          <p>Konceptdesign, ej officiell webbplats</p>
        </div>
      </div>
    </footer>
  )
}

export default function App(): ReactNode {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Treatments />
        <Results />
        <About />
        <Trust />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
