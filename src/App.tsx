import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import heroClinic from "./assets/lajolie-hero-clinic.png"
import lashBeforeAfter from "./assets/lash-before-after.png"
import logoBanner from "./assets/logo-banner.jpg"
import logoSeal from "./assets/logo-seal.jpg"
import logoWordmark from "./assets/logo-wordmark.jpg"
import profileBeforeAfter from "./assets/profile-before-after.png"
import {
  ArrowUpRight,
  CalendarDays,
  Instagram,
  Mail,
  Menu,
  Phone,
  Star,
  X,
} from "./icons"

const BOKADIREKT_URL = "https://www.bokadirekt.se/places/la-jolie-clinic-37459"
const INSTAGRAM_URL = "https://www.instagram.com/lajolieclinic/"
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Hanssons+v%C3%A4g+52%2C+Malm%C3%B6"
const PHONE_RAW = "0760698131"
const PHONE_DISPLAY = "076-069 81 31"
const EMAIL = "lajolie.clinic@outlook.com"
const STREET = "Hanssons väg 52"
const CITY = "Malmö"

/** Bokadirekt figures. The non-breaking space keeps "1 939" on one line. */
const RATING = { score: "4,9", reviews: "1 939" }

const OPENING_HOURS = [
  { days: "Måndag–fredag", hours: "10–18" },
  { days: "Lördag–söndag", hours: "12–18" },
]

/**
 * Single source of truth for the header, mobile menu, footer and their
 * anchors. Order follows the sections on the page.
 */
const NAV_LINKS = [
  { label: "Om oss", href: "#om-oss" },
  { label: "Behandlingar", href: "#behandlingar" },
  { label: "Resultat", href: "#resultat" },
  { label: "Kontakt", href: "#kontakt" },
]

const TREATMENTS: {
  title: string
  description: string
  services: string[]
}[] = [
  {
    title: "Injektionsbehandlingar",
    description:
      "Planeras utifrån ansiktets proportioner, det du vill förändra och lika mycket det du vill behålla.",
    services: [
      "Fillers",
      "Botox",
      "Microbotox",
      "Hyalase",
      "HarmonyCa",
      "Radiesse",
    ],
  },
  {
    title: "Skinboosters & biostimulering",
    description:
      "För återfuktning och hudkvalitet. Preparatet väljs efter hudtyp och vad du vill uppnå.",
    services: [
      "Skinbooster",
      "Profhilo",
      "Sculptra",
      "Sunekos",
      "Mesoterapi",
      "Lax DNA (PDRN)",
    ],
  },
  {
    title: "Ansiktsbehandlingar & peeling",
    description:
      "Rengöring, exfoliering och lyster – som en enskild behandling eller som del av en längre plan.",
    services: [
      "Ansiktsbehandling",
      "Diamond Glow",
      "Hydrafacial",
      "Microneedling",
      "PRX-T33",
      "Kemisk peeling",
    ],
  },
  {
    title: "PRP, PRF & hårbotten",
    description:
      "Behandlingar för hud och hårbotten, flera av dem baserade på ditt eget blod.",
    services: [
      "PRP hudbooster",
      "PRF",
      "PRP hårbooster",
      "Pink HL",
      "RRS XL Hair",
    ],
  },
  {
    title: "Trådlyft & hudstruktur",
    description:
      "Lyft, hudstruktur och ärr. Föregås alltid av en konsultation där vi bedömer om behandlingen passar dig.",
    services: [
      "Trådlyft",
      "Kollagentrådar",
      "Plasma Pen",
      "Ögonlockslyft",
      "Cutting-teknik för ärr",
    ],
  },
  {
    title: "Kroppsbehandlingar",
    description:
      "Behandlingar för kroppens kontur och hudens struktur, anpassade efter område.",
    services: [
      "Fettreducering",
      "Kavitation",
      "Kroppsfillers",
      "Buttlift",
      "Cellulitbehandling",
      "Sklerosering",
      "Intima korrigeringar",
    ],
  },
  {
    title: "Fransar & ögonbryn",
    description:
      "Lyft, förlängning, färg och form, anpassat efter dina ögon och ditt ansikte.",
    services: [
      "Fransförlängning",
      "Lashlift",
      "Browlift",
      "Brynformning",
      "Färgning",
      "Trådning",
    ],
  },
  {
    title: "Massage & välmående",
    description:
      "Avkopplande behandlingar och specialbehandlingar, för sig eller som komplement.",
    services: [
      "Ansiktsmassage",
      "Huvud- & nackmassage",
      "Vitamindropp",
      "Intim behandling",
      "BB Glow & Lips",
    ],
  },
]

