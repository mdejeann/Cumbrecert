import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mountain, Award, BookOpen, CheckCircle, Lock, LogOut,
  ChevronRight, Star, Trophy, Clock
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const LEVEL_NAMES = ["Explorador Iniciante", "Senderista Certificado", "Trekker Avanzado", "Montaña Responsable"];
const LEVEL_PRICES = ["GRATIS", "USD 20", "USD 50", "USD 100"];
const LEVEL_COLORS = ["#8BC34A", "#2196F3", "#FF9800", "#9C27B0"];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: progress, isLoading: progressLoading } = trpc.courses.getProgress.useQuery(undefined, {
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Sesión cerrada.");
  };

  if (loading || progressLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1B5E20] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mountain className="w-9 h-9 text-white" />
          </div>
          <p className="text-[#1B5E20] font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const moduleProgressMap = Object.fromEntries(
    (progress?.moduleProgress ?? []).map((p) => [p.moduleNumber, p])
  );
  const completedModules = (progress?.moduleProgress ?? []).filter((p) => p.passed).length;
  const totalModules = 5;
  const progressPercent = Math.round((completedModules / totalModules) * 100);
  const hasCertificate = (progress?.certificates ?? []).some((c) => c.courseLevel === 0);
  const nivel0Completado = progress?.courseProgress?.nivel0Completado === 1;

  return (
    <div className="min-h-screen bg-[#F8FAF5]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-[#E8F5E9] sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B5E20] rounded-full flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1B5E20] hidden sm:block">CumbreCert</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#1B5E20]">
                {(user as any).nombre} {(user as any).apellido}
              </p>
              <p className="text-xs text-gray-400">{(user as any).email}</p>
            </div>
            <div className="w-9 h-9 bg-[#8BC34A] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-sm">
              {((user as any).nombre?.[0] ?? "U").toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                ¡Hola, {(user as any).nombre}! 🏔️
              </h1>
              <p className="text-green-200 text-sm">
                {nivel0Completado
                  ? "¡Completaste el Nivel Inicial! Sos un Explorador Certificado."
                  : completedModules === 0
                  ? "Comenzá tu certificación de montaña hoy."
                  : `Vas por buen camino — ${completedModules} de ${totalModules} módulos completados.`}
              </p>
            </div>
            {hasCertificate && (
              <div className="bg-[#8BC34A] rounded-full p-2">
                <Trophy className="w-6 h-6 text-[#1A1A1A]" />
              </div>
            )}
          </div>

          {!nivel0Completado && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-green-200 mb-1">
                <span>Progreso Nivel 0</span>
                <span>{completedModules}/{totalModules} módulos</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-[#8BC34A] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Certificate Banner */}
        {hasCertificate && (
          <div className="bg-gradient-to-r from-[#8BC34A] to-[#689F38] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-8 h-8 text-[#1B5E20]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1A1A1A] text-lg">¡Certificado obtenido!</h3>
                <p className="text-[#1B5E20] text-sm">Explorador Iniciante — Nivel 0</p>
                <p className="text-[#33691E] text-xs mt-1">
                  Tu certificado QR fue enviado a {(user as any).email}
                </p>
              </div>
              <Link href="/certificados">
                <Button className="bg-[#1B5E20] text-white hover:bg-[#2E7D32] text-sm">
                  Ver certificado
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Nivel 0 Course */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1B5E20]">Nivel 0 — Explorador Iniciante</h2>
            <Badge className="bg-[#8BC34A] text-[#1A1A1A] font-semibold">GRATIS</Badge>
          </div>

          <Card className="border-[#C8E6C9] shadow-sm overflow-hidden">
            <CardHeader className="bg-[#F1F8E9] border-b border-[#C8E6C9] py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#1B5E20]" />
                <div>
                  <CardTitle className="text-base text-[#1B5E20]">5 módulos de formación + examen integrador</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Aprobá cada módulo para desbloquear el siguiente</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {[
                { num: 1, title: "¿Por qué caminamos en la montaña?", subtitle: "Historia, cultura y ética", duration: "20 min" },
                { num: 2, title: "¿Qué llevar? Equipamiento esencial", subtitle: "Mochila, calzado, hidratación", duration: "25 min" },
                { num: 3, title: "Clima y meteorología de montaña", subtitle: "Cómo leer el tiempo", duration: "20 min" },
                { num: 4, title: "Orientación y señalización", subtitle: "Cómo no perderse", duration: "25 min" },
                { num: 5, title: "Conducta en la montaña y Leave No Trace", subtitle: "Cuidar el entorno", duration: "20 min" },
              ].map((mod, idx) => {
                const mp = moduleProgressMap[mod.num];
                const passed = mp?.passed === 1;
                const attempted = (mp?.attempts ?? 0) > 0;
                const prevPassed = mod.num === 1 || moduleProgressMap[mod.num - 1]?.passed === 1;
                const isLocked = !prevPassed;

                return (
                  <div
                    key={mod.num}
                    className={`flex items-center gap-4 p-4 border-b border-[#E8F5E9] last:border-0 transition-colors ${
                      isLocked ? "opacity-50" : "hover:bg-[#F9FBF7] cursor-pointer"
                    }`}
                    onClick={() => !isLocked && navigate(`/curso/0/modulo/${mod.num}`)}
                  >
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      passed ? "bg-[#8BC34A]" : isLocked ? "bg-gray-200" : "bg-[#E8F5E9] border-2 border-[#1B5E20]"
                    }`}>
                      {passed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="text-sm font-bold text-[#1B5E20]">{mod.num}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isLocked ? "text-gray-400" : "text-[#1B5E20]"}`}>
                        {mod.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{mod.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {mod.duration}
                      </div>
                      {passed && (
                        <Badge className="bg-[#E8F5E9] text-[#1B5E20] text-xs border border-[#C8E6C9]">
                          {mp?.examScore}%
                        </Badge>
                      )}
                      {attempted && !passed && (
                        <Badge variant="outline" className="text-orange-500 border-orange-300 text-xs">
                          Reintentar
                        </Badge>
                      )}
                      {!isLocked && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                );
              })}

              {/* Final Exam Row */}
              {(() => {
                const allPassed = [1, 2, 3, 4, 5].every((n) => moduleProgressMap[n]?.passed === 1);
                const finalPassed = moduleProgressMap[6]?.passed === 1;
                const finalAttempted = (moduleProgressMap[6]?.attempts ?? 0) > 0;

                return (
                  <div
                    className={`flex items-center gap-4 p-4 bg-gradient-to-r ${
                      allPassed
                        ? "from-[#F1F8E9] to-[#E8F5E9] cursor-pointer hover:from-[#E8F5E9] hover:to-[#DCEDC8]"
                        : "opacity-50"
                    } transition-colors`}
                    onClick={() => allPassed && navigate("/curso/0/examen-final")}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      finalPassed ? "bg-[#8BC34A]" : allPassed ? "bg-[#1B5E20]" : "bg-gray-200"
                    }`}>
                      {finalPassed ? (
                        <Trophy className="w-5 h-5 text-white" />
                      ) : allPassed ? (
                        <Star className="w-5 h-5 text-white" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${allPassed ? "text-[#1B5E20]" : "text-gray-400"}`}>
                        Examen Integrador Final
                      </p>
                      <p className="text-xs text-gray-400">10 preguntas — Aprobá con 60% para obtener tu certificado</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {finalPassed && (
                        <Badge className="bg-[#8BC34A] text-[#1A1A1A] text-xs font-bold">
                          ¡Aprobado!
                        </Badge>
                      )}
                      {finalAttempted && !finalPassed && (
                        <Badge variant="outline" className="text-orange-500 border-orange-300 text-xs">
                          Reintentar
                        </Badge>
                      )}
                      {allPassed && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Other Levels (Coming Soon) */}
        <div>
          <h2 className="text-xl font-bold text-[#1B5E20] mb-4">Próximos niveles</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((level) => (
              <Card key={level} className="border-gray-200 opacity-60">
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-500 text-sm">{LEVEL_NAMES[level]}</h3>
                  <p className="text-xs text-gray-400 mt-1">{LEVEL_PRICES[level]}</p>
                  <Badge variant="outline" className="mt-3 text-xs text-gray-400 border-gray-300">
                    Próximamente
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
