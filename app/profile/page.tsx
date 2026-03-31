"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Até logo!");
    router.replace("/login");
  };

  const user = session?.user;

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="size-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold">Perfil</h1>
      </header>

      <div className="flex flex-col gap-6 px-5">
        {/* User card */}
        <div className="bg-card border-border flex items-center gap-4 rounded-3xl border p-5">
          <Avatar className="size-16 border-2 border-primary/20">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "Usuário"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? <User />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">{user?.name ?? "Usuário"}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        {/* App info */}
        <div className="bg-card border-border rounded-3xl border p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase text-muted-foreground">Sobre o app</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Versão</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cobertura</span>
            <span className="font-medium">Litoral Norte SP · Bertioga</span>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="size-4 mr-2" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
