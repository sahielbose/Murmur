"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

/**
 * Sticky marketing nav with a state-aware CTA (MURMUR_UI.md §7). Logged out →
 * Log in + Start free; logged in → Open app. The scroll transparency
 * transition is layered on in Phase 17.
 */
export function TopNav({ isAuthed = false }: { isAuthed?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-nav border-b border-border bg-bg">
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        <Wordmark />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-fg-muted transition-colors duration-1 hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Button asChild>
              <Link href="/app">Open app</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Start free</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Wordmark />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-base text-fg hover:bg-bg-subtle"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2">
                {isAuthed ? (
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link href="/app">Open app</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="secondary">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup" onClick={() => setOpen(false)}>
                        Start free
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
