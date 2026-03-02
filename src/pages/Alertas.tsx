import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import type { DashboardAlerta } from "@/types/dashboard";
import { AlertCard } from "@/components/AlertCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { CheckCircle } from "lucide-react";

export default function Alertas() {
  const { data: alertas, loading, error, refetch } = useSupabaseQuery<DashboardAlerta>("v_dashboard_alertas");

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const sorted = alertas ? [...alertas].sort((a, b) => (a.severidade === "alto" ? -1 : 1) - (b.severidade === "alto" ? -1 : 1)) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-foreground">Alertas</h1>
        {sorted.length > 0 && (
          <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-destructive px-2 text-xs font-bold text-destructive-foreground">
            {sorted.length}
          </span>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((alerta, i) => (
            <AlertCard
              key={i}
              alunoNome={alerta.aluno_nome}
              turmaNome={alerta.turma_nome}
              qesTotal={alerta.qes_total}
              qesFaixa={alerta.qes_faixa}
              tipoAlerta={alerta.tipo_alerta}
              severidade={alerta.severidade}
              acaoSugerida={alerta.acao_sugerida}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle}
          title="Nenhum alerta ativo"
          description="Tudo sob controle. Seus pilotos estão indo bem!"
          iconColor="#2E7D32"
        />
      )}
    </div>
  );
}
