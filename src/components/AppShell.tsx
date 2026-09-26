"use client";

import { AccessProvider } from "@/components/AccessProvider";
import { SiteHeader } from "@/components/SiteHeader";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AccessProvider>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="app-shell">
        <SiteHeader />
        {children}
      </div>
    </AccessProvider>
  );
}
