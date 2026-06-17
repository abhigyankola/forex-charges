import Link from "next/link";

const links = [
  { href: "/", label: "Overview" },
  { href: "/currency", label: "By Currency" },
  { href: "/bank", label: "By Bank" },
  { href: "/best-rates", label: "Best Rates" },
  { href: "/info", label: "Info" },
];

export function Nav({
  lastUpdated,
  currentPath,
}: {
  lastUpdated: string;
  currentPath: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="shrink-0 text-[15px] font-semibold tracking-[-0.03em] text-foreground"
          >
            Forex Rates
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => {
              const isActive =
                currentPath === link.href ||
                (link.href !== "/" && currentPath.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <span className="hidden text-[12px] text-muted-foreground sm:block">
          Updated {lastUpdated}
        </span>
      </div>
      {/* Mobile navigation */}
      <nav className="flex overflow-x-auto border-t border-border px-4 sm:hidden">
        {links.map((link) => {
          const isActive =
            currentPath === link.href ||
            (link.href !== "/" && currentPath.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
