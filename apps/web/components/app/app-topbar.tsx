"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebarContent, type SidebarUser } from "./app-sidebar";

const TITLES: Record<string, string> = {
  "/app": "Home",
  "/app/record": "Record",
  "/app/upload": "Upload",
  "/app/library": "Library",
  "/app/ask": "Ask Murmur",
  "/app/tasks": "Tasks",
  "/app/templates": "Templates",
  "/app/speakers": "Speakers",
  "/app/tags": "Tags",
  "/app/trash": "Trash",
  "/app/settings": "Settings",
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/app/recordings")) return "Recording";
  return "Murmur";
}

/**
 * App top bar (MURMUR_UI.md §9): mobile menu drawer, a global search field with
 * a ⌘K affordance (the command palette is wired in Phase 13), a context title,
 * and a compact Record button available on every screen.
 */
export function AppTopBar({ user }: { user?: SidebarUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-nav items-center gap-3 border-b border-border bg-bg px-4">
      <div className="md:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <AppSidebarContent
              user={user}
              onNavigate={() => setMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <button
        type="button"
        aria-label="Search your conversations"
        onClick={() => window.dispatchEvent(new Event("murmur:open-search"))}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border bg-bg px-3 text-sm text-fg-subtle transition-colors hover:bg-bg-subtle"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">
          Search your conversations
        </span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-sans text-[11px] text-fg-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      <span className="ml-1 hidden text-sm text-fg-muted lg:inline">
        {titleFor(pathname)}
      </span>

      <div className="ml-auto">
        <Button asChild size="sm">
          <Link href="/app/record">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Record</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
