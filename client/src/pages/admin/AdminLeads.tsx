import { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Download, Megaphone, RefreshCw } from "lucide-react";

const LABELS: Record<string, string> = {
  newsletter: "Newsletter / lista de espera",
  colaborar: "Colaboración",
  clubes: "Clubes y empresas",
  guias: "Guías y refugios",
};

// Contactos captados desde el landing: base para campañas y ventas a organizaciones
export default function AdminLeads() {
  const { data: leads, isLoading, refetch } = trpc.admin.getLeads.useQuery();
  const [filter, setFilter] = useState<string>("todos");

  const rows = useMemo(() => (leads ?? []).filter((l) => filter === "todos" || l.interes === filter), [leads, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (leads ?? []).forEach((l) => (c[l.interes] = (c[l.interes] ?? 0) + 1));
    return c;
  }, [leads]);

  const exportCsv = () => {
    const header = ["fecha", "email", "nombre", "region", "interes", "mensaje"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [header.join(","), ...rows.map((l) => [new Date(l.createdAt).toISOString(), l.email, l.nombre, l.region, l.interes, l.mensaje].map(esc).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `leads-cumbrecert-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-[#8BC34A]" />
              Leads y contactos
            </h1>
            <p className="text-[#8b949e] mt-1">Personas que dejaron sus datos en el sitio.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d] transition text-sm">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] text-white hover:bg-[#2E7D32] transition text-sm">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(LABELS).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(filter === k ? "todos" : k)}
              className={`text-left p-4 rounded-xl border transition ${filter === k ? "border-[#8BC34A] bg-[#1B5E20]/20" : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"}`}
            >
              <p className="text-2xl font-bold text-white">{counts[k] ?? 0}</p>
              <p className="text-xs text-[#8b949e]">{label}</p>
            </button>
          ))}
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8b949e] border-b border-[#30363d]">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Interés</th>
                <th className="px-4 py-3 font-medium">Región</th>
                <th className="px-4 py-3 font-medium">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[#8b949e]">Cargando…</td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[#8b949e]">Todavía no hay contactos.</td>
                </tr>
              )}
              {rows.map((l) => (
                <tr key={l.id} className="border-b border-[#30363d] last:border-0 text-[#c9d1d9]">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString("es-AR")}</td>
                  <td className="px-4 py-3"><a href={`mailto:${l.email}`} className="text-[#8BC34A] hover:underline">{l.email}</a></td>
                  <td className="px-4 py-3">{l.nombre ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{LABELS[l.interes] ?? l.interes}</td>
                  <td className="px-4 py-3">{l.region ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={l.mensaje ?? ""}>{l.mensaje ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