const TEAM = [
  { name: "Bouchra Itani", role: "Legitimerad sjuksköterska" },
  { name: "Raiana Itani", role: "Undersköterska" },
]

const PRINCIPLES = [
  {
    numeral: "I",
    title: "Planerat efter dig",
    text: "Varje behandling utgår från dina önskemål, din hud och dina proportioner, inte från en standardmall.",
  },
  {
    numeral: "II",
    title: "Trygghet i varje steg",
    text: "Legitimerad sjuksköterska, läkare ansluten till kliniken och försäkring via Folksam.",
  },
  {
    numeral: "III",
    title: "Allt under ett tak",
    text: "Injektioner, hudvård, fransar och kroppsbehandlingar på samma klinik, så att flera behandlingar kan planeras som en helhet.",
  },
]

const BOOKING_STEPS = [
  { title: "Välj behandling", text: "Bläddra bland behandlingar och priser" },
  { title: "Välj en tid", text: "Se lediga tider direkt i kalendern" },
  { title: "Bekräfta", text: "Du får en bekräftelse från Bokadirekt" },
]

function Stars({ size = 15 }: { size?: number }) {
  return (
    <span className="stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} fill="currentColor" strokeWidth={1.2} />
      ))}
    </span>
  )
}

function Kicker({
  children,
  light = false,
}: {
  children: ReactNode
  light?: boolean
}) {
  return <p className={`kicker ${light ? "kicker--light" : ""}`}>{children}</p>
}

function Masthead() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    // Matches the 1060px breakpoint where the menu button disappears.
    const onResize = () => {
      if (window.innerWidth > 1060) setOpen(false)
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
    <header className="masthead">
      <div className="shell masthead-inner">
        <nav className="masthead-nav" aria-label="Huvudmeny">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a
          className="brand"
          href="#top"
          aria-label="La Jolie Clinic, startsida"
        >
          <img src={logoWordmark} alt="" width="380" height="140" />
        </a>

        <div className="masthead-end">
          <a className="masthead-phone" href={`tel:${PHONE_RAW}`}>
            <Phone size={15} strokeWidth={1.6} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <a
            className="btn btn--gold btn--compact"
            href={BOKADIREKT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Boka tid
          </a>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Stäng meny" : "Öppna meny"}
          aria-expanded={open}
          aria-controls="menu-panel"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X size={22} strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <Menu size={22} strokeWidth={1.6} aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <>
          <button
            className="menu-scrim"
            type="button"
            aria-label="Stäng meny"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <nav id="menu-panel" className="menu-panel" aria-label="Mobilmeny">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                className="menu-link"
                href={link.href}
                onClick={() => setOpen(false)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {link.label}
              </a>
            ))}
            <a
              className="btn btn--cocoa menu-book"
              href={BOKADIREKT_URL}
              target="_blank"
              rel="noreferrer"
            >
              <CalendarDays size={17} strokeWidth={1.6} aria-hidden="true" />
              Boka tid
            </a>
            <div className="menu-meta">
              <a href={`tel:${PHONE_RAW}`}>
                <Phone size={15} strokeWidth={1.6} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <Instagram size={15} strokeWidth={1.6} aria-hidden="true" />
                Instagram
              </a>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  )
}

