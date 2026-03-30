import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  Award,
  Database,
  LogOut,
  ChevronRight,
  Mountain,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/modulos", label: "Módulos", icon: FileText },
  { href: "/admin/preguntas", label: "Preguntas de Examen", icon: HelpCircle },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/certificados", label: "Certificados", icon: Award },
  { href: "/admin/base-de-datos", label: "Base de Datos", icon: Database },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: () => toast.error("Error al cerrar sesión"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-[#8BC34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="text-center text-white max-w-md px-6">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
          <p className="text-gray-400 mb-6">
            {!isAuthenticated
              ? "Debés iniciar sesión con una cuenta de administrador."
              : "Tu cuenta no tiene permisos de administrador."}
          </p>
          <Link href="/login">
            <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0f1117] text-white">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#161b22] border-r border-[#30363d] flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[#30363d]">
          <Link href="/">
            <div className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-8 h-8 bg-[#1B5E20] rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">CumbreCert</p>
                <p className="text-xs text-[#8BC34A] font-medium">Panel Admin</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location === item.href
              : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer group",
                    isActive
                      ? "bg-[#1B5E20] text-white"
                      : "text-[#8b949e] hover:bg-[#21262d] hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#8BC34A]" : "text-[#8b949e] group-hover:text-white")} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-[#8BC34A]" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-[#30363d]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user.nombre?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-[#8b949e] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#8b949e] hover:bg-[#21262d] hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
