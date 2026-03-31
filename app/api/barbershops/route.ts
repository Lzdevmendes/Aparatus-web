import { NextRequest } from "next/server";
import { searchBarbershops, getPopularBarbershops } from "@/data/barbershops";

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const type = searchParams.get("type");

  if (type === "popular") {
    const barbershops = await getPopularBarbershops();
    return Response.json(barbershops);
  }

  const search = searchParams.get("search") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const gender = searchParams.get("gender") ?? undefined;

  const barbershops = await searchBarbershops({ query: search, city, gender });
  return Response.json(barbershops);
};
