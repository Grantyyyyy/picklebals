import type { Metadata } from "next";

import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="border-b bg-background">
        <div className="container-page flex h-14 items-center gap-3">
          <Logo />
          <span className="rounded-full bg-court-soft px-2.5 py-0.5 text-xs font-semibold text-court-deep">
            Admin
          </span>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
