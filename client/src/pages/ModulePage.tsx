import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mountain, ChevronLeft, ChevronRight, BookOpen, ClipboardList,
  CheckCircle, XCircle, Loader2, Clock, AlertCircle, Trophy
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

type Phase = "content" | "exam" | "result";

export default function ModulePage() {
  const params = useParams<{ level: string; module: string }>();
  const level = parseInt(params.level ?? "0");
  const moduleNumber = parseInt(params.module ?? "1");
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>("content");
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{ score: number; passed: boolean; correct: number; total: number; certificate?: any } | null>(null);

  const { data: moduleData, isLoading: moduleLoading, error: moduleError } = trpc.courses.getModule.useQuery(
    { level, moduleNumber },
    { enabled: !!user && !authLoading }
  );

  const { data: questions, isLoading: questionsLoading } = trpc.courses.getExamQuestions.useQuery(
    { level, moduleNumber },
    { enabled: phase === "exam" && !!user }
  );

  const submitExam = trpc.courses.submitExam.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setPhase("result");
      if (data.passed) {
        toast.success(`¡Módulo aprobado con ${data.score}%! 🎉`);
      } else {
        toast.error(`Obtuviste ${data.score}%. Necesitás 60% para aprobar. ¡Intentalo de nuevo!`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Error al enviar el examen.");
    },
  });

  if (authLoading || moduleLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1B5E20] animate-spin mx-auto mb-3" />
          <p className="text-[#1B5E20]">Cargando módulo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (moduleError) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1B5E20] mb-2">Módulo bloqueado</h2>
          <p className="text-gray-500 mb-6">{moduleError.message || "Debés aprobar el módulo anterior primero."}</p>
          <Button onClick={() => navigate("/dashboard")} className="bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
            Volver al dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleStartExam = () => {
    setAnswers([]);
    setPhase("exam");
  };

  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmitExam = () => {
    if (!questions) return;
    const unanswered = questions.findIndex((_, i) => answers[i] == null);
    if (unanswered !== -1) {
      toast.error(`Respondé la pregunta ${unanswered + 1} antes de enviar.`);
      return;
    }
    submitExam.mutate({ level, moduleNumber, answers: answers as number[] });
  };

  const handleRetry = () => {
    setAnswers([]);
    setResult(null);
    setPhase("exam");
  };

  const handleNextModule = () => {
    if (moduleNumber < 5) {
      navigate(`/curso/${level}/modulo/${moduleNumber + 1}`);
    } else {
      navigate(`/curso/${level}/examen-final`);
    }
  };

  // ============================================================
  // CONTENT PHASE
  // ============================================================
  if (phase === "content") {
    return (
      <div className="min-h-screen bg-[#F8FAF5]">
        {/* Header */}
        <div className="bg-white border-b border-[#E8F5E9] sticky top-0 z-40 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-[#1B5E20] transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 bg-[#1B5E20] rounded-full flex items-center justify-center flex-shrink-0">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Nivel 0 · Módulo {moduleNumber}</p>
                <p className="text-sm font-semibold text-[#1B5E20] truncate">{moduleData?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {moduleData?.duration}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-[#E8F5E9]">
            <div className="h-1 bg-[#8BC34A]" style={{ width: `${(moduleNumber / 5) * 100}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Module badge */}
          {moduleData?.progress?.passed === 1 && (
            <div className="flex items-center gap-2 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg p-3 mb-6">
              <CheckCircle className="w-5 h-5 text-[#8BC34A]" />
              <span className="text-sm text-[#1B5E20] font-medium">
                Ya aprobaste este módulo con {moduleData.progress.examScore}%. Podés repasar el contenido.
              </span>
            </div>
          )}

          {/* Module content rendered as markdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8F5E9] p-6 md:p-8 prose prose-green max-w-none">
            <Streamdown>{moduleData?.content ?? ""}</Streamdown>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-[#C8E6C9] text-[#1B5E20] hover:bg-[#F1F8E9]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver al dashboard
            </Button>
            <Button
              onClick={handleStartExam}
              className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold px-8"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              {moduleData?.progress?.passed === 1 ? "Repetir examen" : "Ir al examen"}
              <ChevronRight className="w-4 h-4 ml-2" />
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
    return (
      <div className="min-h-screen bg-[#F8FAF5]">
        {/* Header */}
        <div className="bg-white border-b border-[#E8F5E9] sticky top-0 z-40 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setPhase("content")} className="text-gray-400 hover:text-[#1B5E20] transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Examen · Módulo {moduleNumber}</p>
              <p className="text-sm font-semibold text-[#1B5E20]">{moduleData?.title}</p>
            </div>
            <Badge className="bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
              {answers.filter((a) => a != null).length}/{questions?.length ?? 5} respondidas
            </Badge>
          </div>
          <div className="h-1 bg-[#E8F5E9]">
            <div
              className="h-1 bg-[#8BC34A] transition-all"
              style={{ width: `${(answers.filter((a) => a != null).length / (questions?.length ?? 5)) * 100}%` }}
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-[#F1F8E9] border border-[#C8E6C9] rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#1B5E20] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1B5E20]">Instrucciones del examen</p>
              <p className="text-sm text-[#2E7D32]">
                Respondé todas las preguntas. Necesitás un mínimo de 60% para aprobar. Podés reintentar las veces que necesites.
              </p>
            </div>
          </div>

          {questionsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Cargando preguntas...</p>
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
                          <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center mr-2 text-xs font-bold flex-shrink-0 ${
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
                disabled={submitExam.isPending || answers.filter((a) => a != null).length < (questions?.length ?? 5)}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-4 text-base"
              >
                {submitExam.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Enviar respuestas
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
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className={`border-2 shadow-xl ${result.passed ? "border-[#8BC34A]" : "border-orange-300"}`}>
            <CardContent className="p-8 text-center">
              {/* Result icon */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.passed ? "bg-[#E8F5E9]" : "bg-orange-50"
              }`}>
                {result.passed ? (
                  <CheckCircle className="w-12 h-12 text-[#8BC34A]" />
                ) : (
                  <XCircle className="w-12 h-12 text-orange-500" />
                )}
              </div>

              <h2 className={`text-2xl font-bold mb-2 ${result.passed ? "text-[#1B5E20]" : "text-orange-600"}`}>
                {result.passed ? "¡Módulo aprobado!" : "Casi..."}
              </h2>

              <p className="text-gray-500 mb-6">
                {result.passed
                  ? `Obtuviste ${result.score}% — ¡Excelente trabajo!`
                  : `Obtuviste ${result.score}%. Necesitás 60% para aprobar.`}
              </p>

              {/* Score display */}
              <div className={`rounded-xl p-5 mb-6 ${result.passed ? "bg-[#F1F8E9]" : "bg-orange-50"}`}>
                <div className={`text-5xl font-bold mb-1 ${result.passed ? "text-[#1B5E20]" : "text-orange-500"}`}>
                  {result.score}%
                </div>
                <p className="text-sm text-gray-500">
                  {result.correct} de {result.total} respuestas correctas
                </p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${result.passed ? "bg-[#8BC34A]" : "bg-orange-400"}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span className="text-orange-500">60% mínimo</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {result.passed ? (
                  <>
                    {moduleNumber < 5 ? (
                      <Button
                        onClick={handleNextModule}
                        className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-3"
                      >
                        Siguiente módulo
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate("/curso/0/examen-final")}
                        className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-3"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Ir al Examen Final
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="w-full border-[#C8E6C9] text-[#1B5E20]"
                    >
                      Volver al dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleRetry}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                    >
                      Intentar de nuevo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPhase("content")}
                      className="w-full border-[#C8E6C9] text-[#1B5E20]"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Repasar el contenido
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
