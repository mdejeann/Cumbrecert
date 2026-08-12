import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, X, FileText, Upload, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModuleForm = {
  id?: number;
  courseId: number;
  numero: number;
  titulo: string;
  descripcion: string;
  contenidoMarkdown: string;
  pdfUrl: string;
  pdfNombre: string;
  activo: number;
};

const EMPTY_FORM = (courseId: number): ModuleForm => ({
  courseId,
  numero: 1,
  titulo: "",
  descripcion: "",
  contenidoMarkdown: "",
  pdfUrl: "",
  pdfNombre: "",
  activo: 1,
});

export default function AdminModules() {
  const utils = trpc.useUtils();
  const { data: courses } = trpc.admin.getCourses.useQuery();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const { data: modulesList, isLoading } = trpc.admin.getModulesByCourse.useQuery(
    { courseId: selectedCourseId! },
    { enabled: !!selectedCourseId }
  );

  const upsertMutation = trpc.admin.upsertModule.useMutation({
    onSuccess: () => {
      toast.success("Módulo guardado");
      utils.admin.getModulesByCourse.invalidate({ courseId: selectedCourseId! });
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteModule.useMutation({
    onSuccess: () => {
      toast.success("Módulo eliminado");
      utils.admin.getModulesByCourse.invalidate({ courseId: selectedCourseId! });
    },
    onError: (e) => toast.error(e.message),
  });

  const uploadMutation = trpc.admin.uploadPdf.useMutation({
    onSuccess: (data) => {
      toast.success("PDF subido exitosamente");
      if (editing) setEditing({ ...editing, pdfUrl: data.url, pdfNombre: uploadFileName });
    },
    onError: (e) => toast.error(`Error al subir PDF: ${e.message}`),
  });

  const [editing, setEditing] = useState<ModuleForm | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"info" | "content">("info");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing?.id) {
      if (!editing?.id) toast.error("Primero guardá el módulo antes de subir el PDF.");
      return;
    }
    if (file.type !== "application/pdf") { toast.error("Solo se aceptan archivos PDF."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("El archivo no puede superar 10MB."); return; }
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ fileName: file.name, fileBase64: base64, moduleId: editing.id! });
    };
    reader.readAsDataURL(file);
  };

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
              <FileText className="w-6 h-6 text-[#8BC34A]" />
              Gestión de Módulos
            </h1>
            <p className="text-[#8b949e] mt-1">Editá el contenido, material teórico y PDFs de cada módulo.</p>
          </div>
        </div>

        {/* Course selector */}
        <div className="mb-6">
          <label className="text-xs text-[#8b949e] mb-2 block font-medium uppercase tracking-wider">Seleccioná un Curso</label>
          <div className="flex gap-3 flex-wrap">
            {courses?.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCourseId(c.id); setEditing(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                  selectedCourseId === c.id
                    ? "bg-[#1B5E20] text-white border-[#1B5E20]"
                    : "bg-[#161b22] text-[#8b949e] border-[#30363d] hover:border-[#1B5E20] hover:text-white"
                }`}
              >
                Nivel {c.nivel} — {c.titulo}
              </button>
            ))}
            {!courses?.length && <p className="text-[#8b949e] text-sm">No hay cursos. Creá uno primero en "Cursos".</p>}
          </div>
        </div>

        {selectedCourseId && (
          <>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setEditing(EMPTY_FORM(selectedCourseId))}
                className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Nuevo Módulo
              </Button>
            </div>

            {/* Edit form */}
            {editing && (
              <div className="mb-6 bg-[#161b22] border border-[#1B5E20] rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{editing.id ? "Editar Módulo" : "Nuevo Módulo"}</h3>

                {/* Tabs */}
                <div className="flex gap-1 mb-5 bg-[#0d1117] rounded-lg p-1 w-fit">
                  {(["info", "content"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                        activeTab === tab ? "bg-[#1B5E20] text-white" : "text-[#8b949e] hover:text-white"
                      }`}
                    >
                      {tab === "info" ? "Información" : "Contenido & PDF"}
                    </button>
                  ))}
                </div>

                {activeTab === "info" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#8b949e] mb-1 block">Número de Módulo</label>
                      <input
                        type="number"
                        value={editing.numero}
                        onChange={(e) => setEditing({ ...editing, numero: Number(e.target.value) })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8b949e] mb-1 block">Estado</label>
                      <select
                        value={editing.activo}
                        onChange={(e) => setEditing({ ...editing, activo: Number(e.target.value) })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                      >
                        <option value={1}>Activo</option>
                        <option value={0}>Inactivo</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-[#8b949e] mb-1 block">Título</label>
                      <input
                        type="text"
                        value={editing.titulo}
                        onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                        placeholder="Ej: ¿Qué llevar? Equipamiento esencial"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-[#8b949e] mb-1 block">Descripción corta</label>
                      <input
                        type="text"
                        value={editing.descripcion}
                        onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                        placeholder="Subtítulo del módulo"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "content" && (
                  <div className="space-y-4">
                    {/* Markdown content */}
                    <div>
                      <label className="text-xs text-[#8b949e] mb-1 block">Contenido en Markdown</label>
                      <textarea
                        value={editing.contenidoMarkdown}
                        onChange={(e) => setEditing({ ...editing, contenidoMarkdown: e.target.value })}
                        rows={12}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20] resize-y font-mono"
                        placeholder="# Título del módulo&#10;&#10;## Sección 1&#10;&#10;Contenido del módulo en formato Markdown..."
                      />
                      <p className="text-xs text-[#8b949e] mt-1">Usá Markdown: # Títulos, **negrita**, - listas, etc.</p>
                    </div>

                    {/* PDF Upload */}
                    <div className="border border-dashed border-[#30363d] rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-white">Material Teórico (PDF)</p>
                          <p className="text-xs text-[#8b949e]">Máximo 10MB. El PDF se mostrará como material de lectura antes del examen.</p>
                        </div>
                        {editing.pdfUrl && (
                          <a href={editing.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#8BC34A] hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Ver PDF actual
                          </a>
                        )}
                      </div>

                      {editing.pdfUrl && (
                        <div className="mb-3 flex items-center gap-2 bg-[#0d1117] rounded-lg px-3 py-2">
                          <FileText className="w-4 h-4 text-[#8BC34A]" />
                          <span className="text-sm text-white flex-1 truncate">{editing.pdfNombre || "PDF actual"}</span>
                          <button onClick={() => setEditing({ ...editing, pdfUrl: "", pdfNombre: "" })}
                            className="text-[#8b949e] hover:text-red-400 transition">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {!editing.id && (
                        <p className="text-xs text-yellow-400 mb-3">⚠️ Guardá el módulo primero para poder subir el PDF.</p>
                      )}

                      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadMutation.isPending || !editing.id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-white hover:border-[#1B5E20] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadMutation.isPending ? (
                          <><div className="w-4 h-4 border-2 border-[#8BC34A] border-t-transparent rounded-full animate-spin" /> Subiendo...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> {editing.pdfUrl ? "Reemplazar PDF" : "Subir PDF"}</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

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

            {/* Modules list */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#161b22] rounded-lg animate-pulse border border-[#30363d]" />)}
              </div>
            ) : modulesList?.length === 0 ? (
              <div className="text-center py-16 text-[#8b949e]">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay módulos en este curso todavía.</p>
              </div>
            ) : (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#30363d] text-[#8b949e]">
                      <th className="text-left px-4 py-3 font-medium">#</th>
                      <th className="text-left px-4 py-3 font-medium">Título</th>
                      <th className="text-left px-4 py-3 font-medium">PDF</th>
                      <th className="text-left px-4 py-3 font-medium">Estado</th>
                      <th className="text-right px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modulesList?.map((mod) => (
                      <tr key={mod.id} className="border-b border-[#30363d] last:border-0 hover:bg-[#21262d] transition">
                        <td className="px-4 py-3">
                          <span className="bg-[#21262d] text-[#8b949e] text-xs font-bold px-2 py-1 rounded">M{mod.numero}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{mod.titulo}</p>
                          {mod.descripcion && <p className="text-[#8b949e] text-xs mt-0.5">{mod.descripcion}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {mod.pdfUrl ? (
                            <a href={mod.pdfUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-[#8BC34A] hover:underline">
                              <FileText className="w-3 h-3" /> {mod.pdfNombre || "Ver PDF"}
                            </a>
                          ) : (
                            <span className="text-xs text-[#8b949e]">Sin PDF</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${mod.activo ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {mod.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditing({
                                id: mod.id, courseId: mod.courseId, numero: mod.numero,
                                titulo: mod.titulo, descripcion: mod.descripcion ?? "",
                                contenidoMarkdown: mod.contenidoMarkdown ?? "",
                                pdfUrl: mod.pdfUrl ?? "", pdfNombre: mod.pdfNombre ?? "", activo: mod.activo,
                              })}
                              className="text-[#8b949e] hover:text-[#8BC34A] transition p-1 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { if (confirm("¿Eliminar este módulo?")) deleteMutation.mutate({ id: mod.id }); }}
                              className="text-[#8b949e] hover:text-red-400 transition p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
