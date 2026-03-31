import Header from "@/components/header";
import Footer from "@/components/footer";
import BarbershopItem from "@/components/barbershop-item";
import QuickSearch from "@/components/quick-search";
import { searchBarbershops } from "@/data/barbershops";
import {
  PageContainer,
  PageSectionContent,
  PageSectionTitle,
} from "@/components/ui/page";
import { Suspense } from "react";

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string;
    city?: string;
    gender?: string;
  }>;
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const { search, city, gender } = await searchParams;

  const barbershops = await searchBarbershops({
    query: search,
    city,
    gender,
  });

  const hasFilters = search || city || gender;

  const titleParts: string[] = [];
  if (search) titleParts.push(`"${search}"`);
  if (city) titleParts.push(city);
  if (gender) titleParts.push(gender);
  const title = hasFilters
    ? `Resultados para ${titleParts.join(" · ")}`
    : "Todos os estabelecimentos";

  return (
    <div>
      <Header />
      <PageContainer>
        <Suspense>
          <QuickSearch />
        </Suspense>
        <PageSectionContent>
          <PageSectionTitle>{title}</PageSectionTitle>
          {barbershops.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum estabelecimento encontrado. Tente outro filtro.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4 text-xs">
                {barbershops.length}{" "}
                {barbershops.length === 1 ? "estabelecimento encontrado" : "estabelecimentos encontrados"}
              </p>
              <div className="grid grid-cols-1 gap-4">
                {barbershops.map((barbershop) => (
                  <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                ))}
              </div>
            </>
          )}
        </PageSectionContent>
      </PageContainer>
      <Footer />
    </div>
  );
};

export default BarbershopsPage;
