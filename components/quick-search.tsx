"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { PageSectionScroller } from "./ui/page";
import {
  Scissors,
  Sparkles,
  User,
  Eye,
  Waves,
  Footprints,
  MapPin,
  Users,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SearchIcon } from "lucide-react";

const CITIES = [
  { label: "Caraguatatuba", short: "Cará" },
  { label: "Ubatuba", short: "Ubatuba" },
  { label: "Ilhabela", short: "Ilha" },
  { label: "São Sebastião", short: "S. Sebá" },
  { label: "Bertioga", short: "Bertioga" },
];

const SERVICES = [
  { label: "Corte", icon: Scissors, query: "corte" },
  { label: "Barba", icon: User, query: "barba" },
  { label: "Coloração", icon: Sparkles, query: "coloração" },
  { label: "Escova", icon: Waves, query: "escova" },
  { label: "Sobrancelha", icon: Eye, query: "sobrancelha" },
  { label: "Manicure", icon: Footprints, query: "manicure" },
  { label: "Unissex", icon: Users, query: "unissex" },
];

const QuickSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get("city") ?? "";
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (currentCity) params.set("city", currentCity);
    router.push(`/barbershops?${params.toString()}`);
  };

  const buildCityUrl = (city: string) => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (searchValue.trim()) params.set("search", searchValue.trim());
    return `/barbershops?${params.toString()}`;
  };

  return (
    <>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <Input
          className="border-border rounded-full"
          placeholder="Buscar por serviço, barbearia ou cidade..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button type="submit" className="size-10 shrink-0 rounded-full">
          <SearchIcon />
        </Button>
      </form>

      {/* City filters */}
      <PageSectionScroller>
        <Link
          href="/barbershops"
          className={`border-border flex shrink-0 items-center gap-2 rounded-3xl border px-4 py-2 text-sm font-medium transition-colors ${
            !currentCity
              ? "bg-primary text-primary-foreground"
              : "bg-card-background text-card-foreground"
          }`}
        >
          <MapPin className="size-4" />
          Todos
        </Link>
        {CITIES.map((city) => (
          <Link
            key={city.label}
            href={buildCityUrl(city.label)}
            className={`border-border flex shrink-0 items-center gap-2 rounded-3xl border px-4 py-2 text-sm font-medium transition-colors ${
              currentCity === city.label
                ? "bg-primary text-primary-foreground"
                : "bg-card-background text-card-foreground"
            }`}
          >
            {city.short}
          </Link>
        ))}
      </PageSectionScroller>

      {/* Service quick links */}
      <PageSectionScroller>
        {SERVICES.map(({ label, icon: Icon, query }) => (
          <Link
            key={query}
            href={`/barbershops?search=${query}${currentCity ? `&city=${encodeURIComponent(currentCity)}` : ""}`}
            className="border-border bg-card-background flex shrink-0 items-center gap-2 rounded-3xl border px-4 py-2"
          >
            <Icon className="size-4" />
            <span className="text-card-foreground text-sm font-medium">{label}</span>
          </Link>
        ))}
      </PageSectionScroller>
    </>
  );
};

export default QuickSearch;
