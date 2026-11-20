import Link from "next/link";
import Image from "next/image";

/**
 * Site footer — brand block, Quick Links, Our Services and Follow Us,
 * laid out like the reference mock but painted in Rentora's palette
 * (deep navy #040e5a from the hero gradient + cyan-300 accents).
 */

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Equipment", href: "/equipment" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const SERVICES = [
  "Equipment Rental",
  "Flexible Booking",
  "Secure Payment",
  "24/7 Support",
];

type Social = { label: string; href: string; viewBox: string; path: string };

// lucide-react ships no brand icons, so these are inline glyphs.
// X uses the current X logo, never the old Twitter bird.
const SOCIALS: Social[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    viewBox: "0 0 320 512",
    path: "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    viewBox: "0 0 576 512",
    path: "M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    viewBox: "0 0 448 512",
    path: "M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z",
  },
  {
    label: "X",
    href: "https://x.com/",
    viewBox: "0 0 512 512",
    path: "M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z",
  },
];

export function Footer() {
  return (
    <footer className="bg-[#040e5a] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-6 sm:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
        {/* Brand: logo, name, tagline, blurb */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/image/logo-mark.png"
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-xl ring-1 ring-white/20"
            />
            <span className="text-2xl font-bold tracking-tight">
              Rent<span className="text-cyan-300">ora</span>
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-blue-100/60">
            Your trusted platform for renting high-quality construction,
            photography, vehicles, agriculture, electronics and event equipment
            effortlessly.
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Footer">
          <h3 className="text-base font-semibold tracking-tight text-white">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-blue-100/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Our Services */}
        <div>
          <h3 className="text-base font-semibold tracking-tight text-white">
            Our Services
          </h3>
          <ul className="mt-4 space-y-3">
            {SERVICES.map((service) => (
              <li key={service} className="text-sm text-blue-100/70">
                {service}
              </li>
            ))}
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-base font-semibold tracking-tight text-white">
            Follow Us
          </h3>
          <div className="mt-4 flex gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-blue-100 ring-1 ring-white/15 transition hover:bg-cyan-400 hover:text-[#040e5a] hover:ring-cyan-400"
              >
                <svg
                  viewBox={social.viewBox}
                  fill="currentColor"
                  aria-hidden
                  className="size-4"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-blue-100/50 sm:px-6">
          © 2026 Rentora. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
