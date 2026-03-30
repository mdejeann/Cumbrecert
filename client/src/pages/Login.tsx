import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mountain, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("¡Bienvenido de vuelta! 🏔️");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Error al iniciar sesión. Verificá tus datos.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1A1A1A] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGwtNiAxMi02LTEyeiIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjMiLz48L2c+PC9zdmc+')]" />

      <div className="w-full max-w-sm relative z-10">
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
            <CardTitle className="text-2xl font-bold text-[#1B5E20]">Iniciar sesión</CardTitle>
            <CardDescription className="text-gray-500">
              Accedé a tus cursos y certificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Tu contraseña"
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
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold py-3 rounded-lg transition-all"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-500">
                ¿No tenés cuenta?{" "}
                <Link href="/register" className="text-[#1B5E20] font-semibold hover:underline">
                  Registrate gratis
                </Link>
              </p>
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 block">
                ← Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
