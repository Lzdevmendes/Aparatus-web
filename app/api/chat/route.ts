import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getDateAvailableTimeSlots } from "@/actions/get-date-available-time-slots";
import { createBooking } from "@/actions/create-booking";

export const GET = async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return Response.json([]);

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
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
    system: `Você é o BarberSync, um assistente virtual de agendamento de barbearias e salões de beleza do Litoral Norte de SP e Bertioga.

    DATA ATUAL: Hoje é ${new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} (${new Date().toISOString().split("T")[0]})

    Cidades que você atende: Caraguatatuba, Ubatuba, Ilhabela, São Sebastião e Bertioga.

    Tipos de estabelecimentos:
    - MASCULINE: Barbearias (corte masculino, barba, etc.)
    - FEMININE: Salões de beleza femininos (escova, coloração, manicure, etc.)
    - UNISEX: Estabelecimentos que atendem todos os gêneros

    Seu objetivo é ajudar os usuários a:
    - Encontrar barbearias e salões por cidade, nome ou tipo (masculino/feminino/unissex)
    - Verificar disponibilidade de horários
    - Agendar serviços
    - Analisar o rosto do usuário (via foto) e recomendar os melhores cortes de cabelo

    Fluxo para ANÁLISE FACIAL (quando o usuário enviar uma foto ou pedir recomendação de corte baseada no rosto):
    1. Use a ferramenta analyzeFace passando a imagem em base64
    2. Apresente os resultados de forma amigável:
       - Formato do rosto identificado
       - Cortes recomendados para o formato
       - Estilos que combinam com a idade aproximada
    3. Pergunte se deseja agendar algum dos cortes recomendados
    4. Se sim, inicie o fluxo de agendamento normal

    Fluxo de AGENDAMENTO:
    CENÁRIO 1 - Usuário menciona data/horário:
    1. Use searchBarbershops para buscar estabelecimentos (filtre por cidade e gênero se mencionados)
    2. Use getAvailableTimeSlotsForBarbershop para CADA estabelecimento retornado
    3. Apresente APENAS os que têm horários disponíveis com: nome, cidade, endereço, serviços e preços, alguns horários (4-5 opções)

    CENÁRIO 2 - Usuário não menciona data:
    1. Use searchBarbershops para mostrar os estabelecimentos
    2. Quando o usuário escolher e mencionar data, use getAvailableTimeSlotsForBarbershop
    3. Apresente os horários disponíveis

    Resumo final (quando escolher):
    - Nome do estabelecimento e cidade
    - Serviço escolhido
    - Data e horário
    - Preço

    Criação da reserva:
    - Após confirmação explícita, use createBooking
    - Se sucesso, confirme a reserva
    - Se erro "User must be logged in", informe que é necessário fazer login

    Importante:
    - NUNCA mostre IDs técnicos ao usuário
    - Seja educado, informal e amigável
    - Sugira apenas 4-5 horários espaçados, não todos
    - Se não houver horários, sugira outra data
    - Quando usuário disser "hoje", "amanhã", "sexta", etc. calcule a data correta
    - Deixe claro que atende tanto homens quanto mulheres`,
    tools: {
      searchBarbershops: tool({
        description:
          "Pesquisa barbearias e salões. Pode filtrar por nome, cidade e tipo (MASCULINE, FEMININE, UNISEX).",
        inputSchema: z.object({
          name: z.string().optional().describe("Nome do estabelecimento"),
          city: z
            .string()
            .optional()
            .describe(
              "Cidade: Caraguatatuba, Ubatuba, Ilhabela, São Sebastião ou Bertioga",
            ),
          gender: z
            .enum(["MASCULINE", "FEMININE", "UNISEX"])
            .optional()
            .describe("Tipo de estabelecimento"),
        }),
        execute: async ({ name, city, gender }) => {
          return await prisma.barbershop.findMany({
            where: {
              ...(name && { name: { contains: name, mode: "insensitive" } }),
              ...(city && { city: { contains: city, mode: "insensitive" } }),
              ...(gender && { gender }),
            },
            include: { services: { where: { deletedAt: null } } },
          });
        },
      }),

      getAvailableTimeSlotsForBarbershop: tool({
        description: "Obtém horários disponíveis para um estabelecimento em uma data.",
        inputSchema: z.object({
          barbershopId: z.string().uuid(),
          date: z.string().describe("Data no formato ISO (YYYY-MM-DD)"),
        }),
        execute: async ({ barbershopId, date }) => {
          const availableTimeSlots = await getDateAvailableTimeSlots({
            barbershopId,
            date: new Date(date),
          });
          return { barbershopId, date, availableTimeSlots };
        },
      }),

      createBooking: tool({
        description: "Cria um agendamento para um serviço específico.",
        inputSchema: z.object({
          serviceId: z.uuid(),
          date: z.string().describe("Data e hora no formato ISO (YYYY-MM-DDTHH:mm:ss)"),
        }),
        execute: async ({ serviceId, date }) => {
          try {
            await createBooking({ serviceId, date: new Date(date) });
            return { success: true };
          } catch (error) {
            console.error("createBooking error", error);
            return { success: false };
          }
        },
      }),

      analyzeFace: tool({
        description:
          "Analisa o formato do rosto de uma foto e recomenda os melhores cortes de cabelo baseados no formato do rosto, gênero aparente e idade aproximada.",
        inputSchema: z.object({
          imageBase64: z
            .string()
            .describe("Imagem em base64 (sem o prefixo data:image/...)"),
          mimeType: z
            .string()
            .default("image/jpeg")
            .describe("Tipo MIME da imagem"),
        }),
        execute: async ({ imageBase64, mimeType }) => {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          inlineData: {
                            mimeType,
                            data: imageBase64,
                          },
                        },
                        {
                          text: `Analise esta foto e responda em JSON com o seguinte formato:
{
  "faceShape": "oval | redondo | quadrado | coração | retangular | diamante | triangular",
  "approximateAge": número,
  "gender": "masculino | feminino | não identificado",
  "recommendations": [
    {
      "cut": "nome do corte",
      "description": "por que esse corte combina com o formato de rosto",
      "style": "clássico | moderno | ousado"
    }
  ],
  "avoid": ["cortes que NÃO combinam e por quê"]
}
Forneça 4-5 recomendações de cortes ideais para o formato de rosto identificado, levando em conta a idade aproximada e o gênero. Seja específico nos nomes dos cortes (ex: "Degradê alto", "Bob chanel", "Corte César", "Undercut", etc).`,
                        },
                      ],
                    },
                  ],
                  generationConfig: { responseMimeType: "application/json" },
                }),
              },
            );

            const data = await response.json();
            const text =
              data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
            return JSON.parse(text);
          } catch (error) {
            console.error("analyzeFace error", error);
            return {
              error: "Não foi possível analisar a imagem. Tente novamente.",
            };
          }
        },
      }),
    },
    onFinish: async ({ text }) => {
      if (!session?.user?.id) return;

      const lastUserMessage = messages[messages.length - 1];
      const userText =
        lastUserMessage?.parts
          ?.filter((p: { type: string }) => p.type === "text")
          ?.map((p: { type: string; text: string }) => p.text)
          ?.join("") ?? "";

      if (!userText && !text) return;

      await prisma.chatMessage.createMany({
        data: [
          ...(userText
            ? [{ userId: session.user.id, role: "user", content: userText }]
            : []),
          ...(text
            ? [{ userId: session.user.id, role: "assistant", content: text }]
            : []),
        ],
      });
    },
  });

  return result.toUIMessageStreamResponse();
};
