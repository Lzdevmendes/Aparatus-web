import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return Response.json([]);

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return Response.json(
    messages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text", text: m.content }],
      createdAt: m.createdAt,
    })),
  );
};

export const POST = async (request: Request) => {
  const { messages } = await request.json();
  const session = await auth.api.getSession({ headers: request.headers });

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    system: `Você é o assistente de beleza do BarberSync, o app de descoberta de barbearias e salões do Litoral Norte de SP e Bertioga.

DATA ATUAL: ${new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

Cidades disponíveis: Caraguatatuba, Ubatuba, Ilhabela, São Sebastião e Bertioga.

Tipos de estabelecimentos:
- MASCULINE: Barbearias (corte masculino, barba)
- FEMININE: Salões femininos (escova, coloração, manicure)
- UNISEX: Atende todos os gêneros

Suas funções são:
1. Ajudar o usuário a DESCOBRIR barbearias e salões por cidade, tipo ou serviço
2. Recomendar cortes de cabelo baseado em preferências
3. Analisar o rosto do usuário (via foto) e sugerir estilos ideais

IMPORTANTE: Este app é apenas para DESCOBERTA de estabelecimentos. Não há agendamento online.
Quando o usuário quiser marcar horário, oriente-o a entrar em contato diretamente pelo WhatsApp do estabelecimento.

Ao apresentar um estabelecimento, mostre:
- Nome e cidade
- Tipo (barbearia/salão/unissex)
- Endereço
- Serviços e preços relevantes
- Telefone para contato via WhatsApp

Para análise facial:
1. Use a ferramenta analyzeFace quando o usuário enviar uma foto ou pedir análise de corte baseada no rosto
2. Apresente os resultados de forma amigável com os cortes recomendados
3. Mostre para qual tipo de estabelecimento encaminhar o usuário (masculino/feminino/unissex)

Seja sempre:
- Informal e amigável (tutear o usuário)
- Útil e objetivo
- Em português do Brasil`,

    tools: {
      searchEstablishments: tool({
        description: "Busca barbearias e salões. Filtra por nome, cidade e tipo.",
        inputSchema: z.object({
          query: z.string().optional().describe("Nome do estabelecimento ou serviço"),
          city: z.string().optional().describe("Cidade: Caraguatatuba, Ubatuba, Ilhabela, São Sebastião ou Bertioga"),
          gender: z.enum(["MASCULINE", "FEMININE", "UNISEX"]).optional().describe("Tipo: MASCULINE, FEMININE ou UNISEX"),
        }),
        execute: async ({ query, city, gender }) => {
          const results = await prisma.barbershop.findMany({
            where: {
              AND: [
                city ? { city: { contains: city, mode: "insensitive" } } : {},
                gender ? { gender } : {},
                query ? {
                  OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { city: { contains: query, mode: "insensitive" } },
                    { services: { some: { name: { contains: query, mode: "insensitive" }, deletedAt: null } } },
                  ],
                } : {},
              ],
            },
            include: { services: { where: { deletedAt: null } } },
            orderBy: [{ bookings: { _count: "desc" } }, { name: "asc" }],
            take: 10,
          });
          return results;
        },
      }),

      analyzeFace: tool({
        description: "Analisa o formato do rosto via foto e recomenda os melhores cortes de cabelo.",
        inputSchema: z.object({
          imageBase64: z.string().describe("Imagem em base64"),
          mimeType: z.string().default("image/jpeg"),
        }),
        execute: async ({ imageBase64, mimeType }) => {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{
                    parts: [
                      { inlineData: { mimeType, data: imageBase64 } },
                      {
                        text: `Analise este rosto e retorne JSON puro:
{
  "faceShape": "oval|redondo|quadrado|coração|retangular|diamante|triangular",
  "approximateAge": número,
  "gender": "masculino|feminino",
  "recommendations": [{"cut": "nome", "why": "motivo", "style": "clássico|moderno|ousado|casual"}],
  "avoid": ["cortes a evitar"],
  "tip": "dica personalizada",
  "establishmentType": "MASCULINE|FEMININE|UNISEX"
}
Dê 4-5 recomendações específicas baseadas no formato do rosto, idade e gênero.`,
                      },
                    ],
                  }],
                  generationConfig: { responseMimeType: "application/json" },
                }),
              },
            );
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
            return JSON.parse(text);
          } catch {
            return { error: "Não foi possível analisar a imagem." };
          }
        },
      }),
    },

    onFinish: async ({ text }) => {
      if (!session?.user?.id) return;
      const lastMsg = messages[messages.length - 1];
      const userText = lastMsg?.parts
        ?.filter((p: { type: string }) => p.type === "text")
        ?.map((p: { type: string; text: string }) => p.text)
        ?.join("") ?? "";

      if (!userText && !text) return;
      await prisma.chatMessage.createMany({
        data: [
          ...(userText ? [{ userId: session.user.id, role: "user", content: userText }] : []),
          ...(text ? [{ userId: session.user.id, role: "assistant", content: text }] : []),
        ],
      });
    },
  });

  return result.toUIMessageStreamResponse();
};
