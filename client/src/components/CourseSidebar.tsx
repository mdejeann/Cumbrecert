import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Lock, MessageSquare, Trophy } from "lucide-react";

// Link de sugerencias con el curso y módulo en el asunto
export function suggestionsHref(courseTitle: string | undefined, level: number, moduleNumber: number) {
  const subject = `Sugerencias - ${courseTitle ?? `Nivel ${level}`} - Módulo ${moduleNumber}`;
  return `mailto:info@cumbrecert.com?subject=${encodeURIComponent(subject)}`;
}

// Panel lateral (pantallas anchas): dónde está parado el alumno dentro del curso
export function CourseSidebar({
  level,
  moduleNumber,
  courseTitle,
}: {
  level: number;
  moduleNumber: number;
  courseTitle?: string;
}) {
  const [, navigate] = useLocation();
  const { data: modules } = trpc.courses.getModules.useQuery({ level });
  if (!modules) return null;

  const passedCount = modules.filter((m) => m.progress?.passed === 1).length;
  const allPassed = passedCount === modules.length;

  return (
    <aside className="hidden xl:flex flex-col fixed left-4 2xl:left-10 top-24 w-60 2xl:w-72 max-h-[calc(100vh-7rem)] bg-white rounded-2xl border border-[#E8F5E9] shadow-sm overflow-hidden z-30">
      <div className="px-4 py-3 border-b border-[#E8F5E9]">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">Nivel {level}</p>
        <p className="font-semibold text-[#1B5E20] leading-tight">{courseTitle ?? `Curso Nivel ${level}`}</p>
        <div className="mt-2 h-1.5 bg-[#E8F5E9] rounded-full">
          <div className="h-1.5 bg-[#8BC34A] rounded-full" style={{ width: `${(passedCount / modules.length) * 100}%` }} />
        </div>
        <p className="text-[11px] text-gray-500 mt-1">
          {passedCount} de {modules.length} módulos aprobados
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map((m, i) => {
          const current = m.id === moduleNumber;
          const passed = m.progress?.passed === 1;
          const unlocked = i === 0 || modules[i - 1].progress?.passed === 1;
          return (
            <button
              key={m.id}
              disabled={!unlocked || current}
              onClick={() => navigate(`/curso/${level}/modulo/${m.id}`)}
              className={`w-full text-left px-4 py-2 flex items-start gap-3 transition ${
                current ? "bg-[#F1F8E9] border-l-4 border-[#1B5E20]" : "border-l-4 border-transparent hover:bg-[#F8FAF5]"
              } ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`mt-0.5 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  passed ? "bg-[#8BC34A] text-white" : current ? "bg-[#1B5E20] text-white" : "bg-[#E8F5E9] text-[#1B5E20]"
                }`}
              >
                {passed ? <CheckCircle className="w-4 h-4" /> : !unlocked ? <Lock className="w-3 h-3" /> : m.id}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm leading-snug ${current ? "font-semibold text-[#1B5E20]" : "text-gray-700"}`}>
                  {m.title}
                </span>
                {current && <span className="block text-[11px] text-[#2E7D32]">Estás acá</span>}
              </span>
            </button>
          );
        })}
        <button
          disabled={!allPassed}
          onClick={() => navigate(`/curso/${level}/examen-final`)}
          className={`w-full text-left px-4 py-2 flex items-center gap-3 border-l-4 border-transparent ${
            allPassed ? "hover:bg-[#F8FAF5]" : "opacity-50 cursor-not-allowed"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-[#FFF8E1] text-amber-600 flex items-center justify-center">
            {allPassed ? <Trophy className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
          </span>
          <span className="text-sm text-gray-700">Examen final</span>
        </button>
      </nav>

      <a
        href={suggestionsHref(courseTitle, level, moduleNumber)}
        className="m-3 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#1B5E20] border border-[#C8E6C9] rounded-lg py-2 hover:bg-[#F1F8E9]"
      >
        <MessageSquare className="w-4 h-4" />
        Sugerencias y comentarios
      </a>
    </aside>
  );
}
