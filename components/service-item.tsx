import Image from "next/image";
import { Button } from "./ui/button";
import { formatCurrency } from "@/lib/utils";
import { BarbershopService } from "@/generated/prisma/client";

interface ServiceItemProps {
  service: BarbershopService;
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="relative h-[110px] w-[110px] shrink-0">
        <Image
          src={service.imageUrl}
          alt={service.name}
          fill
          className="rounded-xl object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold">{service.name}</p>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">
            {formatCurrency(service.priceInCents)}
          </p>
          <Button className="rounded-full" size="sm">
            Reservar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceItem;
