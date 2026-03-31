import Header from "@/components/header";
import Image from "next/image";
import banner from "@/public/banner.png";
import BookingItem from "@/components/booking-item";

import { getBarbershops, getPopularBarbershops } from "@/data/barbershops";
import { getUserBookings } from "@/data/bookings";
import BarbershopItem from "@/components/barbershop-item";
import {
  PageContainer,
  PageSectionContent,
  PageSectionScroller,
  PageSectionTitle,
} from "@/components/ui/page";
import Footer from "@/components/footer";
import QuickSearch from "@/components/quick-search";
import Link from "next/link";
import { Suspense } from "react";
import { MapPin } from "lucide-react";

const CITIES = ["Caraguatatuba", "Ubatuba", "Ilhabela", "São Sebastião", "Bertioga"];

export default async function Home() {
  const [barbershops, popularBarbershops, { confirmedBookings }] = await Promise.all([
    getBarbershops(),
    getPopularBarbershops(),
    getUserBookings(),
  ]);

  return (
    <div>
      <Header />
      <PageContainer>
        <Suspense>
          <QuickSearch />
        </Suspense>

        <Image
          src={banner}
          alt="Agende nos melhores com a BarberSync"
          sizes="100vw"
          className="h-auto w-full"
        />

        {confirmedBookings.length > 0 && (
          <PageSectionContent>
            <PageSectionTitle>Seus agendamentos</PageSectionTitle>
            <PageSectionScroller>
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </PageSectionScroller>
          </PageSectionContent>
        )}

        <PageSectionContent>
          <div className="flex items-center justify-between">
            <PageSectionTitle>Mais populares</PageSectionTitle>
            <Link href="/barbershops" className="text-primary text-xs font-medium">
              Ver todos
            </Link>
          </div>
          <PageSectionScroller>
            {popularBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSectionContent>

        <PageSectionContent>
          <div className="flex items-center justify-between">
            <PageSectionTitle>Estabelecimentos</PageSectionTitle>
            <Link href="/barbershops" className="text-primary text-xs font-medium">
              Ver todos
            </Link>
          </div>
          <PageSectionScroller>
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSectionContent>

        {/* City quick access */}
        <PageSectionContent>
          <PageSectionTitle>Buscar por cidade</PageSectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {CITIES.map((city) => (
              <Link
                key={city}
                href={`/barbershops?city=${encodeURIComponent(city)}`}
                className="border-border bg-card flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
              >
                <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-full">
                  <MapPin className="text-primary size-4" />
                </div>
                <span className="text-sm font-medium">{city}</span>
              </Link>
            ))}
            <Link
              href="/barbershops"
              className="border-border bg-card flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
            >
              <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-full">
                <MapPin className="text-primary size-4" />
              </div>
              <span className="text-sm font-medium">Todos</span>
            </Link>
          </div>
        </PageSectionContent>
      </PageContainer>
      <Footer />
    </div>
  );
}
