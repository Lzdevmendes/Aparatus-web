"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  BotMessageSquare,
  ChevronLeft,
  Send,
  ScanFace,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { FaceScanModal } from "@/components/face-scan-modal";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type FaceAnalysis = {
  faceShape: string;
  approximateAge: number;
  gender: string;
  recommendations: Array<{ cut: string; why: string; style: string }>;
  avoid: string[];
  tip: string;
};

const FACE_SHAPE_LABELS: Record<string, string> = {
  oval: "Oval", redondo: "Redondo", quadrado: "Quadrado",
  "coração": "Coração", retangular: "Retangular", diamante: "Diamante", triangular: "Triangular",
};

const QUICK_ACTIONS = [
  "Barbearias em Caraguatatuba",
  "Salões femininos em Ubatuba",
  "Melhores cortes masculinos",
  "Estabelecimentos unissex em Ilhabela",
];

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(initialQuery ?? "");
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [started, setStarted] = useState(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setMessages(data); })
      .catch(() => {});
  }, [setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (initialQuery && !started) {
      setStarted(true);
      sendMessage({ text: initialQuery });
      setInput("");
    }
  }, [initialQuery, started, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input.trim() });
      setInput("");
    }
  };

  const handleFaceResult = (analysis: FaceAnalysis) => {
    const cuts = analysis.recommendations
      .map((r) => `• **${r.cut}** — ${r.why}`)
      .join("\n");

    sendMessage({
      text: `Analisei meu rosto e recebi este resultado:\n\n**Formato:** ${FACE_SHAPE_LABELS[analysis.faceShape] ?? analysis.faceShape}\n**Idade aprox.:** ${analysis.approximateAge} anos\n\n**Cortes recomendados:**\n${cuts}\n\n💡 ${analysis.tip}\n\nCom base nisso, pode me indicar um salão ideal?`,
    });
  };

  const handleClearHistory = async () => {
    setMessages([]);
  };

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

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
        <header className="bg-background/95 border-border sticky top-0 z-30 flex items-center justify-between border-b px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <ChevronLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
                <BotMessageSquare className="text-primary size-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">BarberSync IA</p>
                <p className="text-muted-foreground text-[10px]">
                  {isLoading ? "Digitando..." : "Online"}
                </p>
              </div>
            </div>
          </div>

          {!isEmpty && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground"
              onClick={handleClearHistory}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-36">
          {isEmpty && (
            <div className="flex flex-col items-center gap-6 px-5 pt-12">
              <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                <BotMessageSquare className="text-primary size-8" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold">BarberSync IA</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Encontro o salão perfeito para você e analiso o melhor corte para o seu rosto.
                </p>
              </div>

              {/* Face scan CTA */}
              <button
                onClick={() => setShowFaceScan(true)}
                className="bg-primary/10 border-primary/20 flex w-full max-w-xs items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.98]"
              >
                <div className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                  <ScanFace className="text-primary-foreground size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Análise Facial</p>
                  <p className="text-muted-foreground text-xs">
                    Escaneie seu rosto e descubra o corte ideal
                  </p>
                </div>
              </button>

              {/* Quick actions */}
              <div className="w-full max-w-xs space-y-2">
                <p className="text-muted-foreground text-xs font-medium text-center">
                  Ou experimente:
                </p>
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setInput(action);
                      sendMessage({ text: action });
                    }}
                    className="border-border hover:bg-accent w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="px-4 pt-4">
              {message.role === "assistant" ? (
                <div className="flex items-start gap-2.5">
                  <div className="bg-primary/10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                    <BotMessageSquare className="text-primary size-3.5" />
                  </div>
                  <div className="bg-secondary max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                      {message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <Streamdown key={i}>{part.text}</Streamdown>
                        ) : null,
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm leading-relaxed">
                      {message.parts.map((part, i) =>
                        part.type === "text" ? <span key={i}>{part.text}</span> : null,
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5 px-4 pt-4">
              <div className="bg-primary/10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                <BotMessageSquare className="text-primary size-3.5" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="bg-muted-foreground/40 size-1.5 animate-bounce rounded-full"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-background/95 border-border fixed right-0 bottom-16 left-0 border-t p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full"
              onClick={() => setShowFaceScan(true)}
              disabled={isLoading}
              title="Análise facial"
            >
              <ScanFace className="size-4" />
            </Button>

            <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre salões ou peça análise..."
                disabled={isLoading}
                className="bg-secondary text-foreground placeholder:text-muted-foreground flex-1 rounded-full px-4 py-3 text-sm outline-none"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="size-11 shrink-0 rounded-full"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
