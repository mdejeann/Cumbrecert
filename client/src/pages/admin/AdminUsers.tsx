import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Shield, User, RefreshCw } from "lucide-react";

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading, refetch } = trpc.admin.getUsers.useQuery();

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Rol actualizado"); utils.admin.getUsers.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-[#8BC34A]" />
              Usuarios Registrados
            </h1>
            <p className="text-[#8b949e] mt-1">Gestioná los usuarios y sus roles en la plataforma.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d] transition text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#161b22] rounded-lg animate-pulse border border-[#30363d]" />)}
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <span className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">{users?.length ?? 0} usuarios registrados</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-[#8b949e]">
                  <th className="text-left px-4 py-3 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Registrado</th>
                  <th className="text-left px-4 py-3 font-medium">Rol</th>
                  <th className="text-right px-4 py-3 font-medium">Cambiar Rol</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id} className="border-b border-[#30363d] last:border-0 hover:bg-[#21262d] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {(u.nombre ?? u.email ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{u.nombre} {u.apellido}</p>
                          <p className="text-xs text-[#8b949e] font-mono">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8b949e]">{u.email}</td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-AR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium w-fit ${
                        u.role === "admin" ? "bg-yellow-500/10 text-yellow-400" : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role === "admin" ? "Admin" : "Usuario"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          const newRole = u.role === "admin" ? "user" : "admin";
                          if (confirm(`¿Cambiar rol de ${u.nombre} a ${newRole}?`)) {
                            updateRoleMutation.mutate({ userId: u.id, role: newRole });
                          }
                        }}
                        disabled={updateRoleMutation.isPending}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:border-[#1B5E20] hover:text-white transition disabled:opacity-50"
                      >
                        {u.role === "admin" ? "→ Usuario" : "→ Admin"}
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
