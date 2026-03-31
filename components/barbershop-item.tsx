import { Barbershop, SalonGender } from "@/generated/prisma/client";
import { MapPin, Scissors, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BarbershopItemProps {
  barbershop: Barbershop;
}

const GENDER_CONFIG: Record<SalonGender, { label: string; Icon: typeof Scissors }> = {
  MASCULINE: { label: "Barbearia", Icon: User },
  FEMININE: { label: "Salão", Icon: Scissors },
  UNISEX: { label: "Unissex", Icon: Users },
};

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  const { label, Icon } = GENDER_CONFIG[barbershop.gender];

  return (
    <Link
      href={`/barbershops/${barbershop.id}`}
      className="relative min-h-[200px] min-w-[290px] rounded-xl"
    >
      <div className="absolute inset-0 z-10 rounded-xl bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      <Image
        src={barbershop.imageUrl}
        alt={barbershop.name}
        fill
        className="rounded-xl object-cover"
      />

      {/* Gender badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
        <Icon className="size-3 text-white" />
        <span className="text-xs font-medium text-white">{label}</span>
      </div>

      <div className="absolute right-0 bottom-0 left-0 z-20 p-4">
        <h3 className="text-background text-lg font-bold leading-tight">
          {barbershop.name}
        </h3>
        <div className="mt-1 flex items-center gap-1">
          <MapPin className="size-3 text-white/70" />
          <p className="text-xs text-white/70">
            {barbershop.city} · {barbershop.address}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BarbershopItem;
