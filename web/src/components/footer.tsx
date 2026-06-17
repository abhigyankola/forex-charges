import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/info", label: "Info" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-[12px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Forex Rates India
          </p>
        </div>
        <p className="mt-4 text-center text-[12px] text-muted-foreground sm:text-left">
          All rates are indicative. Updated daily from official bank sources.
        </p>
      </div>
    </footer>
  );
}
