import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import FinalExam from "./pages/FinalExam";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminModules from "./pages/admin/AdminModules";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminDatabase from "./pages/admin/AdminDatabase";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Authenticated user routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/curso/:level/modulo/:module" component={ModulePage} />
      <Route path="/curso/:level/examen-final" component={FinalExam} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cursos" component={AdminCourses} />
      <Route path="/admin/modulos" component={AdminModules} />
      <Route path="/admin/preguntas" component={AdminQuestions} />
      <Route path="/admin/usuarios" component={AdminUsers} />
      <Route path="/admin/certificados" component={AdminCertificates} />
      <Route path="/admin/base-de-datos" component={AdminDatabase} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
