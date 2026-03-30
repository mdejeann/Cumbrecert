import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mountain, ChevronLeft, CheckCircle, XCircle, Loader2,
  AlertCircle, Trophy, Award, Mail, Star, QrCode
} from "lucide-react";
import { toast } from "sonner";

type Phase = "intro" | "exam" | "result";

export default function FinalExam() {
  const params = useParams<{ level: string }>();
  const level = parseInt(params.level ?? "0");
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    total: number;
    certificate?: { qrCode: string; issuedAt: Date; expiresAt?: Date | null } | null;
  } | null>(null);

  const { data: questions, isLoading: questionsLoading, error: questionsError } = trpc.courses.getExamQuestions.useQuery(
    { level, moduleNumber: 6 },
    { enabled: phase === "exam" && !!user && !authLoading }
  );

  const submitExam = trpc.courses.submitExam.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setPhase("result");
    },
    onError: (err) => {
      toast.error(err.message || "Error al enviar el examen.");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1B5E20] animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSelectAnswer = (qi: number, oi: number) => {
    const newAnswers = [...answers];
    newAnswers[qi] = oi;
    setAnswers(newAnswers);
  };

  const handleSubmitExam = () => {
    if (!questions) return;
    const unanswered = questions.findIndex((_, i) => answers[i] == null);
    if (unanswered !== -1) {
      toast.error(`Respondé la pregunta ${unanswered + 1} antes de enviar.`);
      return;
    }
    submitExam.mutate({ level, moduleNumber: 6, answers: answers as number[] });
  };

  // ============================================================
  // INTRO PHASE
  // ============================================================
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-[#F8FAF5]">
        <div className="bg-white border-b border-[#E8F5E9] sticky top-0 z-40 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-[#1B5E20]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#1B5E20] rounded-full flex items-center justify-center">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#1B5E20]">Examen Integrador Final</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1B5E20] to-[#8BC34A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Trophy className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1B5E20] mb-3">Examen Integrador Final</h1>
            <p className="text-gray-500 text-lg">Nivel 0 — Explorador Iniciante</p>
          </div>

          <Card className="border-2 border-[#C8E6C9] shadow-lg mb-6">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-[#1B5E20] text-lg">¿Qué te espera?</h3>

              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: "📝", label: "10 preguntas", sub: "de todos los módulos" },
                  { icon: "✅", label: "60% para aprobar", sub: "6 de 10 correctas" },
                  { icon: "🔄", label: "Reintentos libres", sub: "sin límite de intentos" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F1F8E9] rounded-xl p-4">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="font-bold text-[#1B5E20] text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-xl p-5 text-white">
                <div className="flex items-start gap-3">
                  <Award className="w-8 h-8 text-[#8BC34A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">Al aprobar, recibís:</h4>
                    <ul className="space-y-1 text-green-100 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#8BC34A]" />
                        Certificado digital "Explorador Iniciante"
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#8BC34A]" />
                        Código QR único verificable en tiempo real
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#8BC34A]" />
                        Notificación por email con tu certificado
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#8BC34A]" />
                        Validez de 2 años — renovación gratuita
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Este examen integra contenidos de los 5 módulos. Repasá el material si lo necesitás antes de comenzar.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1 border-[#C8E6C9] text-[#1B5E20]"
            >
              Repasar módulos
            </Button>
            <Button
              onClick={() => setPhase("exam")}
              className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-3"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Comenzar examen final
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // EXAM PHASE
  // ============================================================
  if (phase === "exam") {
    if (questionsError) {
      return (
        <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1B5E20] mb-2">Examen bloqueado</h2>
            <p className="text-gray-500 mb-6">{questionsError.message || "Debés aprobar todos los módulos primero."}</p>
            <Button onClick={() => navigate("/dashboard")} className="bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
              Volver al dashboard
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAF5]">
        <div className="bg-white border-b border-[#E8F5E9] sticky top-0 z-40 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setPhase("intro")} className="text-gray-400 hover:text-[#1B5E20]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Examen Final · Nivel 0</p>
              <p className="text-sm font-semibold text-[#1B5E20]">Examen Integrador</p>
            </div>
            <Badge className="bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
              {answers.filter((a) => a != null).length}/{questions?.length ?? 10} respondidas
            </Badge>
          </div>
          <div className="h-1 bg-[#E8F5E9]">
            <div
              className="h-1 bg-[#8BC34A] transition-all"
              style={{ width: `${(answers.filter((a) => a != null).length / (questions?.length ?? 10)) * 100}%` }}
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {questionsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Cargando examen...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions?.map((q, qi) => (
                <Card key={qi} className={`border-2 transition-colors ${answers[qi] != null ? "border-[#8BC34A]" : "border-[#E8F5E9]"}`}>
                  <CardContent className="p-5">
                    <p className="font-semibold text-[#1B5E20] mb-4">
                      <span className="text-[#8BC34A] mr-2">{qi + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => handleSelectAnswer(qi, oi)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                            answers[qi] === oi
                              ? "border-[#1B5E20] bg-[#E8F5E9] text-[#1B5E20] font-medium"
                              : "border-gray-200 hover:border-[#8BC34A] hover:bg-[#F9FBF7] text-gray-700"
                          }`}
                        >
                          <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center mr-2 text-xs font-bold ${
                            answers[qi] === oi ? "bg-[#1B5E20] text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={handleSubmitExam}
                disabled={submitExam.isPending || answers.filter((a) => a != null).length < (questions?.length ?? 10)}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-4 text-base"
              >
                {submitExam.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    Enviar examen final
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // RESULT PHASE
  // ============================================================
  if (phase === "result" && result) {
    if (result.passed) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1A1A1A] flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Celebration */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-28 h-28 bg-[#8BC34A] rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                  <Trophy className="w-16 h-16 text-[#1A1A1A]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-800 fill-current" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mt-4 mb-2">¡Felicitaciones!</h1>
              <p className="text-green-200 text-lg">Obtuviste el certificado de Explorador Iniciante</p>
            </div>

            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
              {/* Certificate preview */}
              <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-6 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Mountain className="w-6 h-6 text-[#8BC34A]" />
                  <span className="font-bold text-lg">CumbreCert</span>
                </div>
                <p className="text-green-200 text-sm mb-2">Certifica que</p>
                <p className="text-2xl font-bold mb-1">
                  {(user as any).nombre} {(user as any).apellido}
                </p>
                <p className="text-green-200 text-sm mb-3">ha completado exitosamente el</p>
                <div className="bg-[#8BC34A] text-[#1A1A1A] rounded-full px-6 py-2 inline-block font-bold">
                  Nivel 0 — Explorador Iniciante
                </div>
                <p className="text-green-200 text-sm mt-3">Puntaje: {result.score}% · Válido por 2 años</p>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Score */}
                <div className="flex items-center justify-between bg-[#F1F8E9] rounded-xl p-4">
                  <div>
                    <p className="text-sm text-gray-500">Puntaje obtenido</p>
                    <p className="text-3xl font-bold text-[#1B5E20]">{result.score}%</p>
                    <p className="text-xs text-gray-400">{result.correct} de {result.total} correctas</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-[#8BC34A]" />
                </div>

                {/* QR Code info */}
                {result.certificate && (
                  <div className="bg-[#F1F8E9] rounded-xl p-4 flex items-center gap-3">
                    <QrCode className="w-10 h-10 text-[#1B5E20] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#1B5E20]">Tu código QR único</p>
                      <p className="text-xs text-gray-500 font-mono">{result.certificate.qrCode}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Verificable en tiempo real por guardaparques y guías</p>
                    </div>
                  </div>
                )}

                {/* Email notification */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <Mail className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Certificado enviado por email</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Te enviamos el PDF de tu certificado a <strong>{(user as any).email}</strong>.
                      Revisá tu bandeja de entrada (y spam por las dudas).
                    </p>
                  </div>
                </div>

                {/* What's next */}
                <div className="border border-[#C8E6C9] rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#1B5E20] mb-2">¿Qué podés hacer ahora?</p>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#8BC34A]" />
                      Mostrar tu QR al ingresar a parques y refugios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#8BC34A]" />
                      Compartir tu certificado con tu guía de montaña
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#8BC34A]" />
                      Anotarte en la lista de espera del Nivel 1
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-3"
                >
                  Ir a mi dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Failed result
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-2 border-orange-300 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-orange-600 mb-2">Casi llegás</h2>
              <p className="text-gray-500 mb-6">
                Obtuviste {result.score}%. Necesitás 60% para aprobar el examen final.
              </p>

              <div className="bg-orange-50 rounded-xl p-5 mb-6">
                <div className="text-5xl font-bold text-orange-500 mb-1">{result.score}%</div>
                <p className="text-sm text-gray-500">{result.correct} de {result.total} correctas</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-orange-400 rounded-full" style={{ width: `${result.score}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span className="text-orange-500">60% mínimo</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => { setAnswers([]); setResult(null); setPhase("exam"); }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                >
                  Intentar de nuevo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="w-full border-[#C8E6C9] text-[#1B5E20]"
                >
                  Repasar módulos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