function Opening() {
  return (
    <section className="opening" aria-labelledby="opening-title">
      <div className="shell opening-grid">
        <div className="opening-copy">
          <Kicker light>Estetisk klinik i {CITY}</Kicker>
          <h1 id="opening-title">Förfina det som redan är ditt</h1>
          <p className="opening-lead">
            Injektioner, skinboosters, hudvård, fransar och kroppsbehandlingar
            på Hanssons väg i {CITY}. Vi börjar alltid med att lyssna och
            planerar sedan behandlingen tillsammans med dig.
          </p>
          <div className="opening-actions">
            <a
              className="btn btn--gold"
              href={BOKADIREKT_URL}
              target="_blank"
              rel="noreferrer"
            >
              Boka tid
              <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
            </a>
            <a className="btn btn--line-light" href="#behandlingar">
              Vad vi erbjuder
            </a>
          </div>
          <p className="opening-rating">
            <Stars />
            <span>
              <strong>{RATING.score} av 5</strong> från {RATING.reviews} betyg
              på Bokadirekt
            </span>
          </p>
        </div>

        <figure className="opening-visual">
          <div className="opening-arch">
            <img
              src={heroClinic}
              alt="Behandlingsbrits i ett ljust, stilla rum"
              width="1086"
              height="1448"
            />
          </div>
          <img
            className="opening-seal"
            src={logoSeal}
            alt=""
            width="130"
            height="130"
          />
        </figure>
      </div>
    </section>
  )
}

