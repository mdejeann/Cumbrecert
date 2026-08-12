import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Check, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type CourseForm = {
  id?: number;
  nivel: number;
  titulo: string;
  descripcion: string;
  precio: number;
  activo: number;
};

const EMPTY_FORM: CourseForm = { nivel: 0, titulo: "", descripcion: "", precio: 0, activo: 1 };

export default function AdminCourses() {
  const utils = trpc.useUtils();
  const { data: courses, isLoading } = trpc.admin.getCourses.useQuery();
  const upsertMutation = trpc.admin.upsertCourse.useMutation({
    onSuccess: () => { toast.success("Curso guardado"); utils.admin.getCourses.invalidate(); setEditing(null); },
    onError: (e) => toast.error(e.message),
  });

  const [editing, setEditing] = useState<CourseForm | null>(null);

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
              <BookOpen className="w-6 h-6 text-[#8BC34A]" />
              Gestión de Cursos
            </h1>
            <p className="text-[#8b949e] mt-1">Creá y editá los cursos de CumbreCert.</p>
          </div>
          <Button
            onClick={() => setEditing({ ...EMPTY_FORM })}
            className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Curso
          </Button>
        </div>

        {/* Form */}
        {editing && (
          <div className="mb-6 bg-[#161b22] border border-[#1B5E20] rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">{editing.id ? "Editar Curso" : "Nuevo Curso"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Nivel</label>
                <input
                  type="number"
                  value={editing.nivel}
                  onChange={(e) => setEditing({ ...editing, nivel: Number(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Precio (USD cents, 0 = gratis)</label>
                <input
                  type="number"
                  value={editing.precio}
                  onChange={(e) => setEditing({ ...editing, precio: Number(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#8b949e] mb-1 block">Título</label>
                <input
                  type="text"
                  value={editing.titulo}
                  onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20]"
                  placeholder="Ej: Nivel 0 — Explorador Iniciante"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#8b949e] mb-1 block">Descripción</label>
                <textarea
                  value={editing.descripcion}
                  onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1B5E20] resize-none"
                  placeholder="Descripción del curso..."
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
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSave} disabled={upsertMutation.isPending} className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2">
                <Check className="w-4 h-4" /> Guardar
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="gap-2 border-[#30363d] text-[#8b949e] hover:text-white bg-transparent">
                <X className="w-4 h-4" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#161b22] rounded-lg animate-pulse border border-[#30363d]" />)}
          </div>
        ) : courses?.length === 0 ? (
          <div className="text-center py-16 text-[#8b949e]">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay cursos creados todavía.</p>
            <p className="text-sm mt-1">Hacé clic en "Nuevo Curso" para empezar.</p>
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-[#8b949e]">
                  <th className="text-left px-4 py-3 font-medium">Nivel</th>
                  <th className="text-left px-4 py-3 font-medium">Título</th>
                  <th className="text-left px-4 py-3 font-medium">Precio</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {courses?.map((course) => (
                  <tr key={course.id} className="border-b border-[#30363d] last:border-0 hover:bg-[#21262d] transition">
                    <td className="px-4 py-3">
                      <span className="bg-[#1B5E20] text-white text-xs font-bold px-2 py-1 rounded">N{course.nivel}</span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{course.titulo}</td>
                    <td className="px-4 py-3 text-[#8b949e]">
                      {course.precio === 0 ? <span className="text-[#8BC34A] font-medium">Gratis</span> : `USD ${(course.precio / 100).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.activo ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {course.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing({ id: course.id, nivel: course.nivel, titulo: course.titulo, descripcion: course.descripcion ?? "", precio: course.precio, activo: course.activo })}
                        className="text-[#8b949e] hover:text-[#8BC34A] transition p-1 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
