import { useEffect, useRef, useState } from "react";
import { CheckCircle, RotateCcw, Eye, EyeOff, Loader2, Lock, Move3d, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KNOTS, type KnotId } from "./knot3d/knots";
import type { KnotEngine, Phase, View } from "./knot3d/engine";

export { parseKnotMarker, type KnotId } from "./knot3d/knots";

// ============================================================
// Minijuego 3D de nudos. El motor (three.js) se carga recién cuando aparece,
// así no pesa en el resto del sitio.
// ============================================================

export function KnotGame({ knot, onComplete }: { knot: KnotId; onComplete?: () => void }) {
  const def = KNOTS[knot];
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<KnotEngine | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState<Phase>("lay");
  const [tension, setTension] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [view, setView] = useState<View>("frente");
  const [gateOpen, setGateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    import("./knot3d/engine")
      .then(({ KnotEngine }) => {
        if (cancelled || !hostRef.current) return;
        engineRef.current = new KnotEngine(hostRef.current, def, {
          onStep: setDone,
          onTension: setTension,
          onGate: setGateOpen,
          onNotice: setNotice,
          onPhase: (p) => {
            setPhase(p);
            if (p === "done") completeRef.current?.();
          },
        });
        setLoading(false);
      })
      .catch(() => setError(true));
    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [def]);

  const changeView = (v: View) => {
    setView(v);
    engineRef.current?.setView(v);
  };

  const total = def.steps.length;
  const progress = phase === "lay" ? (done / (total + 1)) * 100 : phase === "tighten" ? ((total + tension) / (total + 1)) * 100 : 100;
  const hint =
    phase === "done"
      ? def.staged
        ? "¡Listo! La cuerda corre para los dos lados: es dinámico."
        : "¡Listo! Nudo peinado y ajustado."
      : phase === "tighten"
        ? def.ajuste
        : def.steps[done]?.hint;

  return (
    <div className="bg-white rounded-2xl border border-[#C8E6C9] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E8F5E9] flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-[#1B5E20] flex items-center gap-2">
            <Move3d className="w-4 h-4" /> {def.nombre} · práctica 3D
          </p>
          <p className="text-xs text-gray-500">{def.objetivo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-[#C8E6C9] overflow-hidden">
            {(["frente", "lateral", "arriba"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => changeView(v)}
                className={`px-2.5 py-1 text-xs font-medium capitalize ${
                  view === v ? "bg-[#1B5E20] text-white" : "text-[#1B5E20] hover:bg-[#F1F8E9]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const next = !showGuide;
              setShowGuide(next);
              engineRef.current?.setGuide(next);
            }}
            className="border-[#C8E6C9] text-[#1B5E20] h-7"
          >
            {showGuide ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            Guía
          </Button>
          {def.carabiner && (
            <Button
              size="sm"
              onClick={() => engineRef.current?.toggleGate()}
              disabled={phase === "done"}
              className={`h-7 ${
                def.steps[done]?.gate && phase === "lay"
                  ? "bg-[#8BC34A] hover:bg-[#9CCC65] text-[#10331A] animate-pulse"
                  : "bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
              }`}
            >
              {gateOpen ? <Lock className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1" />}
              {gateOpen ? "Cerrar gatillo" : "Abrir gatillo"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => engineRef.current?.reset()} className="border-[#C8E6C9] text-[#1B5E20] h-7">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>
        </div>
      </div>

      <div className="relative bg-[#dfe9dc]" style={{ aspectRatio: "16 / 10" }}>
        <div ref={hostRef} className="absolute inset-0 cursor-grab active:cursor-grabbing select-none" />
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-[#1B5E20] text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Preparando la soga…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-red-600 px-6 text-center">
            Tu navegador no pudo iniciar el modo 3D. Probá actualizarlo o abrir la página en otro navegador.
          </div>
        )}
        {!loading && phase !== "done" && (
          <div className="absolute top-2 left-2 bg-white/85 backdrop-blur rounded-lg px-2.5 py-1.5 text-[11px] text-gray-600 leading-snug pointer-events-none">
            <b className="text-[#1B5E20]">Punto verde:</b> {def.staged ? "arrastralo en la dirección de la flecha" : "arrastralo para mover la soga"}
            <br />
            <b className="text-[#1B5E20]">Fondo:</b> arrastrá para girar · ruedita para zoom
            {def.carabiner && (
              <>
                <br />
                <b className="text-[#1B5E20]">Gatillo:</b> tocalo para abrir/cerrar ·{" "}
                <span className={gateOpen ? "text-amber-600 font-semibold" : "text-[#2E7D32] font-semibold"}>
                  {gateOpen ? "ABIERTO" : "cerrado"}
                </span>
              </>
            )}
          </div>
        )}
        {notice && phase !== "done" && (
          <div className="absolute top-2 right-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-3 py-1.5 text-xs font-semibold">
            {notice}
          </div>
        )}
        {phase === "done" && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-white rounded-full shadow-lg border border-[#C8E6C9] px-4 py-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#8BC34A]" />
            <span className="text-sm font-bold text-[#1B5E20]">¡{def.nombre} logrado!</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-[#F8FAF5]">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>
            {phase === "lay"
              ? `Paso ${Math.min(done + 1, total)} de ${total}`
              : phase === "tighten"
                ? def.staged
                  ? "Prueba: tirá de cada lado"
                  : "Ajuste final"
                : "Completado"}
          </span>
          {phase === "tighten" && <span>{def.staged ? "Probado" : "Tensión"} {Math.round(tension * 100)}%</span>}
        </div>
        <div className="h-1.5 bg-[#E8F5E9] rounded-full mb-2">
          <div className="h-1.5 bg-[#8BC34A] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-[#1B5E20] font-medium">{hint}</p>
      </div>
    </div>
  );
}

// Examen práctico: los tres nudos seguidos
export function KnotChallenge({ onComplete }: { onComplete: () => void }) {
  const order: KnotId[] = ["ballestrinque", "ocho", "dinamico"];
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const knot = order[index];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {order.map((k, i) => (
          <div
            key={k}
            className={`flex-1 text-center text-xs font-semibold rounded-full py-1.5 border ${
              i < index || (i === index && solved)
                ? "bg-[#8BC34A] border-[#8BC34A] text-white"
                : i === index
                  ? "bg-[#F1F8E9] border-[#1B5E20] text-[#1B5E20]"
                  : "bg-white border-[#E8F5E9] text-gray-400"
            }`}
          >
            {i + 1}. {KNOTS[k].nombre}
          </div>
        ))}
      </div>
      <KnotGame key={knot} knot={knot} onComplete={() => setSolved(true)} />
      {solved && (
        <Button
          onClick={() => {
            if (index === order.length - 1) onComplete();
            else {
              setIndex(index + 1);
              setSolved(false);
            }
          }}
          className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold"
        >
          {index === order.length - 1 ? "Ir a las preguntas del examen final" : `Siguiente nudo: ${KNOTS[order[index + 1]].nombre}`}
        </Button>
      )}
    </div>
  );
}
