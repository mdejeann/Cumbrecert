import { useMemo, useState } from "react";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KNOT_PHOTOS, photoById, type KnotPhoto } from "./knotPhotos";

// Orden pseudoaleatorio estable (el mismo en cada carga, distinto por tarjeta)
function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Opciones: la correcta y tres distractores del catálogo
function options(knot: KnotPhoto, field: "nombre" | "uso", seed: number) {
  const others = shuffle(KNOT_PHOTOS.filter((k) => k.id !== knot.id), seed).slice(0, 3).map((k) => k[field]);
  return shuffle([knot[field], ...others], seed + 7);
}

type Answer = { nombre?: string; uso?: string };

// Actividad: identificar en cada foto qué nudo es y para qué sirve
export function KnotPhotoQuiz({ ids, onComplete, title }: { ids: string[]; onComplete?: () => void; title?: string }) {
  const knots = useMemo(() => ids.map(photoById).filter((k): k is KnotPhoto => !!k), [ids]);
  const opts = useMemo(
    () => knots.map((k, i) => ({ nombre: options(k, "nombre", i * 31 + 3), uso: options(k, "uso", i * 17 + 11) })),
    [knots]
  );
  const [answers, setAnswers] = useState<Answer[]>(() => knots.map(() => ({})));
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  const correct = knots.map((k, i) => answers[i]?.nombre === k.nombre && answers[i]?.uso === k.uso);
  const complete = knots.every((_, i) => answers[i]?.nombre && answers[i]?.uso);
  const okCount = correct.filter(Boolean).length;

  const set = (i: number, field: keyof Answer, value: string) => {
    setChecked(false);
    setAnswers((prev) => prev.map((a, j) => (j === i ? { ...a, [field]: value } : a)));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#C8E6C9] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E8F5E9]">
        <p className="font-semibold text-[#1B5E20]">{title ?? "Identificá los nudos"}</p>
        <p className="text-xs text-gray-500">En cada foto elegí qué nudo es y para qué sirve. Necesitás acertar todos para rendir.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 p-4">
        {knots.map((k, i) => {
          const state = checked ? (correct[i] ? "ok" : "bad") : null;
          return (
            <div
              key={k.id}
              className={`rounded-xl border p-3 ${
                state === "ok" ? "border-[#8BC34A] bg-[#F1F8E9]" : state === "bad" ? "border-red-300 bg-red-50" : "border-[#E8F5E9]"
              }`}
            >
              <div className="bg-white rounded-lg border border-[#E8F5E9] h-44 flex items-center justify-center mb-3 overflow-hidden">
                <img src={k.foto} alt={`Nudo ${i + 1}`} className="max-h-full max-w-full object-contain" />
              </div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">¿Qué nudo es?</label>
              <select
                value={answers[i]?.nombre ?? ""}
                onChange={(e) => set(i, "nombre", e.target.value)}
                disabled={done}
                className="w-full mb-2 border border-[#C8E6C9] rounded-lg px-2 py-1.5 text-sm bg-white"
              >
                <option value="">Elegí una opción</option>
                {opts[i].nombre.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <label className="block text-xs font-semibold text-gray-600 mb-1">¿Para qué sirve?</label>
              <select
                value={answers[i]?.uso ?? ""}
                onChange={(e) => set(i, "uso", e.target.value)}
                disabled={done}
                className="w-full border border-[#C8E6C9] rounded-lg px-2 py-1.5 text-sm bg-white"
              >
                <option value="">Elegí una opción</option>
                {opts[i].uso.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              {state === "ok" && (
                <p className="mt-2 text-xs text-[#2E7D32] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> ¡Correcto!
                </p>
              )}
              {state === "bad" && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Revisá el nombre o el uso.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-[#F8FAF5] flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#1B5E20] font-medium">
          {done ? "¡Identificaste todos los nudos!" : checked ? `${okCount} de ${knots.length} correctos` : `${knots.length} nudos para identificar`}
        </p>
        <div className="flex gap-2">
          {!done && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAnswers(knots.map(() => ({})));
                setChecked(false);
              }}
              className="border-[#C8E6C9] text-[#1B5E20]"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Limpiar
            </Button>
          )}
          <Button
            size="sm"
            disabled={!complete || done}
            onClick={() => {
              setChecked(true);
              if (correct.every(Boolean)) {
                setDone(true);
                onComplete?.();
              }
            }}
            className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
          >
            Comprobar
          </Button>
        </div>
      </div>
    </div>
  );
}
