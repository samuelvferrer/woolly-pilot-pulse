import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import VisaoGeral from "./pages/Index";
import Escola from "./pages/Escola";
import Turma from "./pages/Turma";
import Aluno from "./pages/Aluno";
import Alertas from "./pages/Alertas";
import AnaliseLoop from "./pages/AnaliseLoop";
import Inteligencia from "./pages/Inteligencia";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<VisaoGeral />} />
            <Route path="/escola/:escolaId" element={<Escola />} />
            <Route path="/turma/:turmaId" element={<Turma />} />
            <Route path="/aluno/:alunoId" element={<Aluno />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/loop" element={<AnaliseLoop />} />
            <Route path="/inteligencia" element={<Inteligencia />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
