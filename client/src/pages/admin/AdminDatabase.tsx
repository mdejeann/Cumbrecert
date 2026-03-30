import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Database, Users, BookOpen, FileText, HelpCircle, Award, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";
import { useState } from "react";

const TABLE_CONFIG = [
  { key: "users", label: "Usuarios", icon: Users, color: "text-blue-400", href: "/admin/usuarios" },
  { key: "courses", label: "Cursos", icon: BookOpen, color: "text-green-400", href: "/admin/cursos" },
  { key: "modules", label: "Módulos", icon: FileText, color: "text-purple-400", href: "/admin/modulos" },
  { key: "exam_questions", label: "Preguntas de Examen", icon: HelpCircle, color: "text-yellow-400", href: "/admin/preguntas" },
  { key: "course_progress", label: "Progreso de Cursos", icon: TrendingUp, color: "text-orange-400", href: null },
  { key: "module_progress", label: "Progreso de Módulos", icon: TrendingUp, color: "text-pink-400", href: null },
  { key: "certificates", label: "Certificados", icon: Award, color: "text-red-400", href: "/admin/certificados" },
];

export default function AdminDatabase() {
  const { data: stats, isLoading, refetch } = trpc.admin.getStats.useQuery();
  const [activeTable, setActiveTable] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Database className="w-6 h-6 text-[#8BC34A]" />
              Base de Datos
            </h1>
            <p className="text-[#8b949e] mt-1">Vista general del estado de la base de datos de CumbreCert.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d] transition text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>

        {/* Connection info */}
        <div className="mb-6 bg-[#161b22] border border-[#30363d] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8BC34A]" />
            Información de Conexión
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[#8b949e] text-xs mb-1">Motor</p>
              <p className="text-white font-mono">MySQL / TiDB</p>
            </div>
            <div>
              <p className="text-[#8b949e] text-xs mb-1">ORM</p>
              <p className="text-white font-mono">Drizzle ORM</p>
            </div>
            <div>
              <p className="text-[#8b949e] text-xs mb-1">Estado</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-green-400 font-medium">Conectada</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#30363d]">
            <p className="text-xs text-[#8b949e]">
              Para conectarte desde un cliente externo (TablePlus, DBeaver, MySQL Workbench), andá a{" "}
              <strong className="text-white">Settings → Database</strong> en el panel de Manus para obtener los datos de conexión completos.
              Recordá habilitar <strong className="text-white">SSL</strong>.
            </p>
          </div>
        </div>

        {/* Tables overview */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Tablas</h3>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(7)].map((_, i) => <div key={i} className="h-28 bg-[#161b22] rounded-xl animate-pulse border border-[#30363d]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TABLE_CONFIG.map((table) => {
                const stat = stats?.tables.find((t) => t.table === table.key);
                return (
                  <div
                    key={table.key}
                    onClick={() => setActiveTable(activeTable === table.key ? null : table.key)}
                    className={`bg-[#161b22] border rounded-xl p-4 cursor-pointer transition hover:border-[#1B5E20] ${
                      activeTable === table.key ? "border-[#1B5E20]" : "border-[#30363d]"
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${table.color}`}>
                      <table.icon className="w-4 h-4" />
                      <span className="text-xs font-medium text-[#8b949e]">{table.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stat?.count ?? 0}</p>
                    <p className="text-xs text-[#8b949e] mt-1">registros</p>
                    {table.href && (
                      <a
                        href={table.href}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 flex items-center gap-1 text-xs text-[#8BC34A] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Gestionar
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Schema reference */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8BC34A]" />
            Esquema de la Base de Datos
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
            {[
              {
                name: "users",
                fields: ["id", "uuid_publico", "openId", "nombre", "apellido", "email", "password_hash", "role", "region", "createdAt"],
              },
              {
                name: "courses",
                fields: ["id", "nivel", "titulo", "descripcion", "precio", "activo", "createdAt"],
              },
              {
                name: "modules",
                fields: ["id", "courseId", "numero", "titulo", "descripcion", "contenidoMarkdown", "pdfUrl", "pdfNombre", "activo"],
              },
              {
                name: "exam_questions",
                fields: ["id", "courseId", "moduleId", "examType", "pregunta", "opcionA-D", "respuestaCorrecta", "explicacion", "orden"],
              },
              {
                name: "course_progress",
                fields: ["id", "userId", "courseId", "estado", "notaFinal", "startedAt", "completedAt"],
              },
              {
                name: "module_progress",
                fields: ["id", "userId", "moduleId", "estado", "notaExamen", "intentos", "completedAt"],
              },
              {
                name: "certificates",
                fields: ["id", "userId", "courseLevel", "qrCode", "finalScore", "issuedAt", "expiresAt", "isValid"],
              },
            ].map((table) => (
              <div key={table.name} className="bg-[#0d1117] rounded-lg p-3">
                <p className="text-[#8BC34A] font-bold mb-2">{table.name}</p>
                <div className="space-y-0.5">
                  {table.fields.map((f) => (
                    <p key={f} className="text-[#8b949e]">  {f}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
