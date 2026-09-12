"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LifeBuoy, Menu, Search, X } from "lucide-react";
import { buttonClass, cn } from "./ui";
import { SignOutButton } from "./auth/sign-out-button";

/**
 * Header navigation.
 *
 * Grouped the same way as the footer so the two taxonomies never drift. "I kena
 * already" is deliberately pulled out of the groups and given its own calm
 * button: someone who has just lost money should not have to find it inside a
 * hover menu, and it should not look like the playful parts of the site.
 */

type NavItem = { href: string; label: string; hint?: string };
type NavGroup = { label: string; href?: string; items?: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "The tea",
    items: [
      { href: "/tea", label: "Scam Tea feed", hint: "Every story, every platform" },
      { href: "/trends", label: "One Scam, Many Stories", hint: "The same scam, retold" },
      { href: "/weekly", label: "Kena Weekly", hint: "We did the doomscrolling" },
    ],
  },
  {
    label: "The numbers",
    items: [
      { href: "/radar", label: "Scam Radar", hint: "What's popping off where" },
      { href: "/pulse", label: "Malaysia Scam Pulse", hint: "The numbers behind the tea" },
    ],
  },
  {
    label: "Join in",
    items: [
      { href: "/share", label: "Spill scam tea", hint: "Share your story" },
      { href: "/share?tab=community", label: "Community stories", hint: "What people posted" },
      { href: "/game", label: "Kena or Not?", hint: "Think you won't kena? Bet." },
    ],
  },
  { label: "About", href: "/about" },
];

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-baseline gap-2.5">
      <span className="font-display text-[25px] font-extrabold leading-none tracking-[-0.05em]">
        Kena<span className="text-purple-600">Scam</span>
      </span>
      {compact ? null : (
        <span className="hidden text-[11px] font-semibold text-ink-muted lg:inline">
          One scam, many stories.
        </span>
      )}
    </Link>
  );
}

