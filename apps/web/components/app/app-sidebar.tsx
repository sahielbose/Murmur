"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Library,
  Sparkles,
  ListChecks,
  LayoutTemplate,
  Users,
  Tag,
  Trash2,
  Mic,
  Upload,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { devSignOut } from "@/lib/auth/actions";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = { label: string; href: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Library", href: "/app/library", icon: Library },
  { label: "Ask", href: "/app/ask", icon: Sparkles },
  { label: "Tasks", href: "/app/tasks", icon: ListChecks },
  { label: "Templates", href: "/app/templates", icon: LayoutTemplate },
  { label: "Speakers", href: "/app/speakers", icon: Users },
  { label: "Tags", href: "/app/tags", icon: Tag },
  { label: "Trash", href: "/app/trash", icon: Trash2 },
];

export type SidebarUser = {
  name: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
};

const DEFAULT_USER: SidebarUser = {
  name: "You",
  email: "you@murmur.app",
  plan: "free",
};

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Shared sidebar body — used by the desktop rail and the mobile drawer. */
export function AppSidebarContent({
  user = DEFAULT_USER,
  onNavigate,
}: {
  user?: SidebarUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="px-2 pt-2">
        <Wordmark href="/app" />
      </div>

      <div className="flex flex-col gap-2 px-1">
        <Button asChild className="justify-start" onClick={onNavigate}>
          <Link href="/app/record">
            <Mic className="h-4 w-4" />
            New recording
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="justify-start"
          onClick={onNavigate}
        >
          <Link href="/app/upload">
            <Upload className="h-4 w-4" />
            Upload
          </Link>
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-1",
                active
                  ? "bg-bg-subtle font-medium text-fg"
                  : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-border px-1 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex min-w-0 items-center gap-2 rounded-md p-1 text-left hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-fg">
                  {user.name}
                </p>
                <p className="truncate text-xs text-fg-subtle">{user.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>
              <span className="capitalize">{user.plan}</span> plan
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void devSignOut()}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2">
          <Badge variant={user.plan === "free" ? "outline" : "default"}>
            {user.plan === "free" ? "Free" : "Pro"}
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

/** Desktop sidebar rail (~260px). Hidden under md; the drawer takes over. */
export function AppSidebar({ user }: { user?: SidebarUser }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-bg md:block">
      <div className="sticky top-0 h-screen">
        <AppSidebarContent user={user} />
      </div>
    </aside>
  );
}
