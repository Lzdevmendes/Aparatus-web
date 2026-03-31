"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MenuIcon, Home, Search, LogOut, LogIn, BotMessageSquare, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MenuSheet = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user;

  const handleLogin = async () => {
    const { error } = await authClient.signIn.social({ provider: "google" });
    if (error) toast.error(error.message);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Até logo!");
    router.replace("/login");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <MenuIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="border-border border-b px-5 py-6 text-left">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          {/* User */}
          <div className="flex items-center justify-between px-5">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={session.user.image ?? ""} alt={session.user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {session.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{session.user.name}</p>
                  <p className="text-muted-foreground text-xs">{session.user.email}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold">Olá! Faça seu login</p>
                <Button className="gap-2 rounded-full" onClick={handleLogin}>
                  <LogIn className="size-4" /> Login
                </Button>
              </>
            )}
          </div>

          <div className="border-border border-b" />

          {/* Navigation */}
          <div className="flex flex-col">
            {[
              { href: "/", icon: Home, label: "Início" },
              { href: "/barbershops", icon: Search, label: "Buscar salões" },
              { href: "/chat", icon: BotMessageSquare, label: "Chat com IA" },
              { href: "/profile", icon: User, label: "Perfil" },
            ].map(({ href, icon: Icon, label }) => (
              <SheetClose key={href} asChild>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </SheetClose>
            ))}
          </div>

          {isLoggedIn && (
            <>
              <div className="border-border border-b" />
              <Button
                variant="ghost"
                className="mx-5 justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                Sair da conta
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuSheet;
