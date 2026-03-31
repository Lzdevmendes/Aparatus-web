import { BarbershopService } from "@/generated/prisma/client";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface ServiceCardProps {
  service: BarbershopService;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="border-border flex items-center gap-4 rounded-2xl border p-3">
      <div className="relative size-[68px] shrink-0 overflow-hidden rounded-xl">
        <Image
          src={service.imageUrl}
          alt={service.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <h3 className="truncate text-sm font-semibold">{service.name}</h3>
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {service.description}
        </p>
      </div>
      <span className="text-primary shrink-0 text-sm font-bold">
        {formatCurrency(service.priceInCents / 100)}
      </span>
    </div>
  );
};

export default ServiceCard;
