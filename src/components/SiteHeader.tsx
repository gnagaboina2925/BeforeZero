"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccessibilityControls } from "@/components/AccessibilityControls";
import { PRODUCT_NAME } from "@/lib/scenario";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Practice" },
  { href: "/alerts", label: "Alerts" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header no-print">
      <p className="brand">
        <Link className="brand-link" href="/">
          {PRODUCT_NAME}
        </Link>
      </p>
      <nav className="site-nav" aria-label="Primary">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              className={active ? "is-active" : undefined}
              href={link.href}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <AccessibilityControls />
    </header>
  );
}
