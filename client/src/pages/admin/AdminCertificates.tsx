import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Award, RefreshCw, ExternalLink } from "lucide-react";

export default function AdminCertificates() {
  const { data: certs, isLoading, refetch } = trpc.admin.getAllCertificates.useQuery();

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Award className="w-6 h-6 text-[#8BC34A]" />
              Certificados Emitidos
            </h1>
            <p className="text-[#8b949e] mt-1">Todos los certificados generados por la plataforma.</p>
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
        ) : certs?.length === 0 ? (
          <div className="text-center py-16 text-[#8b949e]">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay certificados emitidos todavía.</p>
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#30363d]">
              <span className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">{certs?.length ?? 0} certificados emitidos</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-[#8b949e]">
                  <th className="text-left px-4 py-3 font-medium">Usuario ID</th>
                  <th className="text-left px-4 py-3 font-medium">Nivel</th>
                  <th className="text-left px-4 py-3 font-medium">Nota Final</th>
                  <th className="text-left px-4 py-3 font-medium">Código QR</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Vence</th>
                </tr>
              </thead>
              <tbody>
                {certs?.map((cert) => (
                  <tr key={cert.id} className="border-b border-[#30363d] last:border-0 hover:bg-[#21262d] transition">
                    <td className="px-4 py-3 text-[#8b949e] font-mono text-xs">#{cert.userId}</td>
                    <td className="px-4 py-3">
                      <span className="bg-[#1B5E20] text-white text-xs font-bold px-2 py-1 rounded">N{cert.courseLevel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${cert.finalScore >= 70 ? "text-[#8BC34A]" : "text-red-400"}`}>
                        {cert.finalScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#8b949e]">{cert.qrCode.substring(0, 16)}...</span>
                        <a
                          href={`/verificar/${cert.qrCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8BC34A] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">
                      {new Date(cert.issuedAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">
                      {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString("es-AR") : "—"}
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
