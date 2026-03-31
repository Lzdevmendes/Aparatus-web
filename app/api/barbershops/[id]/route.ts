import { getBarbershopById } from "@/data/barbershops";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const barbershop = await getBarbershopById(id);

  if (!barbershop) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(barbershop);
};
