"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BotMessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/barbershops", icon: Search, label: "Buscar" },
  { href: "/chat", icon: BotMessageSquare, label: "Chat IA", primary: true },
  { href: "/profile", icon: User, label: "Perfil" },
];

export const BottomNav = () => {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="bg-background/95 border-border fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center border-t backdrop-blur-md">
      {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        if (primary) {
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1"
            >
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-primary/15 text-primary",
                )}
              >
                <Icon className="size-5" />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