export function SiteNav({ user }: { user: { name: string } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => {
    const path = href.split("?")[0].split("#")[0];
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  const groupActive = (group: NavGroup) =>
    group.href ? isActive(group.href) : (group.items ?? []).some((item) => isActive(item.href));

  // Close on outside click or Escape. A menu that only closes by re-clicking
  // its own trigger reads as broken.
  useEffect(() => {
    if (!menu) return;
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // Navigating away must dismiss both menus, or a panel hangs over the new page.
  useEffect(() => {
    setMenu(null);
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  // A grace period so the pointer can travel from trigger into panel without
  // the panel vanishing underneath it.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="shell flex h-[68px] items-center justify-between gap-4">
        <Wordmark />

        <nav
          ref={navRef}
          className="hidden shrink-0 items-center gap-4 md:flex lg:gap-6"
          aria-label="Main"
        >
          {GROUPS.map((group) => {
            const active = groupActive(group);

            if (!group.items) {
              return (
                <Link
                  key={group.label}
                  href={group.href!}
                  className={cn(
                    "relative whitespace-nowrap py-1 text-body font-semibold transition hover:text-purple-700",
                    active ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {group.label}
                  {active ? (
                    <span className="absolute -bottom-[3px] left-0 h-[2.5px] w-full rounded-pill bg-purple-600" />
                  ) : null}
                </Link>
              );
            }

            const isOpen = menu === group.label;
            return (
              <div
                key={group.label}
                className="relative"
                onPointerEnter={() => {
                  cancelClose();
                  setMenu(group.label);
                }}
                onPointerLeave={scheduleClose}
              >
                <button
                  type="button"
                  // Hover alone is unusable on touch and unreachable by
                  // keyboard, so the trigger is a real button too.
                  onClick={() => setMenu(isOpen ? null : group.label)}
                  onFocus={() => {
                    cancelClose();
                    setMenu(group.label);
                  }}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  className={cn(
                    "relative flex items-center gap-1 whitespace-nowrap py-1 text-body font-semibold transition hover:text-purple-700",
                    active ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {group.label}
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition", isOpen && "rotate-180")}
                    strokeWidth={2.6}
                  />
                  {active ? (
                    <span className="absolute -bottom-[3px] left-0 h-[2.5px] w-[calc(100%-18px)] rounded-pill bg-purple-600" />
                  ) : null}
                </button>

                {isOpen ? (
                  <div
                    role="menu"
                    aria-label={group.label}
                    onPointerEnter={cancelClose}
                    onPointerLeave={scheduleClose}
                    className="absolute left-0 top-full z-50 mt-2 w-[272px] overflow-hidden rounded-card border border-line bg-white p-1.5 shadow-lift"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setMenu(null)}
                        className={cn(
                          "block rounded-chip px-3 py-2.5 transition hover:bg-paper-tint",
                          isActive(item.href) && "bg-purple-50"
                        )}
                      >
                        <span
                          className={cn(
                            "block text-body font-bold",
                            isActive(item.href) ? "text-purple-700" : "text-ink"
                          )}
                        >
                          {item.label}
                        </span>
                        {item.hint ? (
                          <span className="mt-0.5 block text-micro text-ink-muted">{item.hint}</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/tea"
            aria-label="Search the scam tea"
            className="hidden h-9 w-9 items-center justify-center rounded-pill text-ink-muted transition hover:bg-paper-tint hover:text-purple-700 sm:inline-flex"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.3} />
          </Link>

          {/* Calm, plain, and never styled like the playful buttons.
              On a phone the full label wraps onto two lines and swallows the
              header, so it shortens to "I kena" there and keeps the icon. */}
          <Link
            href="/kena"
            aria-label="I kena already"
            className={cn(
              buttonClass("ghost", "sm"),
              "shrink-0 whitespace-nowrap border-purple-300 px-2.5 text-purple-700 sm:px-3.5"
            )}
          >
            <LifeBuoy className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
            <span className="sm:hidden">I kena</span>
            <span className="hidden sm:inline">I kena already</span>
          </Link>

          <Link href="/share" className={cn(buttonClass("dark", "sm"), "hidden sm:inline-flex")}>
            Spill the tea
          </Link>

          {/* Identity sits furthest right, after the actions — it says who you
              are rather than offering something to do, so it reads as the end
              of the row rather than another button in the middle of it. */}
          {user ? (
            <span className="hidden items-center gap-2 border-l border-line pl-2 sm:inline-flex">
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-purple-200 text-[11px] font-extrabold text-purple-900"
                aria-hidden="true"
              >
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[8rem] truncate text-micro font-bold text-ink lg:inline">
                {user.name}
              </span>
              <SignOutButton />
            </span>
          ) : (
            <Link
              href="/signin"
              className={cn(buttonClass("ghost", "sm"), "hidden sm:inline-flex")}
            >
              Sign in
            </Link>
          )}

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-pill text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile: the same groups as an accordion. Hover panels do not exist on
          touch, so each group expands in place instead. */}
      {open ? (
        <nav
          className="max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-line bg-white px-5 py-3 md:hidden"
          aria-label="Main"
        >
          {GROUPS.map((group) => {
            if (!group.items) {
              return (
                <Link
                  key={group.label}
                  href={group.href!}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-chip px-3 py-2.5 text-body font-semibold",
                    groupActive(group) ? "bg-purple-50 text-purple-700" : "text-ink"
                  )}
                >
                  {group.label}
                </Link>
              );
            }

            const isExpanded = expanded === group.label;
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : group.label)}
                  aria-expanded={isExpanded}
                  className={cn(
                    "flex w-full items-center justify-between rounded-chip px-3 py-2.5 text-left text-body font-semibold",
                    groupActive(group) ? "text-purple-700" : "text-ink"
                  )}
                >
                  {group.label}
                  <ChevronDown
                    className={cn("h-4 w-4 transition", isExpanded && "rotate-180")}
                    strokeWidth={2.6}
                  />
                </button>
                {isExpanded ? (
                  <div className="mb-1 ml-3 border-l border-line pl-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block rounded-chip px-3 py-2 text-body font-semibold",
                          isActive(item.href) ? "bg-purple-50 text-purple-700" : "text-ink-muted"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          <Link
            href="/share"
            onClick={() => setOpen(false)}
            className={cn(buttonClass("dark", "md"), "mt-2 w-full")}
          >
            Spill scam tea ☕
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
