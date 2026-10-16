import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type LeadInterest = "newsletter" | "colaborar" | "clubes" | "guias";

const COPY: Record<LeadInterest, { title: string; description: string; cta: string; placeholder: string }> = {
  newsletter: {
    title: "Avisame cuando salga",
    description: "Te escribimos cuando abramos este curso. Sin spam.",
    cta: "Quiero enterarme",
    placeholder: "¿Qué te gustaría aprender? (opcional)",
  },
  colaborar: {
    title: "Sumate como colaborador",
    description: "Con tu colaboración sostenemos contenidos gratuitos y nuevos cursos. Te contamos cómo participar.",
    cta: "Quiero colaborar",
    placeholder: "¿Algo que quieras contarnos? (opcional)",
  },
  clubes: {
    title: "CumbreCert para clubes y empresas",
    description: "Certificá a tu equipo, socios o clientes con un panel de seguimiento y certificados a tu nombre.",
    cta: "Pedir propuesta",
    placeholder: "Contanos sobre tu club, agencia o empresa y cuántas personas serían",
  },
  guias: {
    title: "Programa de guías y refugios",
    description: "Recomendá CumbreCert a tus clientes, aparecé en el directorio y dictá los niveles avanzados.",
    cta: "Quiero ser partner",
    placeholder: "Tu certificación (AAGM, ISAGM…) y zona donde trabajás",
  },
};

export function LeadDialog({
  open,
  onOpenChange,
  interes,
  contexto,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interes: LeadInterest;
  contexto?: string; // p. ej. el curso por el que pregunta
}) {
  const copy = COPY[interes];
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sent, setSent] = useState(false);
  const create = trpc.leads.create.useMutation({
    onSuccess: () => setSent(true),
    onError: () => toast.error("No pudimos guardar tus datos. Probá de nuevo."),
  });

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(() => setSent(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-[#8BC34A] mx-auto mb-3" />
            <p className="text-lg font-bold text-[#1B5E20]">¡Listo, te escribimos pronto!</p>
            <p className="text-sm text-gray-500 mt-1">Revisá tu correo en los próximos días.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#1B5E20]">{copy.title}</DialogTitle>
              <DialogDescription>{copy.description}</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate({
                  email,
                  nombre: nombre || undefined,
                  interes,
                  mensaje: [contexto, mensaje].filter(Boolean).join(" — ") || undefined,
                });
              }}
            >
              <Input placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <Input type="email" required placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Textarea placeholder={copy.placeholder} value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={3} />
              <Button type="submit" disabled={create.isPending} className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold">
                {create.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {copy.cta}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
