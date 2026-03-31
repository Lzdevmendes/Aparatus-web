export const POST = async (request: Request) => {
  const { imageBase64, mimeType = "image/jpeg" } = await request.json();

  if (!imageBase64) {
    return Response.json({ error: "Imagem não fornecida" }, { status: 400 });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              {
                text: `Analise o rosto desta pessoa e retorne um JSON com EXATAMENTE este formato (sem markdown, só JSON puro):
{
  "faceShape": "oval | redondo | quadrado | coração | retangular | diamante | triangular",
  "approximateAge": número,
  "gender": "masculino | feminino",
  "skinTone": "claro | médio | moreno | negro",
  "recommendations": [
    {
      "cut": "nome exato do corte",
      "why": "por que combina com o formato do rosto",
      "style": "clássico | moderno | ousado | casual"
    }
  ],
  "avoid": ["lista de cortes que NÃO combinam"],
  "tip": "dica personalizada de estilo"
}

Forneça 4 a 5 recomendações específicas e reais (ex: Degradê alto, Bob chanel, Corte César, Undercut, Pixie cut, Franja lateral, Long bob, etc). Baseie as recomendações no formato do rosto, idade aproximada e gênero aparente.`,
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!response.ok) {
    return Response.json(
      { error: "Erro ao analisar imagem" },
      { status: 500 },
    );
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  try {
    return Response.json(JSON.parse(text));
  } catch {
    return Response.json({ error: "Resposta inválida da IA" }, { status: 500 });
  }
};
