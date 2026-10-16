import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Loader2, Mountain, QrCode, XCircle } from "lucide-react";

// Verificación pública de certificados (lo que ve un guardaparque al escanear el QR)
export default function Verificar() {
  const params = useParams<{ codigo?: string }>();
  const [, navigate] = useLocation();
  const codigo = decodeURIComponent(params.codigo ?? "").toUpperCase();
  const [input, setInput] = useState(codigo);
  const { data, isLoading } = trpc.certificates.verify.useQuery({ qrCode: codigo }, { enabled: !!codigo });

  const fecha = (d?: Date | string | null) => (d ? new Date(d).toLocaleDateString("es-AR") : "—");

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex flex-col">
      <header className="bg-white border-b border-[#E8F5E9]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-[#1B5E20]">
            <Mountain className="w-5 h-5" /> CumbreCert
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <QrCode className="w-10 h-10 text-[#1B5E20] mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-[#1B5E20]">Verificación de certificado</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) navigate(`/verificar/${encodeURIComponent(input.trim().toUpperCase())}`);
          }}
          className="flex gap-2 mb-8"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Código del certificado"
            className="flex-1 border border-[#C8E6C9] rounded-full px-5 py-3 font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#8BC34A]"
          />
          <button className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold px-6 rounded-full">Verificar</button>
        </form>

        {codigo && isLoading && (
          <p className="text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Consultando…
          </p>
        )}
        {data && (
          <div className={`rounded-2xl border p-6 bg-white ${data.valid ? "border-[#8BC34A]" : "border-red-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              {data.valid ? <CheckCircle className="w-8 h-8 text-[#8BC34A]" /> : <XCircle className="w-8 h-8 text-red-500" />}
              <div>
                <p className={`text-lg font-bold ${data.valid ? "text-[#1B5E20]" : "text-red-600"}`}>
                  {data.valid ? "Certificado válido" : "expired" in data && data.expired ? "Certificado vencido" : "Certificado no válido"}
                </p>
                {"message" in data && data.message && <p className="text-sm text-gray-500">{data.message}</p>}
              </div>
            </div>
            {"certificate" in data && data.certificate && (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {"holder" in data && data.holder ? (
                  <>
                    <dt className="text-gray-500">Titular</dt>
                    <dd className="font-semibold text-gray-800">{`${data.holder.nombre ?? ""} ${data.holder.apellido ?? ""}`.trim()}</dd>
                  </>
                ) : null}
                <dt className="text-gray-500">Nivel</dt>
                <dd className="font-semibold text-gray-800">{data.certificate.levelName}</dd>
                <dt className="text-gray-500">Puntaje</dt>
                <dd className="font-semibold text-gray-800">{data.certificate.finalScore}%</dd>
                <dt className="text-gray-500">Emitido</dt>
                <dd className="font-semibold text-gray-800">{fecha(data.certificate.issuedAt)}</dd>
                <dt className="text-gray-500">Vence</dt>
                <dd className="font-semibold text-gray-800">{fecha(data.certificate.expiresAt)}</dd>
                <dt className="text-gray-500">Código</dt>
                <dd className="font-mono text-gray-800">{data.certificate.qrCode}</dd>
              </dl>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
