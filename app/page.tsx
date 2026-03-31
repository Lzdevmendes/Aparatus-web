import Image from "next/image";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getBarbershops, getPopularBarbershops } from "@/data/barbershops";
import BarbershopItem from "@/components/barbershop-item";
import QuickSearch from "@/components/quick-search";
import Footer from "@/components/footer";
import Link from "next/link";
import { Suspense } from "react";
import { MapPin, BotMessageSquare, ScanFace } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PageSectionScroller,
} from "@/components/ui/page";

const CITIES = [
  "Caraguatatuba",
  "Ubatuba",
  "Ilhabela",
  "São Sebastião",
  "Bertioga",
];

export default async function Home() {
  const [session, barbershops, popularBarbershops] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getBarbershops(),
    getPopularBarbershops(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "você";

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <div>
          <p className="text-muted-foreground text-sm">Olá, {firstName} 👋</p>
          <h1 className="text-xl font-bold">BarberSync</h1>
        </div>
        <Link href="/profile">
          <Avatar className="size-10 border-2 border-primary/20">
            <AvatarImage
              src={session?.user?.image ?? ""}
              alt={session?.user?.name ?? ""}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <div className="space-y-8 px-5">
        {/* Search */}
        <Suspense>
          <QuickSearch />
        </Suspense>

        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl">
          <Image
            src="/banner.png"
            alt="BarberSync"
            width={600}
            height={200}
            className="h-auto w-full"
          />
        </div>

        {/* AI Feature cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/chat"
            className="bg-primary flex flex-col gap-2 rounded-2xl p-4"
          >
            <BotMessageSquare className="text-primary-foreground size-6" />
            <div>
              <p className="text-primary-foreground text-sm font-bold leading-tight">
                Chat com IA
              </p>
              <p className="text-primary-foreground/70 text-xs mt-0.5">
                Encontre o salão ideal
              </p>
            </div>
          </Link>
          <Link
            href="/chat"
            className="bg-secondary flex flex-col gap-2 rounded-2xl p-4"
          >
            <ScanFace className="size-6" />
            <div>
              <p className="text-sm font-bold leading-tight">Análise Facial</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Descubra seu corte ideal
              </p>
            </div>
          </Link>
        </div>

        {/* Popular */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Mais populares</h2>
            <Link
              href="/barbershops"
              className="text-primary text-xs font-medium"
            >
              Ver todos
            </Link>
          </div>
          <PageSectionScroller>
            {popularBarbershops.map((b) => (
              <BarbershopItem key={b.id} barbershop={b} />
            ))}
          </PageSectionScroller>
        </div>

        {/* All */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Estabelecimentos</h2>
            <Link
              href="/barbershops"
              className="text-primary text-xs font-medium"
            >
              Ver todos
            </Link>
          </div>
          <PageSectionScroller>
            {barbershops.map((b) => (
              <BarbershopItem key={b.id} barbershop={b} />
            ))}
          </PageSectionScroller>
        </div>

        {/* Cities */}
        <div className="space-y-3">
          <h2 className="font-bold">Buscar por cidade</h2>
          <div className="grid grid-cols-2 gap-3">
            {CITIES.map((city) => (
              <Link
                key={city}
                href={`/barbershops?city=${encodeURIComponent(city)}`}
                className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4 transition-colors active:bg-accent"
              >
                <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-full">
                  <MapPin className="text-primary size-4" />
                </div>
                <span className="text-sm font-medium">{city}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
