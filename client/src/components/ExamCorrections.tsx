import { CheckCircle, XCircle } from "lucide-react";

export type Correction = {
  question: string;
  userAnswerText: string;
  correctAnswerText: string;
  isCorrect: boolean;
  explicacion?: string | null;
};

// Corrección detallada que se muestra al terminar cada examen (aprobado o no)
export function ExamCorrections({ corrections }: { corrections?: Correction[] }) {
  if (!corrections?.length) return null;
  return (
    <div className="mb-6 text-left space-y-3">
      <h3 className="font-bold text-[#1B5E20] text-sm uppercase tracking-wider">Corrección detallada</h3>
      {corrections.map((c, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-lg border text-sm ${c.isCorrect ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}
        >
          <p className="font-semibold mb-1 flex items-start gap-1.5">
            {c.isCorrect ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" /> : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />}
            {idx + 1}. {c.question}
          </p>
          <p className="text-xs">
            Tu respuesta: <span className="font-medium">{c.userAnswerText}</span>
          </p>
          {!c.isCorrect && (
            <p className="text-xs text-green-700 mt-0.5">
              Respuesta correcta: <span className="font-medium">{c.correctAnswerText}</span>
            </p>
          )}
          {c.explicacion && <p className="text-xs text-gray-600 mt-1 italic">{c.explicacion}</p>}
        </div>
      ))}
    </div>
  );
}
