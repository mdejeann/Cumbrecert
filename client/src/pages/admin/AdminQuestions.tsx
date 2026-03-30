import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuestionForm = {
  id?: number;
  courseId: number;
  moduleId?: number;
  examType: "module" | "final";
  pregunta: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  respuestaCorrecta: "a" | "b" | "c" | "d";
  explicacion: string;
  orden: number;
  activo: number;
};

const EMPTY_FORM = (courseId: number, moduleId?: number): QuestionForm => ({
  courseId,
  moduleId,
  examType: moduleId ? "module" : "final",
  pregunta: "",
  opcionA: "",
  opcionB: "",
  opcionC: "",
  opcionD: "",
  respuestaCorrecta: "a",
  explicacion: "",
  orden: 0,
  activo: 1,
});

const OPTION_LABELS = { a: "A", b: "B", c: "C", d: "D" };

export default function AdminQuestions() {
  const utils = trpc.useUtils();
  const { data: courses } = trpc.admin.getCourses.useQuery();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null | "final">(null);

  const { data: modules } = trpc.admin.getModulesByCourse.useQuery(
    { courseId: selectedCourseId! },
    { enabled: !!selectedCourseId }
  );

  const { data: questions, isLoading } = trpc.admin.getQuestionsByCourse.useQuery(
    { courseId: selectedCourseId!, examType: selectedModuleId === "final" ? "final" : "module" },
    { enabled: !!selectedCourseId }
  );

  const filteredQuestions = questions?.filter((q) =>
    selectedModuleId === "final"
      ? q.examType === "final"
      : selectedModuleId
        ? q.moduleId === selectedModuleId
        : true
  );

  const upsertMutation = trpc.admin.upsertQuestion.useMutation({
    onSuccess: () => {
      toast.success("Pregunta guardada");
      utils.admin.getQuestionsByCourse.invalidate({ courseId: selectedCourseId! });
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success("Pregunta eliminada");
      utils.admin.getQuestionsByCourse.invalidate({ courseId: selectedCourseId! });
    },
    onError: (e) => toast.error(e.message),
  });

  const [editing, setEditing] = useState<QuestionForm | null>(null);

  const handleSave = () => {
    if (!editing) return;
    upsertMutation.mutate(editing);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#8BC34A]" />
              Preguntas de Examen
            </h1>
            <p className="text-[#8b949e] mt-1">Creá y editá las preguntas de los exámenes de cada módulo y el examen final.</p>
          </div>
        </div>

        {/* Course selector */}
        <div className="mb-4">
          <label className="text-xs text-[#8b949e] mb-2 block font-medium uppercase tracking-wider">Curso</label>
          <div className="flex gap-3 flex-wrap">
            {courses?.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCourseId(c.id); setSelectedModuleId(null); setEditing(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                  selectedCourseId === c.id
                    ? "bg-[#1B5E20] text-white border-[#1B5E20]"
                    : "bg-[#161b22] text-[#8b949e] border-[#30363d] hover:border-[#1B5E20] hover:text-white"
                }`}
              >
                Nivel {c.nivel} — {c.titulo}
              </button>
            ))}
          </div>
        </div>

        {selectedCourseId && (
          <>
            {/* Module selector */}
            <div className="mb-6">
              <label className="text-xs text-[#8b949e] mb-2 block font-medium uppercase tracking-wider">Filtrar por</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedModuleId(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                    selectedModuleId === null ? "bg-[#21262d] text-white border-[#8b949e]" : "bg-[#161b22] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]"
                  }`}
                >
                  Todas
                </button>
                {modules?.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                      selectedModuleId === m.id ? "bg-[#1B5E20] text-white border-[#1B5E20]" : "bg-[#161b22] text-[#8b949e] border-[#30363d] hover:border-[#1B5E20]"
                    }`}
                  >
                    M{m.numero}: {m.titulo}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedModuleId("final")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                    selectedModuleId === "final" ? "bg-purple-600 text-white border-purple-600" : "bg-[#161b22] text-[#8b949e] border-[#30363d] hover:border-purple-600"
                  }`}
                >
                  Examen Final
                </button>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setEditing(EMPTY_FORM(
                  selectedCourseId,
                  selectedModuleId !== "final" && selectedModuleId ? selectedModuleId : undefined
                ))}
                className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Nueva Pregunta
              </Button>
            </div>

            {/* Edit form */}
            {editing && (
              <div className="mb-6 bg-[#161b22] border border-[#1B5E20] rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{editing.id ? "Editar Pregunta" : "Nueva Pregunta"}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#8b949e] mb-1 block">Tipo de Examen</label>
                      <select
                        value={editing.examType}
                        onChange={(e) => setEditing({ ...editing, examType: e.target.value as "module" | "final", moduleId: e.target.value === "final" ? undefined : editing.moduleId })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                      >
                        <option value="module">Examen de Módulo</option>
                        <option value="final">Examen Final</option>
                      </select>
                    </div>
                    {editing.examType === "module" && (
                      <div>
                        <label className="text-xs text-[#8b949e] mb-1 block">Módulo</label>
                        <select
                          value={editing.moduleId ?? ""}
                          onChange={(e) => setEditing({ ...editing, moduleId: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                        >
                          <option value="">Seleccioná un módulo</option>
                          {modules?.map((m) => (
                            <option key={m.id} value={m.id}>M{m.numero}: {m.titulo}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-[#8b949e] mb-1 block">Orden</label>
                      <input
                        type="number"
                        value={editing.orden}
                        onChange={(e) => setEditing({ ...editing, orden: Number(e.target.value) })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Pregunta</label>
                    <textarea
                      value={editing.pregunta}
                      onChange={(e) => setEditing({ ...editing, pregunta: e.target.value })}
                      rows={3}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20] resize-none"
                      placeholder="Escribí la pregunta aquí..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(["a", "b", "c", "d"] as const).map((opt) => (
                      <div key={opt}>
                        <label className="text-xs text-[#8b949e] mb-1 block flex items-center gap-1">
                          <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${editing.respuestaCorrecta === opt ? "bg-[#8BC34A] text-[#1a1a1a]" : "bg-[#30363d] text-[#8b949e]"}`}>
                            {OPTION_LABELS[opt]}
                          </span>
                          Opción {OPTION_LABELS[opt]}
                          {editing.respuestaCorrecta === opt && <span className="text-[#8BC34A] ml-1">✓ Correcta</span>}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editing[`opcion${OPTION_LABELS[opt]}` as keyof QuestionForm] as string}
                            onChange={(e) => setEditing({ ...editing, [`opcion${OPTION_LABELS[opt]}`]: e.target.value })}
                            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                            placeholder={`Opción ${OPTION_LABELS[opt]}`}
                          />
                          <button
                            onClick={() => setEditing({ ...editing, respuestaCorrecta: opt })}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition border ${
                              editing.respuestaCorrecta === opt
                                ? "bg-[#8BC34A] text-[#1a1a1a] border-[#8BC34A]"
                                : "bg-[#21262d] text-[#8b949e] border-[#30363d] hover:border-[#8BC34A]"
                            }`}
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Explicación (opcional, se muestra al corregir)</label>
                    <textarea
                      value={editing.explicacion}
                      onChange={(e) => setEditing({ ...editing, explicacion: e.target.value })}
                      rows={2}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20] resize-none"
                      placeholder="Explicación de por qué esta es la respuesta correcta..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <Button onClick={handleSave} disabled={upsertMutation.isPending} className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2">
                    <Check className="w-4 h-4" /> {upsertMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(null)} className="gap-2 border-[#30363d] text-[#8b949e] hover:text-white bg-transparent">
                    <X className="w-4 h-4" /> Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Questions list */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#161b22] rounded-lg animate-pulse border border-[#30363d]" />)}
              </div>
            ) : filteredQuestions?.length === 0 ? (
              <div className="text-center py-16 text-[#8b949e]">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay preguntas en esta selección.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions?.map((q, idx) => (
                  <div key={q.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-[#1B5E20] transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-[#8b949e] font-mono">#{idx + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.examType === "final" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                            {q.examType === "final" ? "Examen Final" : `Módulo ${modules?.find(m => m.id === q.moduleId)?.numero ?? "?"}`}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium mb-3">{q.pregunta}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {(["a", "b", "c", "d"] as const).map((opt) => (
                            <div key={opt} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg ${q.respuestaCorrecta === opt ? "bg-[#8BC34A]/10 text-[#8BC34A] border border-[#8BC34A]/30" : "text-[#8b949e]"}`}>
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${q.respuestaCorrecta === opt ? "bg-[#8BC34A] text-[#1a1a1a]" : "bg-[#30363d] text-[#8b949e]"}`}>
                                {OPTION_LABELS[opt]}
                              </span>
                              <span className="truncate">{q[`opcion${OPTION_LABELS[opt]}` as keyof typeof q] as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditing({
                            id: q.id, courseId: q.courseId, moduleId: q.moduleId ?? undefined,
                            examType: q.examType as "module" | "final",
                            pregunta: q.pregunta, opcionA: q.opcionA, opcionB: q.opcionB,
                            opcionC: q.opcionC, opcionD: q.opcionD,
                            respuestaCorrecta: q.respuestaCorrecta as "a" | "b" | "c" | "d",
                            explicacion: q.explicacion ?? "", orden: q.orden, activo: q.activo,
                          })}
                          className="text-[#8b949e] hover:text-[#8BC34A] transition p-1 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm("¿Eliminar esta pregunta?")) deleteMutation.mutate({ id: q.id }); }}
                          className="text-[#8b949e] hover:text-red-400 transition p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
