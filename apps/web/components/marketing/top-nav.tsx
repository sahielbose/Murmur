"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
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
 * Sticky marketing nav with a state-aware CTA (MURMUR_UI.md §7, §12).
 * Transparent over the landing's dark hero, then solid + blur + hairline once
 * scrolled; always solid on the lighter inner pages.
 */
export function TopNav({ isAuthed = false }: { isAuthed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isLanding && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-nav border-b transition-colors duration-300",
        transparent
          ? "border-transparent bg-transparent text-white"
          : "bg-bg/85 border-border text-fg backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        <Wordmark className={transparent ? "text-white" : undefined} />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                transparent
                  ? "text-white/75 hover:text-white"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthed ? (
            <Button
              asChild
              className={
                transparent
                  ? "bg-white text-black hover:bg-white/90"
                  : undefined
              }
            >
              <Link href="/app">Open app</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className={
                  transparent
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : undefined
                }
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className={
                  transparent
                    ? "bg-white text-black hover:bg-white/90"
                    : undefined
                }
              >
                <Link href="/signup">Start free</Link>
              </Button>
            </>
          )}
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={
                  transparent
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : undefined
                }
              >
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
