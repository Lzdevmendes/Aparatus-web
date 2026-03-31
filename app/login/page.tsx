"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) router.replace("/");
  }, [session, router]);

  const handleGoogle = async () => {
    setIsLoading(true);
    const { error } = await authClient.signIn.social({ provider: "google" });
    if (error) {
      toast.error("Erro ao entrar com Google. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (isPending || session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=90"
          alt="BarberSync"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
      </div>

      {/* Top branding */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 pt-16 text-center">
        <Image
          src="/logo.svg"
          alt="BarberSync"
          width={160}
          height={42}
          className="brightness-0 invert"
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Seu salão favorito,
            <br />a um toque
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Descubra as melhores barbearias e salões do Litoral Norte de SP e Bertioga
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-4 flex flex-col gap-3 w-full max-w-xs">
          {[
            { emoji: "📍", text: "Encontre salões perto de você" },
            { emoji: "🤖", text: "IA recomenda o melhor corte" },
            { emoji: "🪞", text: "Experimente estilos com análise facial" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-white text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login card */}
      <div className="bg-background rounded-t-[2rem] px-6 pb-10 pt-8">
        <div className="mx-auto max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo!</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Entre para acessar todos os recursos do BarberSync
            </p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border bg-white py-4 text-sm font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-zinc-500" />
            ) : (
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Entrar com Google
          </button>

          <p className="text-muted-foreground text-center text-xs">
            Ao entrar, você concorda com os nossos{" "}
            <span className="underline">Termos de Uso</span> e{" "}
            <span className="underline">Política de Privacidade</span>
          </p>
        </div>
      </div>
    </div>
  );
}