function Clinic() {
  return (
    <section className="clinic" id="om-oss" aria-labelledby="clinic-title">
      <div className="shell clinic-grid">
        <div>
          <Kicker>Om oss</Kicker>
          <h2 id="clinic-title">Kliniken bakom namnet</h2>
          <p className="clinic-lead">
            La Jolie drivs av systrarna Bouchra och Raiana Itani. Här möter du
            samma två ansikten från första frågan till färdig behandling – och
            ingenting stressas fram.
          </p>
          <ul className="team" aria-label="Teamet">
            {TEAM.map((member) => (
              <li key={member.name}>
                <span className="team-initial" aria-hidden="true">
                  {member.name.charAt(0)}
                </span>
                <span>
                  <strong>{member.name}</strong>
                  <small>{member.role}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ol className="principles" aria-label="Så arbetar vi">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title}>
              <span className="principle-numeral" aria-hidden="true">
                {principle.numeral}
              </span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section
      className="services"
      id="behandlingar"
      aria-labelledby="services-title"
    >
      <div className="shell services-grid">
        <div className="services-aside">
          <Kicker>Behandlingar</Kicker>
          <h2 id="services-title">Från injektioner till välmående</h2>
          <p>
            Här ser du klinikens behandlingsområden i korthet. Vilken behandling
            som passar dig avgör vi tillsammans – aktuella priser och lediga
            tider finns på Bokadirekt.
          </p>
          <a
            className="link-arrow"
            href={BOKADIREKT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Priser och tider
            <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
          </a>
        </div>

        <ol className="services-list">
          {TREATMENTS.map((treatment, index) => (
            <li key={treatment.title} className="service">
              <span className="service-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="service-body">
                <h3>{treatment.title}</h3>
                <p>{treatment.description}</p>
              </div>
              <ul
                className="service-items"
                aria-label={`${treatment.title}, exempel på behandlingar`}
              >
                {treatment.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Verdict() {
  return (
    <section className="verdict" aria-label="Kundbetyg">
      <div className="shell verdict-inner">
        <p className="verdict-score">
          <span>
            {RATING.score}
            <small>av 5</small>
          </span>
        </p>
        <Stars size={18} />
        <p className="verdict-text">
          Snittbetyg från {RATING.reviews} kundomdömen på Bokadirekt
        </p>
        <a
          className="link-arrow link-arrow--light"
          href={BOKADIREKT_URL}
          target="_blank"
          rel="noreferrer"
        >
          Läs omdömena
          <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

function Results() {
  return (
    <section className="results" id="resultat" aria-labelledby="results-title">
      <div className="shell">
        <div className="results-head">
          <Kicker>Resultat</Kicker>
          <h2 id="results-title">Så här kan det se ut</h2>
          <p>
            Bilderna visar enskilda kunders behandlingar på kliniken. Resultat
            är individuella och varierar från person till person.
          </p>
        </div>

        <div className="results-pair">
          <figure className="result result--stacked">
            <div className="result-frame">
              <img
                src={lashBeforeAfter}
                alt="Ögon före och efter fransbehandling, före överst och efter nederst"
                width="1254"
                height="1254"
                loading="lazy"
              />
              <span className="result-tag result-tag--before">Före</span>
              <span className="result-tag result-tag--after">Efter</span>
            </div>
            <figcaption>
              <span>01</span> Fransbehandling
            </figcaption>
          </figure>

          <figure className="result result--side">
            <div className="result-frame">
              <img
                src={profileBeforeAfter}
                alt="Profil före och efter behandling, före till vänster och efter till höger"
                width="1254"
                height="1254"
                loading="lazy"
              />
              <span className="result-tag result-tag--before">Före</span>
              <span className="result-tag result-tag--after">Efter</span>
            </div>
            <figcaption>
              <span>02</span> Profilbehandling
            </figcaption>
          </figure>
        </div>

        <a
          className="btn btn--line results-more"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Instagram size={16} strokeWidth={1.6} aria-hidden="true" />
          Fler resultat på Instagram
        </a>
      </div>
    </section>
  )
}

function Visit() {
  return (
    <section className="visit" id="kontakt" aria-labelledby="visit-title">
      <div className="shell">
        <div className="booking">
          <div className="booking-head">
            <Kicker light>Boka tid</Kicker>
            <h2 id="visit-title">Boka i tre steg</h2>
            <p>
              Bokningen sker via Bokadirekt, där du också ser hela utbudet och
              aktuella priser.
            </p>
          </div>

          <ol className="booking-flow">
            {BOOKING_STEPS.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">{index + 1}</span>
                <strong>{step.title}</strong>
                <small>{step.text}</small>
              </li>
            ))}
          </ol>

          <div className="booking-cta">
            <a
              className="btn btn--gold"
              href={BOKADIREKT_URL}
              target="_blank"
              rel="noreferrer"
            >
              <CalendarDays size={17} strokeWidth={1.6} aria-hidden="true" />
              Boka på Bokadirekt
            </a>
            <p className="booking-note">
              Du lämnar demosidan och fortsätter till Bokadirekt.
            </p>
          </div>
        </div>

        <div className="visit-info">
          <div className="visit-col">
            <h3>Adress</h3>
            <address>
              {STREET}
              <br />
              {CITY}
            </address>
            <a
              className="link-arrow"
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
            >
              Vägbeskrivning
              <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
            </a>
          </div>

          <div className="visit-col">
            <h3>Öppettider</h3>
            <dl className="hours">
              {OPENING_HOURS.map((slot) => (
                <div key={slot.days}>
                  <dt>{slot.days}</dt>
                  <dd>{slot.hours}</dd>
                </div>
              ))}
            </dl>
            <p className="visit-note">Ordinarie öppettider</p>
          </div>

          <div className="visit-col">
            <h3>Kontakt</h3>
            <ul className="contact-lines">
              <li>
                <a href={`tel:${PHONE_RAW}`}>
                  <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`}>
                  <Mail size={16} strokeWidth={1.6} aria-hidden="true" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  <Instagram size={16} strokeWidth={1.6} aria-hidden="true" />
                  @lajolieclinic
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <a
          className="footer-banner"
          href="#top"
          aria-label="La Jolie Clinic, till toppen"
        >
          <img
            src={logoBanner}
            alt=""
            width="1280"
            height="140"
            loading="lazy"
          />
        </a>
        <nav className="footer-nav" aria-label="Sidfot">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href={BOKADIREKT_URL} target="_blank" rel="noreferrer">
            Bokadirekt
          </a>
        </nav>
        <div className="footer-fine">
          <p>
            La Jolie Clinic · {STREET}, {CITY}
          </p>
          <p>Konceptdesign, ej officiell webbplats</p>
        </div>
      </div>
    </footer>
  )
}

export default function App(): ReactNode {
  return (
    <>
      <Masthead />
      <main id="top">
        <Opening />
        <Clinic />
        <Services />
        <Verdict />
        <Results />
        <Visit />
      </main>
      <SiteFooter />
    </>
  )
}
