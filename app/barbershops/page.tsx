import Header from "@/components/header";
import Footer from "@/components/footer";
import BarbershopItem from "@/components/barbershop-item";
import QuickSearch from "@/components/quick-search";
import { searchBarbershops } from "@/data/barbershops";
import { PageSectionContent, PageSectionTitle } from "@/components/ui/page";
import { Suspense } from "react";

interface BarbershopsPageProps {
  searchParams: Promise<{ search?: string; city?: string; gender?: string }>;
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const { search, city, gender } = await searchParams;

  const barbershops = await searchBarbershops({ query: search, city, gender });

  const titleParts: string[] = [];
  if (search) titleParts.push(`"${search}"`);
  if (city) titleParts.push(city);
  const title =
    titleParts.length > 0
      ? `Resultados · ${titleParts.join(" · ")}`
      : "Todos os estabelecimentos";

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <div className="space-y-6 p-5">
        <Suspense>
          <QuickSearch />
        </Suspense>

        <PageSectionContent>
          <div className="flex items-center justify-between">
            <PageSectionTitle>{title}</PageSectionTitle>
            <span className="text-muted-foreground text-xs">
              {barbershops.length}{" "}
              {barbershops.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {barbershops.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum estabelecimento encontrado.
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Tente outro filtro ou cidade.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {barbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>
          )}
        </PageSectionContent>
      </div>
      <Footer />
    </div>
  );
};

export default BarbershopsPage;
