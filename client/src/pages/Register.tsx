import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mountain, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    region: "",
  });

  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("¡Cuenta creada! Bienvenido a CumbreCert 🏔️");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Error al registrarse. Intentá de nuevo.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    register.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1A1A1A] flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGwtNiAxMi02LTEyeiIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjMiLz48L2c+PC9zdmc+')]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-[#8BC34A] rounded-full flex items-center justify-center shadow-lg">
              <Mountain className="w-7 h-7 text-[#1A1A1A]" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CumbreCert</span>
          </Link>
          <p className="text-green-200 mt-2 text-sm">Subí libre, subí seguro.</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-[#1B5E20]">Crear cuenta</CardTitle>
            <CardDescription className="text-gray-500">
              Comenzá tu certificación de montaña gratis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="border-gray-200 focus:border-[#1B5E20] focus:ring-[#1B5E20]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="apellido" className="text-sm font-medium text-gray-700">Apellido</Label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                    className="border-gray-200 focus:border-[#1B5E20] focus:ring-[#1B5E20]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-gray-200 focus:border-[#1B5E20] focus:ring-[#1B5E20]"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="border-gray-200 focus:border-[#1B5E20] focus:ring-[#1B5E20] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          formData.password.length >= (i + 1) * 3
                            ? formData.password.length >= 12 ? "bg-[#8BC34A]" : "bg-yellow-400"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">¿Dónde salís a la montaña?</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, region: val })}>
                  <SelectTrigger className="border-gray-200 focus:border-[#1B5E20]">
                    <SelectValue placeholder="Seleccioná tu región" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patagonia">Patagonia (Bariloche, El Chaltén)</SelectItem>
                    <SelectItem value="cuyo">Cuyo (Mendoza, San Juan)</SelectItem>
                    <SelectItem value="noa">NOA (Salta, Jujuy, Tucumán)</SelectItem>
                    <SelectItem value="cordoba">Córdoba</SelectItem>
                    <SelectItem value="pampeana">Pampeana (Sierra de la Ventana)</SelectItem>
                    <SelectItem value="litoral">Litoral / Mesopotamia</SelectItem>
                    <SelectItem value="extranjero">Extranjero</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Benefits list */}
              <div className="bg-[#F1F8E9] rounded-lg p-3 space-y-2">
                {[
                  "Nivel Inicial completamente gratis",
                  "Certificado QR verificable al aprobar",
                  "Acceso a todos los módulos de formación",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-[#1B5E20]">
                    <CheckCircle className="w-4 h-4 text-[#8BC34A] flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                disabled={register.isPending}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-3 rounded-lg transition-all"
              >
                {register.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta gratis"
                )}
              </Button>

              <p className="text-center text-xs text-gray-400">
                Al registrarte aceptás nuestros{" "}
                <a href="#" className="text-[#1B5E20] hover:underline">Términos y condiciones</a>
              </p>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="text-[#1B5E20] font-semibold hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
