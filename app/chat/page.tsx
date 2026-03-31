"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { BotMessageSquare, ChevronLeft, Send, ScanFace } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

import { Button } from "@/components/ui/button";
import { FaceScanModal } from "@/components/face-scan-modal";

type FaceAnalysis = {
  faceShape: string;
  approximateAge: number;
  gender: string;
  skinTone: string;
  recommendations: Array<{ cut: string; why: string; style: string }>;
  avoid: string[];
  tip: string;
};

const FACE_SHAPE_LABELS: Record<string, string> = {
  oval: "Oval",
  redondo: "Redondo",
  quadrado: "Quadrado",
  "coração": "Coração",
  retangular: "Retangular",
  diamante: "Diamante",
  triangular: "Triangular",
};

const ChatPage = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [showFaceScan, setShowFaceScan] = useState(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMessages(data);
      })
      .catch(() => {});
  }, [setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input.trim() });
      setInput("");
    }
  };

  const handleFaceResult = (analysis: FaceAnalysis) => {
    const cuts = analysis.recommendations.map((r) => `• **${r.cut}** (${r.style}): ${r.why}`).join("\n");
    const avoid = analysis.avoid?.join(", ");

    const resultText = `🔬 **Análise Facial Concluída**

**Formato do rosto:** ${FACE_SHAPE_LABELS[analysis.faceShape] ?? analysis.faceShape}
**Idade aproximada:** ~${analysis.approximateAge} anos
**Tom de pele:** ${analysis.skinTone}

**✂️ Cortes recomendados para você:**
${cuts}

${avoid ? `**❌ Evite:** ${avoid}` : ""}

💡 **Dica personalizada:** ${analysis.tip}

---
Quer que eu encontre um salão disponível para um desses cortes? Me diga qual te interessou e em qual cidade você está! 😊`;

    sendMessage({ text: resultText });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <>
      {showFaceScan && (
        <FaceScanModal
          onClose={() => setShowFaceScan(false)}
          onResult={handleFaceResult}
        />
      )}

      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="size-6">
              <ChevronLeft className="size-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">BarberSync</h1>
          <div className="size-6" />
        </header>

        {/* Status */}
        <div className="px-5 pt-4">
          <div className="rounded-xl border p-3">
            <p className="text-muted-foreground text-center text-sm">
              Assistente online · Litoral Norte SP & Bertioga
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-36">
          {messages.length === 0 && (
            <div className="flex gap-2 px-3 pt-6 pr-14">
              <div className="bg-primary/12 flex size-8 shrink-0 items-center justify-center rounded-full border">
                <BotMessageSquare className="text-primary size-3.5" />
              </div>
              <div className="text-sm leading-relaxed space-y-2">
                <p>
                  Olá! Sou o <span className="font-bold">BarberSync</span>, seu assistente de beleza do Litoral Norte de SP e Bertioga.
                </p>
                <p>Posso te ajudar a:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Encontrar barbearias e salões por cidade</li>
                  <li>Verificar horários e agendar</li>
                  <li className="font-medium">
                    Analisar seu rosto com IA e recomendar o melhor corte — clique em{" "}
                    <button
                      onClick={() => setShowFaceScan(true)}
                      className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
                    >
                      <ScanFace className="size-3.5" /> Escanear rosto
                    </button>
                  </li>
                </ul>
                <p className="text-muted-foreground text-xs pt-1">
                  Atendemos homens e mulheres 💈✂️
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="pt-6">
              {message.role === "assistant" ? (
                <div className="flex items-start gap-2 px-3 pr-14">
                  <div className="bg-primary/12 flex size-8 shrink-0 items-center justify-center rounded-full border">
                    <BotMessageSquare className="text-primary size-3.5" />
                  </div>
                  <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <Streamdown key={index}>{part.text}</Streamdown>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pr-5 pl-10">
                  <div className="bg-secondary rounded-2xl px-4 py-3 max-w-[85%]">
                    <p className="text-sm whitespace-pre-wrap">
                      {message.parts.map((part, index) =>
                        part.type === "text" ? (
                          <span key={index}>{part.text}</span>
                        ) : null,
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2 px-3 pt-6 pr-14">
              <div className="bg-primary/12 flex size-8 shrink-0 items-center justify-center rounded-full border">
                <BotMessageSquare className="text-primary size-3.5" />
              </div>
              <div className="text-muted-foreground text-sm">Digitando...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-muted fixed right-0 bottom-0 left-0 p-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full"
              onClick={() => setShowFaceScan(true)}
              disabled={isLoading}
              title="Escanear rosto para recomendação de corte"
            >
              <ScanFace className="size-4" />
            </Button>

            <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: quero cortar o cabelo em Ubatuba amanhã"
                disabled={isLoading}
                className="bg-background text-foreground placeholder:text-muted-foreground flex-1 rounded-full px-4 py-3 text-sm outline-none"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="size-[42px] shrink-0 rounded-full"
              >
                <Send className="size-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
