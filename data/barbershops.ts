import { SalonGender } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const getBarbershops = async (city?: string) => {
  return prisma.barbershop.findMany({
    where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    take: 12,
  });
};

export const getPopularBarbershops = async (city?: string) => {
  return prisma.barbershop.findMany({
    where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
    orderBy: { bookings: { _count: "desc" } },
    take: 12,
  });
};

export const getBarbershopById = async (id: string) => {
  return prisma.barbershop.findUnique({
    where: { id },
    include: { services: { where: { deletedAt: null } } },
  });
};

export const searchBarbershops = async (params: {
  query?: string;
  city?: string;
  gender?: string;
}) => {
  const { query, city, gender } = params;

  const genderMap: Record<string, SalonGender> = {
    masculino: SalonGender.MASCULINE,
    feminino: SalonGender.FEMININE,
    unissex: SalonGender.UNISEX,
    masculine: SalonGender.MASCULINE,
    feminine: SalonGender.FEMININE,
    unisex: SalonGender.UNISEX,
  };

  const parsedGender = gender ? genderMap[gender.toLowerCase()] : undefined;

  return prisma.barbershop.findMany({
    where: {
      AND: [
        city ? { city: { contains: city, mode: "insensitive" } } : {},
        parsedGender ? { gender: parsedGender } : {},
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { city: { contains: query, mode: "insensitive" } },
                { address: { contains: query, mode: "insensitive" } },
                {
                  services: {
                    some: {
                      name: { contains: query, mode: "insensitive" },
                      deletedAt: null,
                    },
                  },
                },
              ],
            }
          : {},
      ],
    },
    orderBy: [{ bookings: { _count: "desc" } }, { name: "asc" }],
  });
};

// Mantido por compatibilidade com QuickSearch
export const getBarbershopsByServiceName = async (serviceName: string) => {
  return searchBarbershops({ query: serviceName });
};

export const getCities = async (): Promise<string[]> => {
  const result = await prisma.barbershop.findMany({
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return result.map((r) => r.city);
};
