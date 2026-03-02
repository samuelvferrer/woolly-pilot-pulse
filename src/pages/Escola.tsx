import { useParams, useNavigate } from "react-router-dom";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import type { DashboardEscola, DashboardTurma } from "@/types/dashboard";
import { StatCard } from "@/components/StatCard";
import { QesBadge } from "@/components/QesBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Users, TrendingUp, School, RefreshCw } from "lucide-react";
import { getQesColor, getQesFaixa } from "@/lib/qes";

export default function Escola() {
  const { escolaId } = useParams<{ escolaId: string }>();
  const navigate = useNavigate();

  const { data: escolas, loading: l1, error: e1, refetch: r1 } = useSupabaseQuery<DashboardEscola>(
    "v_dashboard_escola",
    { escola_id: escolaId }
  );
  const { data: turmas, loading: l2, error: e2, refetch: r2 } = useSupabaseQuery<DashboardTurma>(
    "v_dashboard_turma"
  );

  const loading = l1 || l2;
  const error = e1 || e2;

  if (error) return <ErrorState message={error} onRetry={() => { r1(); r2(); }} />;

  const escola = escolas?.[0];
  const turmasEscola = turmas?.filter((t) => t.escola_nome === escola?.escola_nome) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">
        {loading ? "Carregando..." : escola?.escola_nome || "Escola"}
      </h1>

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : escola ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total de Alunos" value={escola.total_alunos} icon={Users} subtitle="nesta escola" />
            <StatCard title="QES Médio" value={escola.qes_medio.toFixed(1)} icon={TrendingUp} iconColor={getQesColor(escola.qes_medio)} valueColor={getQesColor(escola.qes_medio)} subtitle={getQesFaixa(escola.qes_medio)} />
            <StatCard title="Em Risco" value={escola.alunos_criticos + escola.alunos_superficiais} icon={School} iconColor="#C62828" subtitle={`${escola.alunos_criticos} críticos, ${escola.alunos_superficiais} superficiais`} />
            <StatCard title="Taxa Loop" value={`${escola.taxa_loop_media.toFixed(1)}%`} icon={RefreshCw} valueColor={escola.taxa_loop_media < 60 ? "#C62828" : undefined} subtitle="meta: >60%" />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-4">Turmas</h2>
            {turmasEscola.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Turma</th>
                    <th className="pb-2 font-medium text-muted-foreground">Série</th>
                    <th className="pb-2 font-medium text-muted-foreground">QES Médio</th>
                    <th className="pb-2 font-medium text-muted-foreground">Alunos</th>
                    <th className="pb-2 font-medium text-muted-foreground">Sessões</th>
                  </tr>
                </thead>
                <tbody>
                  {turmasEscola.map((turma) => (
                    <tr key={turma.turma_id} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/turma/${turma.turma_id}`)}>
                      <td className="py-2.5 font-medium">{turma.turma_nome}</td>
                      <td className="py-2.5 text-muted-foreground">{turma.serie}</td>
                      <td className="py-2.5"><QesBadge qes={turma.qes_medio} showValue /></td>
                      <td className="py-2.5 text-muted-foreground">{turma.total_alunos}</td>
                      <td className="py-2.5 text-muted-foreground">{turma.total_sessoes_turma}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState icon={Users} title="Nenhuma turma encontrada" />
            )}
          </div>
        </>
      ) : (
        <EmptyState icon={School} title="Escola não encontrada" />
      )}
    </div>
  );
}
