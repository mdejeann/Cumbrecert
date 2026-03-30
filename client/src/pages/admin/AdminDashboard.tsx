import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Users, BookOpen, Award, Database, FileText, HelpCircle, TrendingUp, RefreshCw } from "lucide-react";
import { Link } from "wouter";

const TABLE_ICONS: Record<string, React.ReactNode> = {
  users: <Users className="w-5 h-5" />,
  courses: <BookOpen className="w-5 h-5" />,
  modules: <FileText className="w-5 h-5" />,
  exam_questions: <HelpCircle className="w-5 h-5" />,
  course_progress: <TrendingUp className="w-5 h-5" />,
  module_progress: <TrendingUp className="w-5 h-5" />,
  certificates: <Award className="w-5 h-5" />,
};

const TABLE_LABELS: Record<string, string> = {
  users: "Usuarios",
  courses: "Cursos",
  modules: "Módulos",
  exam_questions: "Preguntas de Examen",
  course_progress: "Progreso de Cursos",
  module_progress: "Progreso de Módulos",
  certificates: "Certificados",
};

const QUICK_LINKS = [
  { href: "/admin/cursos", label: "Gestionar Cursos", icon: BookOpen, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { href: "/admin/modulos", label: "Gestionar Módulos", icon: FileText, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { href: "/admin/preguntas", label: "Editar Preguntas", icon: HelpCircle, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { href: "/admin/usuarios", label: "Ver Usuarios", icon: Users, color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { href: "/admin/certificados", label: "Ver Certificados", icon: Award, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { href: "/admin/base-de-datos", label: "Base de Datos", icon: Database, color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch } = trpc.admin.getStats.useQuery();

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="text-[#8b949e] mt-1">Gestioná cursos, módulos, preguntas y usuarios de CumbreCert.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d] transition text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* DB Stats Grid */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Estado de la Base de Datos
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-24 bg-[#161b22] rounded-lg animate-pulse border border-[#30363d]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.tables.map((t) => (
                <div key={t.table} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#1B5E20] transition">
                  <div className="flex items-center gap-2 text-[#8b949e] mb-2">
                    {TABLE_ICONS[t.table] ?? <Database className="w-5 h-5" />}
                    <span className="text-xs font-medium">{TABLE_LABELS[t.table] ?? t.table}</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{t.count}</p>
                  <p className="text-xs text-[#8b949e] mt-1">registros</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className={`border rounded-lg p-5 cursor-pointer hover:scale-[1.02] transition-all ${link.color}`}>
                  <link.icon className="w-6 h-6 mb-3" />
                  <p className="font-semibold text-sm">{link.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
