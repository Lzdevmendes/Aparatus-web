"use client";

import { useEffect, useRef, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

type ScanStep = {
  instruction: string;
  duration: number;
};

const SCAN_STEPS: ScanStep[] = [
  { instruction: "Centralize seu rosto no oval", duration: 2000 },
  { instruction: "Olhe diretamente para a câmera", duration: 1500 },
  { instruction: "Sorria levemente 😊", duration: 1500 },
  { instruction: "Vire levemente para a esquerda", duration: 1200 },
  { instruction: "Vire levemente para a direita", duration: 1200 },
  { instruction: "Olhe para cima rapidamente", duration: 1000 },
  { instruction: "Perfeito! Capturando...", duration: 800 },
];

type FaceAnalysis = {
  faceShape: string;
  approximateAge: number;
  gender: string;
  skinTone: string;
  recommendations: Array<{ cut: string; why: string; style: string }>;
  avoid: string[];
  tip: string;
};

type Props = {
  onClose: () => void;
  onResult: (analysis: FaceAnalysis) => void;
};

const FACE_SHAPE_LABELS: Record<string, string> = {
  oval: "Oval",
  redondo: "Redondo",
  quadrado: "Quadrado",
  coração: "Coração",
  retangular: "Retangular",
  diamante: "Diamante",
  triangular: "Triangular",
};

const STYLE_COLORS: Record<string, string> = {
  clássico: "bg-blue-500/20 text-blue-400",
  moderno: "bg-purple-500/20 text-purple-400",
  ousado: "bg-orange-500/20 text-orange-400",
  casual: "bg-green-500/20 text-green-400",
};

export const FaceScanModal = ({ onClose, onResult }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<"scanning" | "analyzing" | "done" | "error">(
    "scanning",
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        setErrorMsg("Não foi possível acessar a câmera. Verifique as permissões.");
        setPhase("error");
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Scan steps progression
  useEffect(() => {
    if (phase !== "scanning") return;

    const total = SCAN_STEPS.reduce((acc, s) => acc + s.duration, 0);
    let elapsed = 0;

    const intervals: ReturnType<typeof setInterval>[] = [];

    SCAN_STEPS.forEach((step, idx) => {
      const delay = SCAN_STEPS.slice(0, idx).reduce((a, s) => a + s.duration, 0);

      const t = setTimeout(() => {
        setStepIndex(idx);
      }, delay);

      intervals.push(t as unknown as ReturnType<typeof setInterval>);
    });

    // Progress bar
    const progressInterval = setInterval(() => {
      elapsed += 50;
      setProgress(Math.min((elapsed / total) * 100, 100));
    }, 50);

    // Capture at end
    const captureTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      captureAndAnalyze();
    }, total);

    return () => {
      intervals.forEach(clearTimeout);
      clearInterval(progressInterval);
      clearTimeout(captureTimeout);
    };
  }, [phase]);

  const captureAndAnalyze = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("analyzing");

    try {
      const res = await fetch("/api/face-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });

      if (!res.ok) throw new Error("Falha na análise");

      const data = await res.json() as FaceAnalysis & { error?: string };
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      setPhase("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Erro desconhecido");
      setPhase("error");
    }
  };

  const handleUseResult = () => {
    if (analysis) onResult(analysis);
    onClose();
  };

  return (
    <div className="bg-background/95 fixed inset-0 z-50 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="font-bold text-lg">Análise Facial</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* SCANNING phase */}
        {phase === "scanning" && (
          <div className="flex flex-col items-center px-5 pt-6 gap-5">
            <p className="text-muted-foreground text-sm text-center">
              Siga as instruções para verificar sua identidade
            </p>

            {/* Camera + Face oval */}
            <div className="relative w-72 h-80 rounded-3xl overflow-hidden border-2 border-primary">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {/* Oval overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="border-4 border-primary rounded-full animate-pulse"
                  style={{ width: 180, height: 220 }}
                />
              </div>
              {/* Scan line animation */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-primary/60"
                style={{
                  top: `${20 + (progress / 100) * 60}%`,
                  transition: "top 0.1s linear",
                  boxShadow: "0 0 8px 2px rgba(var(--primary), 0.5)",
                }}
              />
            </div>

            {/* Instruction */}
            <div className="bg-primary/10 rounded-2xl px-6 py-3 text-center min-h-[56px] flex items-center justify-center">
              <p className="font-semibold text-sm">
                {SCAN_STEPS[stepIndex]?.instruction}
              </p>
            </div>

            {/* Progress */}
            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs text-center mt-2">
                {Math.round(progress)}% concluído
              </p>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* ANALYZING phase */}
        {phase === "analyzing" && (
          <div className="flex flex-col items-center justify-center px-5 py-20 gap-6">
            <div className="size-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="text-center">
              <p className="font-bold text-lg">Analisando seu rosto...</p>
              <p className="text-muted-foreground text-sm mt-2">
                A IA está identificando seu formato de rosto e preparando as recomendações
              </p>
            </div>
          </div>
        )}

        {/* ERROR phase */}
        {phase === "error" && (
          <div className="flex flex-col items-center px-5 py-12 gap-4">
            <AlertCircle className="size-16 text-destructive" />
            <p className="font-bold text-lg text-center">Ops, algo deu errado</p>
            <p className="text-muted-foreground text-sm text-center">{errorMsg}</p>
            <Button onClick={onClose} variant="outline" className="mt-2">
              Fechar
            </Button>
          </div>
        )}

        {/* DONE phase - Results */}
        {phase === "done" && analysis && (
          <div className="flex flex-col px-5 py-6 gap-5">
            {/* Summary card */}
            <div className="bg-primary/10 rounded-2xl p-4 flex items-center gap-4">
              <CheckCircle className="text-primary size-8 shrink-0" />
              <div>
                <p className="font-bold">Análise concluída!</p>
                <p className="text-muted-foreground text-sm">
                  Rosto <strong>{FACE_SHAPE_LABELS[analysis.faceShape] ?? analysis.faceShape}</strong>{" "}
                  · ~{analysis.approximateAge} anos · Tom {analysis.skinTone}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-bold mb-3">✂️ Cortes recomendados para você</h3>
              <div className="flex flex-col gap-3">
                {analysis.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="border rounded-xl p-4 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{rec.cut}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STYLE_COLORS[rec.style] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {rec.style}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">{rec.why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid */}
            {analysis.avoid?.length > 0 && (
              <div>
                <h3 className="font-bold mb-2 text-sm">❌ Evite</h3>
                <ul className="text-muted-foreground text-xs space-y-1 ml-3 list-disc">
                  {analysis.avoid.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tip */}
            {analysis.tip && (
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs">
                  <span className="font-semibold">💡 Dica:</span> {analysis.tip}
                </p>
              </div>
            )}

            {/* CTA */}
            <Button onClick={handleUseResult} className="w-full rounded-full">
              Quero agendar um desses cortes!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
