import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Phone, MessageCircle, Users, User, Scissors } from "lucide-react";
import { getBarbershopById } from "@/data/barbershops";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/service-card";
import { SalonGender } from "@/generated/prisma/client";

const GENDER_LABEL: Record<SalonGender, { label: string; color: string }> = {
  MASCULINE: { label: "Barbearia", color: "bg-blue-500/20 text-blue-400" },
  FEMININE: { label: "Salão Feminino", color: "bg-pink-500/20 text-pink-400" },
  UNISEX: { label: "Unissex", color: "bg-purple-500/20 text-purple-400" },
};

const GENDER_ICON: Record<SalonGender, typeof User> = {
  MASCULINE: User,
  FEMININE: Scissors,
  UNISEX: Users,
};

function phoneToWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/55${digits}`;
}

const BarbershopPage = async ({ params }: PageProps<"/barbershops/[id]">) => {
  const { id } = await params;
  const barbershop = await getBarbershopById(id);

  if (!barbershop) notFound();

  const { label, color } = GENDER_LABEL[barbershop.gender];
  const GenderIcon = GENDER_ICON[barbershop.gender];

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Hero */}
      <div className="relative h-72 w-full">
        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />

        {/* Back button */}
        <Link href="/" className="absolute top-12 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
          >
            <ChevronLeft className="size-5" />
          </Button>
        </Link>

        {/* Gender badge */}
        <div
          className={`absolute top-12 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${color}`}
        >
          <GenderIcon className="size-3" />
          {label}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute right-0 bottom-0 left-0 p-5">
          <h1 className="text-2xl font-bold text-white">{barbershop.name}</h1>
          <div className="mt-1 flex items-center gap-1.5">
            <MapPin className="size-3.5 text-white/70" />
            <p className="text-sm text-white/80">
              {barbershop.city} · {barbershop.address}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-background relative z-10 -mt-4 flex-1 rounded-t-3xl">
        <div className="space-y-6 px-5 pt-6">
          {/* About */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sobre
            </h2>
            <p className="text-sm leading-relaxed">{barbershop.description}</p>
          </div>

          <div className="bg-border h-px" />

          {/* Services */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Serviços e preços
            </h2>
            <div className="flex flex-col gap-3">
              {barbershop.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>

          <div className="bg-border h-px" />

          {/* Contact */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Contato
            </h2>
            {barbershop.phones.map((phone, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-primary/10 flex size-9 items-center justify-center rounded-full">
                  <Phone className="text-primary size-4" />
                </div>
                <span className="flex-1 text-sm font-medium">{phone}</span>
                <Link
                  href={phoneToWhatsApp(phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full border-green-500/30 text-green-500 hover:bg-green-500/10"
                  >
                    <MessageCircle className="size-3.5" />
                    WhatsApp
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={`/chat?q=Quero conhecer mais sobre ${barbershop.name} em ${barbershop.city}`}
          >
            <Button className="w-full rounded-2xl h-12 gap-2 mt-2">
              <MessageCircle className="size-4" />
              Perguntar ao assistente IA
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BarbershopPage;
