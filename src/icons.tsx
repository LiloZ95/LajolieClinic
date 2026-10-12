import type { SVGProps } from "react"
import type { JSX } from "react"

/**
 * Lucide icons, inlined.
 *
 * Every icon is the 24x24 Lucide outline geometry rendered through one shared
 * <svg> shell, so `size` and `strokeWidth` behave the same everywhere and the
 * markup matches what `lucide-react` emits. `fill` is spread last so the star
 * can opt into `fill="currentColor"`.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  size?: number
}

function shell(name: string, children: JSX.Element) {
  return function Icon({ size = 24, strokeWidth = 2, ...rest }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-${name}`}
        {...rest}
      >
        {children}
      </svg>
    )
  }
}

export const ArrowUpRight = shell(
  "arrow-up-right",
  <>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </>,
)

export const CalendarDays = shell(
  "calendar-days",
  <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </>,
)

export const Instagram = shell(
  "instagram",
  <>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>,
)

export const Mail = shell(
  "mail",
  <>
    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
    <rect x="2" y="4" width="20" height="16" rx="2" />
  </>,
)

export const Menu = shell(
  "menu",
  <>
    <path d="M4 5h16" />
    <path d="M4 12h16" />
    <path d="M4 19h16" />
  </>,
)

export const Phone = shell(
  "phone",
  <>
    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
  </>,
)

export const Star = shell(
  "star",
  <>
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </>,
)

export const X = shell(
  "x",
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
)
